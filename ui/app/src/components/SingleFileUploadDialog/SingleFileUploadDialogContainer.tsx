/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import React, { useRef, useState } from 'react';
import DialogHeader from '../Dialogs/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import { FormattedMessage } from 'react-intl';
import { useUnmount } from '../../utils/hooks/useUnmount';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import { useStyles } from './styles';
import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import { useSelection } from '../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { uploadDataUrl, uploadToCMIS, uploadToS3, uploadToWebDAV } from '../../services/content';
import { expandPathMacros } from '../../utils/path';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import { CardContent } from '@material-ui/core';
import { ProgressBar } from '../SystemStatus/ProgressBar';
import HourglassEmptyRoundedIcon from '@material-ui/icons/HourglassEmptyRounded';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import IconButton from '@material-ui/core/IconButton';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import { validateActionPolicy } from '../../services/sites';
import { nou } from '../../utils/object';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import ForwardRoundedIcon from '@material-ui/icons/ForwardRounded';

const prettierBytes = require('@transloadit/prettier-bytes');

export type uploadType = 's3' | 'cmis' | 'webdav' | 'studio';

export interface SingleFileUploadDialogUIProps {
  path: string;
  profileId?: string;
  uploadType: uploadType;
  validTypesRegex?: string | RegExp | [string, string];
  validTypesLabel?: string;
  onClose(): void;
  onSuccess?(response: { name: string; url: string }): void;
  onClosed?(): void;
}

interface SingleFile {
  name: string;
  dataUrl: string | ArrayBuffer;
  size: string;
  type: string;
  allowed?: boolean;
  reason?: 'policy' | 'type' | 'rename' | 'response';
  suggestedName?: string;
}

const servicesMap = {
  studio: uploadDataUrl,
  webDav: uploadToWebDAV,
  cmis: uploadToCMIS,
  s3: uploadToS3
};

export function SingleFileUploadDialogContainer(props: SingleFileUploadDialogUIProps) {
  const { path, profileId, uploadType, validTypesRegex, validTypesLabel, onClose, onClosed, onSuccess } = props;
  const { xsrfArgument } = useSelection((state) => state.env);
  const site = useActiveSiteId();
  const classes = useStyles();
  const [over, setOver] = useState(false);
  const [file, setFile] = useState<SingleFile>(null);
  const [progress, setProgress] = useState(null);

  useUnmount(onClosed);

  const uploadInputRef = useRef(null);

  const processFile = (systemFile: File) => {
    if (!systemFile) {
      return;
    }
    const reader = new FileReader();
    const { name, type, size } = systemFile;

    reader.onloadend = function() {
      let dataUrl = reader.result;
      let _file: SingleFile = {
        name,
        type,
        size: prettierBytes(size),
        dataUrl
      };

      if (validTypesRegex) {
        if (typeof validTypesRegex === 'string' && type !== validTypesRegex) {
          _file.allowed = false;
          _file.reason = 'type';
        } else if (
          Array.isArray(validTypesRegex) &&
          type.match(new RegExp(validTypesRegex[0], validTypesRegex[1])) === null
        ) {
          _file.allowed = false;
          _file.reason = 'type';
        } else if (type.match(validTypesRegex as RegExp) === null) {
          _file.allowed = false;
          _file.reason = 'type';
        }
      }

      setFile(_file);
      if (_file.allowed !== false) {
        validateFile(_file);
      }
    };
    reader.readAsDataURL(systemFile);
  };

  const validateFile = (file: SingleFile) => {
    validateActionPolicy(site, {
      type: 'CREATE',
      target: path + file.name
    }).subscribe(
      ({ allowed, modifiedValue, target }) => {
        if (allowed) {
          if (modifiedValue) {
            setFile({ ...file, allowed: false, reason: 'rename', suggestedName: modifiedValue.replace(`${path}`, '') });
          } else {
            setFile({ ...file, allowed: true });
            uploadFile(file);
          }
        } else {
          setFile({ ...file, allowed: false, reason: 'policy' });
        }
      },
      () => {
        setFile({ ...file, allowed: false, reason: 'response' });
      }
    );
  };

  const uploadFile = (file: SingleFile) => {
    const { name, type, dataUrl } = file;
    servicesMap[uploadType](
      site,
      { name, type, dataUrl },
      expandPathMacros(path),
      uploadType === 'studio' ? xsrfArgument : profileId,
      xsrfArgument
    ).subscribe(
      ({ type, payload: response }) => {
        if (type === 'complete') {
          onSuccess?.(response);
        } else if (type === 'progress') {
          const percentage = Math.floor(
            parseInt(((response.progress.bytesUploaded / response.progress.bytesTotal) * 100).toFixed(2))
          );
          setProgress(percentage);
        }
      },
      () => {
        setFile({ ...file, allowed: false, reason: 'response' });
      }
    );
  };

  const onFileSelected = (e) => {
    processFile(e.target.files[0]);
  };

  const onDrop = (e: React.DragEvent<HTMLElement>) => {
    setOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const removeFile = () => {
    setFile(null);
  };

  const onAcceptChanges = () => {
    uploadFile(file);
    setFile({ ...file, allowed: true });
  };

  return (
    <>
      <DialogHeader
        title={
          <>
            <FormattedMessage id="uploadFileDialog.uploadImage" defaultMessage="Upload an file" />
            {validTypesLabel && ` (${validTypesLabel})`}
          </>
        }
        onDismiss={onClose}
      />
      <DialogBody>
        {file ? (
          <Box>
            <Card className={classes.card}>
              <CardMedia className={classes.cover} image={file.dataUrl.toString()} title={file.name} />
              <CardContent className={classes.cardContent}>
                <div className={classes.fileContent}>
                  {file.allowed === false && (
                    <Typography className={classes.validationMessage}>
                      <WarningRoundedIcon />
                      {file.reason === 'policy' && (
                        <FormattedMessage
                          id="policy.canBeUploaded"
                          defaultMessage='File name "{name}" doesn’t comply with site policies and can’t be uploaded.'
                          values={{ name: file.name }}
                        />
                      )}
                      {file.reason === 'rename' && (
                        <FormattedMessage
                          id="policy.requiresChanges"
                          defaultMessage='File name "{name}" requires changes to comply with site policies.'
                          values={{ name: file.name }}
                        />
                      )}
                      {file.reason === 'type' && (
                        <FormattedMessage
                          id="policy.incorrectType"
                          defaultMessage='File type "{type}" is not allowed.'
                          values={{ type: file.type }}
                        />
                      )}
                      {file.reason === 'response' && (
                        <FormattedMessage
                          id="policy.incorrectType"
                          defaultMessage='File name "{name}" upload failed.'
                          values={{ name: file.name }}
                        />
                      )}
                    </Typography>
                  )}
                  <div className={classes.fileNameWrapper}>
                    <Typography
                      variant="body2"
                      className={clsx(
                        classes.fileName,
                        file.allowed === true && 'success',
                        file.allowed === false && ['rename', 'policy'].includes(file.reason) && 'error'
                      )}
                    >
                      {file.name}
                    </Typography>
                    {file.allowed === false && file.reason === 'rename' && (
                      <>
                        <ForwardRoundedIcon color="action" />
                        <Typography variant="body2" className={clsx(classes.fileName, 'success')}>
                          {file.suggestedName}
                        </Typography>
                      </>
                    )}
                  </div>
                  <Typography variant="body2" color="textSecondary">
                    {file.type} @ {file.size}
                  </Typography>
                </div>
                <div className={classes.fileActions}>
                  {nou(file.allowed) && <HourglassEmptyRoundedIcon color="action" />}
                  {file.allowed === false && (
                    <>
                      <IconButton onClick={removeFile}>
                        <CloseRoundedIcon />
                      </IconButton>
                      {file.reason === 'rename' && (
                        <IconButton edge="end" onClick={onAcceptChanges}>
                          <CheckRoundedIcon />
                        </IconButton>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
              {file.allowed && <ProgressBar progress={progress} />}
            </Card>
          </Box>
        ) : (
          <Box
            className={clsx(classes.dropZone, over && classes.over)}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              onDrop(e);
            }}
          >
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onFileSelected}
            />
            <Box display="flex" className={clsx(over && classes.disableContentOver)}>
              <Typography variant="h5">
                <FormattedMessage id="singleFileUploadDialog.dropzoneFileOr" defaultMessage="Drop file or" />
              </Typography>
              <Link
                className={classes.browseButton}
                component="button"
                variant="h5"
                onClick={() => uploadInputRef.current && uploadInputRef.current.click()}
              >
                <FormattedMessage id="words.browse" defaultMessage="Browse" />
              </Link>
            </Box>
            {validTypesLabel && (
              <Typography variant="body1" color="textSecondary">
                ({validTypesLabel})
              </Typography>
            )}
          </Box>
        )}
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onClose}>
          <FormattedMessage id="words.close" defaultMessage="Close" />
        </SecondaryButton>
      </DialogFooter>
    </>
  );
}
