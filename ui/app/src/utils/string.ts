/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export function camelize(str: string) {
  return str.replace(/-+(.)?/g, function (match, chr) {
    return chr ? chr.toUpperCase() : '';
  });
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
}

export function underscore(str: string) {
  return str.replace(/::/g, '/')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toLowerCase();
}

export function dasherize(str: string) {
  return str.replace(/_/g, '-');
}

export function removeLastPiece(str: string, splitChar = '.') {
  return str.substr(0, str.lastIndexOf(splitChar));
}

export function popPiece(str: string, splitChar = '.') {
  return str.substr(str.lastIndexOf(splitChar) + 1);
}

export function isJSON(str: string): boolean {
  throw new Error('[isJSON] Not implemented.');
}

export function getInitials(str: string) {
  const pieces = str.split(' ');
  return `${pieces[0].substr(0, 1)}${pieces[1] ? pieces[1].substr(0, 1) : ''}`.toUpperCase();
}

export function formatBytes(bytes: number, decimals: number = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function isBlank(str: string): boolean {
  return str === '';
}

export function dataUriToBlob(dataURI: string) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  const byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  const ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  const blob = new Blob([ab], { type: mimeString });
  return blob;
}

export function objectIdFromPath(path: string) {
  return path.substr(path.lastIndexOf('/') + 1).replace(/\.xml/, '');
}

export function decodeHTML(html: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

export function bytesToSize(bytes: number, separator: string = '') {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return 'n/a';
  const i = parseInt(`${Math.floor(Math.log(bytes) / Math.log(1024))}`, 10);
  if (i === 0) return `${bytes}${separator}${sizes[i]}`;
  return `${(bytes / (1024 ** i)).toFixed(1)}${separator}${sizes[i]}`;
}

export default {
  camelize,
  capitalize,
  underscore,
  dasherize,
  formatBytes,
  dataUriToBlob,
  objectIdFromPath,
  decodeHTML,
  bytesToSize
};

