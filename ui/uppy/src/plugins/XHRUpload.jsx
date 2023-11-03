/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import { nanoid as cuid } from 'nanoid';
import EventTracker from '@uppy/utils/lib/EventTracker';
import ProgressTimeout from '@uppy/utils/lib/ProgressTimeout';
import UppyXHRUpload from '@uppy/xhr-upload';
import NetworkError from '@uppy/utils/lib/NetworkError';
import isNetworkError from '@uppy/utils/lib/isNetworkError';

function buildResponseError(xhr, error) {
  // No error message
  if (!error) error = new Error('Upload error');
  // Got an error message string
  if (typeof error === 'string') error = new Error(error);
  // Got something else
  if (!(error instanceof Error)) {
    error = Object.assign(new Error('Upload error'), { data: error });
  }

  if (isNetworkError(xhr)) {
    error = new NetworkError(error, xhr);
    return error;
  }

  error.request = xhr;
  return error;
}

export class XHRUpload extends UppyXHRUpload {
  upload(file, current, total) {
    const opts = this.getOptions(file);
    this.uppy.log(`uploading ${current} of ${total}`);
    return new Promise((resolve, reject) => {
      this.uppy.emit('upload-started', file);

      const data = opts.formData ? this.createFormDataUpload(file, opts) : file.data;

      const xhr = new XMLHttpRequest();
      this.uploaderEvents[file.id] = new EventTracker(this.uppy);

      const timer = new ProgressTimeout(opts.timeout, () => {
        xhr.abort();
        queuedRequest.done();
        const error = new Error(this.i18n('timedOut', { seconds: Math.ceil(opts.timeout / 1000) }));
        this.uppy.emit('upload-error', file, error);
        reject(error);
      });

      const id = cuid();

      xhr.upload.addEventListener('loadstart', (ev) => {
        this.uppy.log(`[XHRUpload] ${id} started`);
      });

      xhr.upload.addEventListener('progress', (ev) => {
        this.uppy.log(`[XHRUpload] ${id} progress: ${ev.loaded} / ${ev.total}`);
        // Begin checking for timeouts when progress starts, instead of loading,
        // to avoid timing out requests on browser concurrency queue
        timer.progress();

        if (ev.lengthComputable) {
          this.uppy.emit('upload-progress', file, {
            uploader: this,
            bytesUploaded: ev.loaded,
            bytesTotal: ev.total
          });
        }
      });

      xhr.addEventListener('load', (ev) => {
        this.uppy.log(`[XHRUpload] ${id} finished`);
        timer.done();
        queuedRequest.done();
        if (this.uploaderEvents[file.id]) {
          this.uploaderEvents[file.id].remove();
          this.uploaderEvents[file.id] = null;
        }

        if (opts.validateStatus(ev.target.status, xhr.responseText, xhr)) {
          const body = opts.getResponseData(xhr.responseText, xhr);
          const uploadURL = body[opts.responseUrlFieldName];

          const uploadResp = {
            status: ev.target.status,
            body,
            uploadURL
          };

          this.uppy.emit('upload-success', file, uploadResp);

          if (uploadURL) {
            this.uppy.log(`Download ${file.name} from ${uploadURL}`);
          }

          return resolve(file);
        }
        const body = opts.getResponseData(xhr.responseText, xhr);
        const error = buildResponseError(xhr, opts.getResponseError(xhr.responseText, xhr));

        const response = {
          status: ev.target.status,
          body
        };

        this.uppy.emit('upload-error', file, error, response);
        return reject(error);
      });

      xhr.addEventListener('error', (ev) => {
        this.uppy.log(`[XHRUpload] ${id} errored`);
        timer.done();
        queuedRequest.done();
        if (this.uploaderEvents[file.id]) {
          this.uploaderEvents[file.id].remove();
          this.uploaderEvents[file.id] = null;
        }

        const error = buildResponseError(xhr, opts.getResponseError(xhr.responseText, xhr));
        this.uppy.emit('upload-error', file, error);
        return reject(error);
      });

      xhr.open(opts.method.toUpperCase(), opts.endpoint, true);
      // IE10 does not allow setting `withCredentials` and `responseType`
      // before `open()` is called.
      xhr.withCredentials = opts.withCredentials;
      if (opts.responseType !== '') {
        xhr.responseType = opts.responseType;
      }

      const queuedRequest = this.requests.run(() => {
        // When using an authentication system like JWT, the bearer token goes as a header. This
        // header needs to be fresh each time the token is refreshed so computing and setting the
        // headers just before the upload starts enables this kind of authentication to work properly.
        // Otherwise, half-way through the list of uploads the token could be stale and the upload would fail.
        const currentOpts = this.getOptions(file);
        Object.keys(currentOpts.headers).forEach((header) => {
          xhr.setRequestHeader(header, currentOpts.headers[header]);
        });
        xhr.send(data);
        return () => {
          timer.done();
          xhr.abort();
        };
      });

      this.onFileRemove(file.id, () => {
        queuedRequest.abort();
        reject(new Error('File removed'));
      });

      this.onCancelAll(file.id, () => {
        queuedRequest.abort();
        reject(new Error('Upload cancelled'));
      });
    });
  }
}

export default XHRUpload;
