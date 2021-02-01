/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { obtainAuthToken, ObtainAuthTokenResponse } from './services/auth';
import StandardAction from './models/StandardAction';
import { sharedWorkerError, sharedWorkerToken, sharedWorkerUnauthenticated } from './state/actions/auth';
import { AjaxError } from 'rxjs/ajax';

declare const self: SharedWorkerGlobalScope;

export type SharedWorkerStatus = '' | 'active' | 'expired' | 'error';

let clients: MessagePort[] = [];
let status: SharedWorkerStatus = '';
let timeout: number;
let current: ObtainAuthTokenResponse = {
  expiresAt: null,
  token: null
};

// TODO: consider using the name as a security mechanism?

function onmessage(event) {
  log('Message received from page', event.data);
  const type = event.data?.type;
  switch (type) {
    case 'CONNECT':
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
    case 'REFRESH':
      retrieve();
      break;
    case 'TIMEOUT':
      clearTimeout(timeout);
      status = 'expired';
      break;
    case 'LOGOUT':
      clearTimeout(timeout);
      status = 'expired';
      broadcast(sharedWorkerUnauthenticated(), event.target);
      break;
    case 'DISCONNECT':
      log('Client disconnected');
      clients = clients.filter((client) => client !== event.target);
      break;
    default:
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
        const ms = Math.floor((current.expiresAt - Date.now()) * 0.8);
        if (clients.length) {
          // If there are clients connected, keep the token refresh going
          timeout = self.setTimeout(retrieve, ms);
        } else {
          // Assuming SharedWorker auto-dies when all connections are terminated.
          timeout = self.setTimeout(retrieve, ms);
        }
      } else {
        log(`Auth has expired`);
        status = 'expired';
        broadcast(sharedWorkerUnauthenticated());
      }
      return current;
    },
    (e: AjaxError) => {
      log('Error retrieving token', e);
      status = 'error';
      broadcast(sharedWorkerError({ status: e.status, message: e.message }));
    }
  );
}

function broadcast(message: StandardAction, excludedClient?: MessagePort) {
  (excludedClient ? clients.filter((client) => client !== excludedClient) : clients).forEach((client) => {
    client.postMessage(message);
  });
}

function log(message, ...args) {
  console.log(`%c[SharedWorker] ${message}.`, 'color: #0071A4', ...args);
}

self.onconnect = (e) => {
  const port = e.ports[0];
  clients.push(port);
  port.onmessage = onmessage;
};
