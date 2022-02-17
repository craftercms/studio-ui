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

import React, { useEffect, useMemo, useState } from 'react';
import Core from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import ProgressBar from '@uppy/progress-bar';
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
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import Button from '@mui/material/Button';
import { useSiteUIConfig } from '../../hooks';

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
    },
    description: {
      margin: '10px 0'
    },
    input: {
      display: 'none !important'
    },
    inputContainer: {
      marginBottom: '10px'
    }
  })
);

interface SingleFileUploadProps {
  site: string;
  formTarget?: string;
  url?: string;
  path?: string;
  customFileName?: string;
  fileTypes?: [string];
  onUploadStart?(): void;
  onComplete?(result: any): void;
  onError?({ file, error, response }): void;
}

export function SingleFileUpload(props: SingleFileUploadProps) {
  const {
    url = '/studio/api/1/services/api/1/content/write-content.json',
    formTarget = '#asset_upload_form',
    onUploadStart,
    onComplete,
    onError,
    customFileName,
    fileTypes,
    path,
    site
  } = props;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [description, setDescription] = useState<string>(formatMessage(messages.selectFileMessage));
  const [file, setFile] = useState<UppyFile>(null);
  const [fileNameErrorClass, setFileNameErrorClass] = useState<string>();
  const [disableInput, setDisableInput] = useState(false);
  const { upload } = useSiteUIConfig();
  const [confirm, setConfirm] = useState<{
    body: string;
    error?: boolean;
  }>(null);

  const classes = singleFileUploadStyles();
  const uppy = useMemo(
    () =>
      new Core({
        autoProceed: false,
        ...(fileTypes ? { restrictions: { allowedFileTypes: fileTypes } } : {}),
        ...(customFileName
          ? {
              onBeforeFileAdded: (currentFile) => {
                return {
                  ...currentFile,
                  name: customFileName,
                  meta: {
                    ...currentFile.meta,
                    name: customFileName
                  }
                };
              }
            }
          : {})
      }),
    [fileTypes, customFileName]
  );

  useEffect(() => {
    const instance = uppy
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
        timeout: upload.timeout,
        headers: getGlobalHeaders(),
        getResponseData: (responseText, response) => response
      });

    return () => {
      // https://uppy.io/docs/uppy/#uppy-close
      instance.reset();
      instance.close();
    };
  }, [uppy, formTarget, url, upload.timeout]);

  useEffect(() => {
    const onUploadSuccess = (file) => {
      dispatch(emitSystemEvent(itemCreated({ target: path + file.name })));
      setDescription(`${formatMessage(messages.uploadedFile)}:`);
    };

    const onCompleteUpload = (result) => {
      onComplete?.(result);
      setDisableInput(false);
    };

    uppy.on('upload-success', onUploadSuccess);
    uppy.on('complete', onCompleteUpload);

    return () => {
      uppy.off('upload-success', onUploadSuccess);
      uppy.off('complete', onCompleteUpload);
    };
  }, [onComplete, dispatch, formatMessage, path, uppy]);

  useEffect(() => {
    const onUploadError = (file, error, response) => {
      uppy.cancelAll();
      setFileNameErrorClass('text-danger');
      onError?.({ file, error, response });
      setDisableInput(false);
    };

    uppy.on('upload-error', onUploadError);

    return () => {
      uppy.off('upload-error', onUploadError);
    };
  }, [onError, uppy]);

  useEffect(() => {
    const onFileAdded = (file: UppyFile) => {
      setDescription(`${formatMessage(messages.validatingFile)}:`);
      setFile(file);
      setFileNameErrorClass('');
      validateActionPolicy(site, {
        type: 'CREATE',
        target: path + file.name
      }).subscribe(({ allowed, modifiedValue }) => {
        if (allowed) {
          if (modifiedValue) {
            setConfirm({
              body: formatMessage(messages.createPolicy, { name: modifiedValue.replace(`${path}`, '') })
            });
          } else {
            setDisableInput(true);
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
    };

    uppy.on('file-added', onFileAdded);

    return () => {
      uppy.off('file-added', onFileAdded);
    };
  }, [onUploadStart, formatMessage, path, site, uppy]);

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

  const onChange = ({ nativeEvent: event }) => {
    const files: File[] = Array.from(event.target.files);
    files.forEach((file) => {
      try {
        uppy.addFile({
          source: 'file input',
          name: file.name,
          type: file.type,
          data: file
        });
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <>
      <form id="asset_upload_form">
        <input type="hidden" name="path" value={path} />
        <input type="hidden" name="site" value={site} />
      </form>
      <div className="uppy-progress-bar" />
      <div className="uploaded-files">
        <Typography variant="subtitle1" component="h2" className={classes.description}>
          {description}
          {file && (
            <em
              className={clsx('single-file-upload--filename', fileNameErrorClass, classes.fileNameTrimmed)}
              title={file.name}
            >
              {file.name}
            </em>
          )}
        </Typography>
        <div className={classes.inputContainer}>
          <input
            accept={fileTypes?.join(',')}
            className={classes.input}
            id="contained-button-file"
            type="file"
            onChange={onChange}
          />
          <label htmlFor="contained-button-file">
            <Button variant="outlined" component="span" disabled={disableInput}>
              {formatMessage(messages.chooseFile)}
            </Button>
          </label>
        </div>
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

export default SingleFileUpload;
