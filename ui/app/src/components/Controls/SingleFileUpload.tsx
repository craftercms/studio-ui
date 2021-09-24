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

import React, { useEffect, useMemo, useState } from 'react';
import Core from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import ProgressBar from '@uppy/progress-bar';
import FileInput from '@uppy/file-input';
import Form from '@uppy/form';
import { defineMessages, useIntl } from 'react-intl';

import '@uppy/core/src/style.scss';
import '@uppy/progress-bar/src/style.scss';
import '@uppy/file-input/src/style.scss';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { getGlobalHeaders } from '../../utils/ajax';
import { validateActionPolicy } from '../../services/sites';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import { UppyFile } from '@uppy/utils';
import { emitSystemEvent, itemCreated } from '../../state/actions/system';
import { useDispatch } from 'react-redux';

const messages = defineMessages({
  chooseFile: {
    id: 'fileUpload.chooseFile',
    defaultMessage: 'Choose File'
  },
  validatingFile: {
    id: 'fileUpload.validatingFile',
    defaultMessage: 'Validating File'
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
  },
  createPolicy: {
    id: 'fileUpload.createPolicy',
    defaultMessage:
      'The upload file name goes against site policies. Suggested modified file name is: "{name}". Would you like to use the suggested name?'
  },
  policyError: {
    id: 'fileUpload.policyError',
    defaultMessage: 'The upload file name goes against site policies.'
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
  site: string;
  path?: string;
  fileTypes?: [string];
  onUploadStart?(): void;
  onComplete?(result: any): void;
  onError?(file: any, error: any, response: any): void;
}

export default function SingleFileUpload(props: UppyProps) {
  const { url, formTarget, onUploadStart, onComplete, onError, fileTypes, path, site } = props;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [description, setDescription] = useState<string>(formatMessage(messages.selectFileMessage));
  const [file, setFile] = useState<UppyFile>(null);
  const [fileNameErrorClass, setFileNameErrorClass] = useState<string>();
  const [confirm, setConfirm] = useState<{
    body: string;
    error?: boolean;
  }>(null);

  const classes = singleFileUploadStyles();
  const uppy = useMemo(
    () =>
      new Core({
        autoProceed: false,
        ...(fileTypes ? { restrictions: { allowedFileTypes: fileTypes } } : {})
      }),
    [fileTypes]
  );

  useEffect(() => {
    let uploadBtn: HTMLInputElement;

    const instance = uppy
      .use(FileInput, {
        target: '.uppy-file-input-container',
        // TODO: check removing this option doesn't break anything
        // replaceTargetContent: false,
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

    uppy.on('file-added', (file: UppyFile) => {
      uploadBtn = document.querySelector('.uppy-FileInput-btn');
      setDescription(`${formatMessage(messages.validatingFile)}:`);
      setFile(file);
      setFileNameErrorClass('');
      uploadBtn.disabled = true;
      validateActionPolicy(site, {
        type: 'CREATE',
        target: path + file.name
      }).subscribe(({ allowed, modifiedValue, target }) => {
        if (allowed) {
          if (modifiedValue) {
            setConfirm({
              body: formatMessage(messages.createPolicy, { name: modifiedValue.replace(`${path}`, '') })
            });
          } else {
            uppy.upload();
            setDescription(`${formatMessage(messages.uploadingFile)}:`);
            onUploadStart?.();
          }
        } else {
          setConfirm({
            error: true,
            body: formatMessage(messages.policyError)
          });
        }
      });
    });

    uppy.on('upload-success', (file, response) => {
      dispatch(emitSystemEvent(itemCreated({ target: path + file.name })));
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
  }, [uppy, fileTypes, formTarget, formatMessage, onComplete, onError, onUploadStart, path, site, url, dispatch]);

  const onConfirm = () => {
    uppy.upload().then(() => {});
    setDescription(`${formatMessage(messages.uploadingFile)}:`);
    onUploadStart?.();
    setConfirm(null);
  };

  const onConfirmCancel = () => {
    document.querySelector('.uppy-FileInput-btn').removeAttribute('disabled');
    uppy.removeFile(file.id);
    setFile(null);
    setConfirm(null);
    setDescription(formatMessage(messages.selectFileMessage));
  };

  return (
    <>
      <div className="uppy-progress-bar" />
      <div className="uploaded-files">
        <h5 className="single-file-upload--description">{description}</h5>
        <div className="uppy-file-input-container" />
        {file && (
          <em
            className={`single-file-upload--filename ${fileNameErrorClass} ${classes.fileNameTrimmed}`}
            title={file.name}
          >
            {file.name}
          </em>
        )}
      </div>
      <ConfirmDialog
        open={Boolean(confirm)}
        body={confirm?.body}
        onOk={confirm?.error ? onConfirmCancel : onConfirm}
        onCancel={confirm?.error ? null : onConfirmCancel}
        disableEnforceFocus={true}
      />
    </>
  );
}
