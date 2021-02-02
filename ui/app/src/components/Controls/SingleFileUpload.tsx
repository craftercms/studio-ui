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

import React, { useEffect, useState } from 'react';
import Core from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import ProgressBar from '@uppy/progress-bar';
import FileInput from '@uppy/file-input';
import Form from '@uppy/form';
import { defineMessages, useIntl } from 'react-intl';

import '@uppy/core/src/style.scss';
import '@uppy/progress-bar/src/style.scss';
import '@uppy/file-input/src/style.scss';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { getGlobalHeaders } from '../../utils/ajax';

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
  },
  selectFileMessage: {
    id: 'fileUpload.selectFileMessage',
    defaultMessage: 'Please select a file to upload'
  }
});

const singleFileUploadStyles = makeStyles((theme) =>
  createStyles({
    fileNameTrimmed: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  })
);

interface UppyProps {
  formTarget: string;
  url: string;
  fileTypes?: [string];
  onUploadStart?(): void;
  onComplete?(result: any): void;
  onError?(file: any, error: any, response: any): void;
}

export default function SingleFileUpload(props: UppyProps) {
  const { url, formTarget, onUploadStart, onComplete, onError, fileTypes } = props;

  const { formatMessage } = useIntl();
  const [description, setDescription] = useState<string>(formatMessage(messages.selectFileMessage));
  const [fileName, setFileName] = useState<string>();
  const [fileNameErrorClass, setFileNameErrorClass] = useState<string>();

  const classes = singleFileUploadStyles();

  useEffect(() => {
    const uppy = Core({
      autoProceed: true,
      ...(fileTypes ? { restrictions: { allowedFileTypes: fileTypes } } : {})
    });

    let uploadBtn: HTMLInputElement;

    const instance = uppy
      .use(FileInput, {
        target: '.uppy-file-input-container',
        replaceTargetContent: false,
        locale: {
          strings: {
            chooseFiles: formatMessage(messages.chooseFile)
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
        target: '.uppy-progress-bar',
        hideAfterFinish: false
      })
      .use(XHRUpload, {
        endpoint: url,
        formData: true,
        fieldName: 'file',
        timeout: 0,
        headers: getGlobalHeaders()
      });

    uppy.on('file-added', (file) => {
      uploadBtn = document.querySelector('.uppy-FileInput-btn');
      setDescription(`${formatMessage(messages.uploadingFile)}:`);
      setFileName(file.name);
      setFileNameErrorClass('');
      uploadBtn.disabled = true;
      onUploadStart();
    });

    uppy.on('upload-success', (file) => {
      setDescription(`${formatMessage(messages.uploadedFile)}:`);
      uploadBtn.disabled = false;
    });

    uppy.on('complete', onComplete);

    uppy.on('upload-error', (file, error, response) => {
      uppy.cancelAll();
      uploadBtn.disabled = false;
      setFileNameErrorClass('text-danger');
      onError && onError(file, error, response);
    });

    return () => {
      // https://uppy.io/docs/uppy/#uppy-close
      instance.reset();
      instance.close();
    };
  }, [fileTypes, formTarget, formatMessage, onComplete, onError, onUploadStart, url]);

  return (
    <>
      <div className="uppy-progress-bar" />
      <div className="uploaded-files">
        <h5 className="single-file-upload--description">{description}</h5>
        <div className="uppy-file-input-container" />
        {fileName && (
          <em
            className={`single-file-upload--filename ${fileNameErrorClass} ${classes.fileNameTrimmed}`}
            title={fileName}
          >
            {fileName}
          </em>
        )}
      </div>
    </>
  );
}
