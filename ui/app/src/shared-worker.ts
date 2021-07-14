/// <reference lib="webworker" />

import { obtainAuthToken, ObtainAuthTokenResponse } from './services/auth';
import StandardAction from './models/StandardAction';
import {
  logout,
  refreshAuthToken,
  sharedWorkerConnect,
  sharedWorkerDisconnect,
  sharedWorkerError,
  sharedWorkerTimeout,
  sharedWorkerToken,
  sharedWorkerUnauthenticated
} from './state/actions/auth';
import { AjaxError } from 'rxjs/ajax';

declare const self: SharedWorkerGlobalScope;

export type SharedWorkerStatus = '' | 'active' | 'expired' | 'error';

const refreshAtFactor = 0.5;
let clients: MessagePort[] = [];
let status: SharedWorkerStatus = '';
let timeout: number;
let current: ObtainAuthTokenResponse = {
  expiresAt: null,
  token: null
};
let refreshInterval;

const log =
  process.env.PRODUCTION === 'development'
    ? (message, ...args) => console.log(`%c[SharedWorker] ${message}.`, 'color: #0071A4', ...args)
    : () => void 0;

function onmessage(event) {
  log('Message received from page', event.data);
  if (self.name !== 'authWorker') {
    // Using name as an additional security mechanism
    return;
  }
  const type = event.data?.type;
  switch (type) {
    case sharedWorkerConnect.type:
      log(`Status: "${status}"`);
      if (status === 'active') {
        event.target.postMessage(sharedWorkerToken(current));
      } /* else if (status === 'error' || status === 'expired' || status === '') */ else {
        // If an error occurred or auth expired, need to retry/retrieve upon new connections.
        // Otherwise, the worker may end up staying 'dirty' when one tab expires, dies and
        // another comes in later after having logged in properly.
        retrieve();
      }
      break;
    case refreshAuthToken.type:
      retrieve();
      break;
    case sharedWorkerTimeout.type:
      clearTimeout(timeout);
      status = 'expired';
      break;
    case logout.type:
      clearTimeout(timeout);
      status = 'expired';
      broadcast(sharedWorkerUnauthenticated(), event.target);
      break;
    case sharedWorkerDisconnect.type:
      log('Client disconnected');
      clients = clients.filter((client) => client !== event.target);
      break;
    default:
      log(`Received unknown action: "${type}"`);
      break;
  }
}

function retrieve() {
  clearTimeout(timeout);
  return obtainAuthToken().subscribe(
    (response) => {
      if (response) {
        log('New token received');
        status = 'active';
        current = response;
        broadcast(sharedWorkerToken(current));
        refreshInterval = Math.floor((current.expiresAt - Date.now()) * refreshAtFactor);
        if (clients.length) {
          // If there are clients connected, keep the token refresh going
          timeout = self.setTimeout(retrieve, refreshInterval);
        } else {
          // Do SharedWorkers stop as soon as all their tabs are terminated?
          clearTimeout(timeout);
        }
      } else {
        log(`Auth has expired`);
        status = 'expired';
        broadcast(sharedWorkerUnauthenticated());
      }
      return current;
    },
    (e: AjaxError) => {
      clearTimeout(timeout);
      log('Error retrieving token', e);
      if (e.status === 401) {
        status = 'expired';
        broadcast(sharedWorkerUnauthenticated());
      } else {
        status = 'error';
        broadcast(sharedWorkerError({ status: e.status, message: e.message }));
        // If there are clients connected try again.
        if (clients.length) {
          timeout = self.setTimeout(retrieve, Math.floor(refreshInterval * 0.9));
        }
      }
    }
  );
}

function broadcast(message: StandardAction, excludedClient?: MessagePort) {
  (excludedClient ? clients.filter((client) => client !== excludedClient) : clients).forEach((client) => {
    client.postMessage(message);
  });
}

self.onconnect = (e) => {
  const port = e.ports[0];
  clients.push(port);
  port.onmessage = onmessage;
};
