/* eslint-disable no-restricted-globals */

const version = 1;
let clients = [];
let status = '';
let timeout;
let current = {
  expiresAt: null,
  token: null
};

// TODO: consider using the name as a security mechanism?

const onmessage = (event) => {
  log('Message received from page', event.data);
  const type = event.data?.type;
  switch (type) {
    case 'CONNECT':
      log(`Status: "${status}"`);
      if (status === 'active') {
        event.target.postMessage(createTokenMessage());
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
      broadcast(createUnauthenticatedMessage(), event.target);
      break;
    case 'DISCONNECT':
      log('Client disconnected');
      clients = clients.filter((client) => client !== event.target);
      break;
    default:
      break;
  }
};

const createUnauthenticatedMessage = () => ({ type: 'SW_UNAUTHENTICATED', meta: { version } });

const createTokenMessage = () => ({ type: 'SW_TOKEN', payload: current, meta: { version } });

const fromExpiresAtString = (expiresAt) => new Date(expiresAt).getTime();

function retrieve() {
  clearTimeout(timeout);
  return fetch('/studio/refresh.json')
    .then((r) => (r.headers.get('Content-Type')?.includes('application/json') ? r.json() : null))
    .then((response) => {
      if (response) {
        log('New token received');
        status = 'active';
        current = {
          expiresAt: fromExpiresAtString(response.expiresAt),
          token: response.token
        };
        broadcast(createTokenMessage());
        const ms = Math.floor((current.expiresAt - Date.now()) * 0.8);
        if (clients.length) {
          // If there are clients connected, keep the token refresh going
          timeout = setTimeout(retrieve, ms);
        } else {
          // Assuming SharedWorker auto-dies when all connections are terminated.
          timeout = setTimeout(retrieve, ms);
        }
      } else {
        log(`Auth has expired`);
        status = 'expired';
        broadcast(createUnauthenticatedMessage());
      }
      return current;
    })
    .catch((e) => {
      log('Error retrieving token', e);
      status = 'error';
      broadcast({ type: 'SW_ERROR', payload: e });
    });
}

function broadcast(message, excludedClient) {
  (excludedClient ? clients.filter((client) => client !== excludedClient) : clients).forEach((client) => {
    client.postMessage(message);
  });
}

function log(message, ...args) {
  console.log(`%c[SharedWorker(v${version})] ${message}.`, 'color: #0071A4', ...args);
}

log(`SharedWorker v${version} loaded.`);

self.onconnect = (e) => {
  const port = e.ports[0];
  clients.push(port);
  port.onmessage = onmessage;
};
