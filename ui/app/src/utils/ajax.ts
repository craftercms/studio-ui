import { ajax } from 'rxjs/ajax';

const HEADERS = {};
export const OMIT_GLOBAL_HEADERS = {};

export function setGlobalHeaders(props: object) {
  Object.assign(HEADERS, props);
}

export function getGlobalHeaders() {
  return { ...HEADERS };
}

/* private */ function mergeHeaders(headers: object = {}) {
  if (headers === OMIT_GLOBAL_HEADERS) {
    return null;
  } else if (Object.values(headers).includes(OMIT_GLOBAL_HEADERS)) {
    return headers;
  }
  return Object.assign({}, HEADERS, headers);
}

export function get(url: string, headers: object = {}) {
  return ajax.get(url, mergeHeaders(headers));
}

export function post(url: string, body: any, headers: object = {}) {
  return ajax.post(url, body, mergeHeaders(headers));
}

export function patch(url: string, body: any, headers: object = {}) {
  return ajax.patch(url, body, mergeHeaders(headers));
}

export function put(url: string, body: any, headers: object = {}) {
  return ajax.put(url, body, mergeHeaders(headers));
}

export function del(url: string, headers: object = {}) {
  return ajax.delete(url, mergeHeaders(headers));
}
