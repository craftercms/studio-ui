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
import { SHARED_WORKER_NAME, XSRF_TOKEN_HEADER_NAME } from './utils/constants';
import { Client, StompSubscription } from '@stomp/stompjs';
import { emitSystemEvent, globalSocketStatus, openSiteSocket, siteSocketStatus } from './state/actions/system';

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
let isRetrieving = false;
let isProduction = process.env.PRODUCTION !== 'development';
let siteSocketClient: Client;
let rootSocketClient: Client;

const log = !isProduction ? (message, ...args) => console.log(`%c${message}`, 'color: #0071A4', ...args) : () => void 0;

function onmessage(event) {
  log('Message received from page', event.data);
  if (self.name !== SHARED_WORKER_NAME) {
    // Using name as an additional security mechanism
    return;
  }
  const type = event.data?.type;
  switch (type) {
    // A new app window has connected to the worker.
    case sharedWorkerConnect.type:
      log(`A client has connected. Status is "${status}"`);
      const xsrfToken = event.data.payload?.xsrfToken;
      // There's a sharedWorker connection from studio and from XB, we only open the root topic socket when connecting
      // from studio.
      if (xsrfToken) {
        // Open the root topic socket.
        openSocket({ site: null, xsrfToken: event.data.payload.xsrfToken });
      }
      if (status === 'active') {
        event.target.postMessage(sharedWorkerToken(current));
      } /* else if (status === 'error' || status === 'expired' || status === '') */ else {
        // If an error occurred or auth expired, need to retry/retrieve upon new connections.
        // Otherwise, the worker may end up staying 'dirty' when one tab expires, dies and
        // another comes in later after having logged in properly.
        clearCurrent();
        retrieve();
      }
      break;
    // After login (from session timeout), the app sends this event for the worker to
    // get a fresh token and continue session.
    case refreshAuthToken.type:
      log('App requested token refresh');
      clearCurrent();
      openSocket({ site: null, xsrfToken: event.data.payload.xsrfToken });
      retrieve();
      break;
    // The user logged out.
    case logout.type:
    // The app received a 401 and it's reporting the session timeout.
    // eslint-disable-next-line no-fallthrough
    case sharedWorkerTimeout.type:
      if (type === logout.type) {
        log('User has logged out');
      } else {
        log('App reported session timeout');
      }
      clearCurrent();
      unauthenticated(event.target);
      break;
    // An app window disconnected from the worker.
    case sharedWorkerDisconnect.type:
      log('Client disconnected');
      clients = clients.filter((client) => client !== event.target);
      break;
    case openSiteSocket.type:
      openSocket(event.data.payload);
      break;
    default:
      log(`Received unknown action: "${type}"`);
      break;
  }
}

function clearCurrent() {
  status = '';
  current.token = null;
  current.expiresAt = null;
}

function isExpired(time = Date.now()) {
  return current.expiresAt !== null && time >= current.expiresAt;
}

function unauthenticated(excludeClient?: MessagePort) {
  log(`Auth has expired.`);
  clearTimeout(timeout);
  status = 'expired';
  siteSocketClient?.deactivate();
  rootSocketClient?.deactivate();
  broadcast(sharedWorkerUnauthenticated(), excludeClient);
}

function retrieve() {
  clearTimeout(timeout);
  if (!isRetrieving) {
    isRetrieving = true;
    return obtainAuthToken().subscribe({
      next(response) {
        isRetrieving = false;
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
          unauthenticated();
        }
        return current;
      },
      error(e: AjaxError) {
        isRetrieving = false;
        clearTimeout(timeout);
        log('Error retrieving token', e);
        if (e.status === 401) {
          unauthenticated();
        } else {
          status = 'error';
          broadcast(sharedWorkerError({ status: e.status, message: e.message }));
          // If there are clients connected try again.
          if (clients.length) {
            timeout = self.setTimeout(retrieve, Math.floor(refreshInterval * 0.9));
          }
        }
      }
    });
  }
}

function broadcast(message: StandardAction, excludedClient?: MessagePort) {
  (excludedClient ? clients.filter((client) => client !== excludedClient) : clients).forEach((client) => {
    client.postMessage(message);
  });
}

function openSocket({ site, xsrfToken }) {
  let isSiteSocket = !!site;
  let socketClient = isSiteSocket ? siteSocketClient : rootSocketClient;
  socketClient?.deactivate();
  let subscription: StompSubscription;
  let protocol = self.location.protocol === 'https:' ? 'wss' : 'ws';
  let broadcastConnection = (connected: boolean) =>
    broadcast(isSiteSocket ? siteSocketStatus({ siteId: site, connected }) : globalSocketStatus({ connected }));
  socketClient = new Client({
    brokerURL: `${protocol}://${isProduction ? self.location.host : 'localhost:8080'}/studio/events`,
    ...(!isProduction && { debug: log }),
    connectHeaders: { [XSRF_TOKEN_HEADER_NAME]: xsrfToken },
    onConnect() {
      broadcastConnection(true);
      const topicUrl = isSiteSocket ? `/topic/studio/${site}` : '/topic/studio';
      subscription = socketClient.subscribe(topicUrl, (message) => {
        if (message.body) {
          if (message.headers['content-type'] === 'application/json') {
            const payload = JSON.parse(message.body);
            const action = { type: payload.eventType, payload };
            broadcast(emitSystemEvent(action));
          } else {
            log(
              `Received an non-json message from websocket. Content type header value was ${message.headers['content-type']}`
            );
          }
        } else {
          log('Received an empty message from websocket.');
        }
      });
    },
    onStompError() {
      // Will be invoked in case of error encountered at Broker
      // Bad login/passcode typically will cause an error
      broadcastConnection(false);
    },
    onWebSocketError() {
      broadcastConnection(false);
    },
    onDisconnect() {
      subscription?.unsubscribe();
      log(isSiteSocket ? `Site socket for "${site}" disconnected` : 'Global socket disconnected');
    }
  });
  socketClient.activate();
  if (isSiteSocket) {
    siteSocketClient = socketClient;
  } else {
    rootSocketClient = socketClient;
  }
}

self.onconnect = (e) => {
  const port = e.ports[0];
  clients.push(port);
  port.onmessage = onmessage;
};
