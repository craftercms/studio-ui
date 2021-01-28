/* eslint-disable no-restricted-globals */

// TODO:
//   - Convert to TypeScript.
//   - Currently declaring globals (which can be accessed via dev tools).

const version = 1;

let status = '';

let timeout;

let current = {
  expiresAt: null,
  token: null
};

const createUnauthenticatedMessage = () => ({ type: 'SW_UNAUTHENTICATED', meta: { version } });

const createTokenMessage = () => ({ type: 'SW_TOKEN', payload: current, meta: { version } });

const fromExpiresAtString = (expiresAt) => new Date(expiresAt).getTime();

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(retrieve());
  log('install event');
});

self.addEventListener('activate', () => {
  log('activate event');
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  log('Message received from page', event.data);
  const type = event.data?.type;
  switch (type) {
    case 'CONNECT':
      log(`Status: ${status}`);
      if (status === 'active') {
        event.source.postMessage(createTokenMessage());
      } /* if (status === 'error' || status === 'expired' || status === '') */ else {
        if (status === '') {
          // This probably means we're receiving a message before installation has finished. In any case,
          // is not intended and we would need to check why/how/when this happens.
          console.error('[SW] Service worker had unset status upon client connection. Please check.');
        }
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
    default:
      break;
  }
});

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
        getClients().then((clients) => {
          const ms = Math.floor((current.expiresAt - Date.now()) * 0.8);
          if (clients.length) {
            // If there are clients connected, keep the token refresh going
            timeout = setTimeout(retrieve, ms);
          } else {
            // If there aren't any clients, wait for token timeout and stop the thread
            // if by then there still aren't any clients.
            timeout = setTimeout(() => {
              getClients().then((c) => {
                if (c.length) {
                  // If there are clients, restart loop.
                  retrieve();
                } else {
                  // If there aren't any clients, mark as expired.
                  status = 'expired';
                }
              });
            }, ms);
          }
        });
      } else {
        log(`Auth has expired.`);
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

function broadcast(message) {
  getClients().then((clients) => {
    clients.forEach((client) => {
      client.postMessage(message);
    });
  });
}

function getClients() {
  return self.clients.matchAll({ includeUncontrolled: true });
}

function log(message, ...args) {
  console.log(`%c[ServiceWorker] ${message}.`, 'color: #0071A4', ...args);
}

log(`Worker v${version} loaded.`);
