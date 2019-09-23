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
import { FormattedMessage } from 'react-intl';
import { defineMessages, useIntl } from "react-intl";

import 'uppy/src/style.scss';

const messages = defineMessages({
  chooseFile: {
    id: 'fileUpload.chooseFile',
    defaultMessage: 'Choose File'
  },
  uploadingFile: {
    id: 'fileUpload.uploadingFile',
    defaultMessage: 'Uploading File'
  },
  uploadedFile: {
    id: 'fileUpload.uploadedFile',
    defaultMessage: 'Uploaded File'
  }
});

interface UppyProps {
  formTarget: string;
  url: string;
  onUploadStart?(): void;
  onComplete?(result: any): void;
  fileTypes?: [string];
}

function SingleFileUpload(props: UppyProps) {

  const
    {
      url,
      formTarget,
      onUploadStart,
      onComplete,
      fileTypes
    } = props;
    let uppyConfig: Object = {
      autoProceed: true
    };

  if (fileTypes) {
    uppyConfig = {
      ...uppyConfig,
      restrictions: {
        allowedFileTypes: fileTypes
      }
    }
  }

  const uppy = Core(uppyConfig);
  const { formatMessage } = useIntl();
  let uploadBtn: HTMLInputElement;

  useEffect(
    () => {
      uppy.use(FileInput, {
        target: '.uppy-file-input-container',
        replaceTargetContent: false,
        locale: {
          strings: {
            chooseFiles: formatMessage(messages.chooseFile),
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
        uploadBtn = document.querySelector('.uppy-FileInput-btn');
        document.querySelector('.uploaded-files .description').innerHTML = `${formatMessage(messages.uploadingFile)}:`;
        document.querySelector('.uploaded-files ol').innerHTML +=
          `<li><a>${file.name}</a></li>`;
        uploadBtn.disabled = true;

        onUploadStart();
      })
      uppy.on('upload-success', (file) => {
        document.querySelector('.uploaded-files .description').innerHTML = `${formatMessage(messages.uploadedFile)}:`;
        uploadBtn.disabled = false;
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
        <h5 className="description" style={{ display: 'inline-block' }}>
          <FormattedMessage
            id="fileUpload.selectFileMessage"
            defaultMessage={`Please select a file to upload`}
          />
        </h5>
        <div className="uppy-file-input-container" style={{ float: 'right'}}></div>
        <ol></ol>
      </div>
    </div>
  );
}

export default SingleFileUpload;
