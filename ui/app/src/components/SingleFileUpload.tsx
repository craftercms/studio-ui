/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useEffect } from 'react';
import { Core, FileInput, XHRUpload, ProgressBar, Form } from 'uppy';

import 'uppy/src/style.scss';

interface UppyProps {
  formTarget: string;
  url: string;
  onComplete?(result: any): void;
  onCancel?(): void;
}

function SingleFileUpload(props: UppyProps) {

  const
    {
      url,
      formTarget,
      onComplete,
      onCancel
    } = props,
    uppy = Core({ autoProceed: true });

  useEffect(
    () => {
      uppy.use(FileInput, {
        target: '.uppy-file-input-container',
        replaceTargetContent: false,
        locale: {
          strings: {
            chooseFiles: 'Choose File'
          }
        }
      })
      .use(Form, {
        target: formTarget,
        getMetaFromForm: true,
        addResultToForm: true,
        submitOnSuccess: false,
        triggerUploadOnSubmit: false
      })
      .use(ProgressBar, {
        target: '.UppyProgressBar',
        hideAfterFinish: false
      })
      .use(XHRUpload, {
        endpoint: url,
        formData: true,
        fieldName: 'file'
      })
      uppy.on('file-added', (file) => {
        document.querySelector('.uploaded-files .description').innerHTML = 'Uploading File:';
        document.querySelector('.uploaded-files ol').innerHTML +=
          `<li><a href="${file.name}" target="_blank">${file.name}</a></li>`
      })
      uppy.on('upload-success', (file) => {
        document.querySelector('.uploaded-files .description').innerHTML = 'Uploaded File:';
      })
      uppy.on('complete', (result) => {
        onComplete(result);
      });

      // Move to CSS file
      let selectFileBtnEl: HTMLElement = document.querySelector('.uppy-FileInput-container');
      selectFileBtnEl.style.display = 'inline-block';
    },
    [formTarget, onComplete, uppy, url]
  );

  return (
    <div>
      <div className="UppyProgressBar"></div>

      <div className="uploaded-files" style={{ marginTop: '5px' }}>
        <h5 className="description" style={{ display: 'inline-block' }}>Please select a file to upload</h5>
        <div className="uppy-file-input-container" style={{ float: 'right'}}></div>
        <ol></ol>
      </div>
    </div>
  );
}

export default SingleFileUpload;
