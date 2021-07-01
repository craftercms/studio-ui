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
import { popPiece } from '../../utils/string';
import { useSelection } from '../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { uploadDataUrl } from '../../services/content';
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

const prettierBytes = require('@transloadit/prettier-bytes');

export interface SingleFileUploadDialogUIProps {
  type: string;
  path: string;
  dataSourceId: string;
  onClose(): void;
  onSuccess?({ url: string }): void;
  onClosed?(): void;
}

interface SingleFile {
  name: string;
  dataUrl: string | ArrayBuffer;
  size: string;
  type: string;
  allowed?: boolean;
  suggestedName?: string;
}

export function SingleFileUploadDialogContainer(props: SingleFileUploadDialogUIProps) {
  const { type, path, dataSourceId, onClose, onClosed, onSuccess } = props;
  const { xsrfArgument } = useSelection((state) => state.env);
  const site = useActiveSiteId();
  const classes = useStyles();
  const [over, setOver] = useState(false);
  const validTypes =
    type === 'image' ? ['jpg', 'jpeg', 'gif', 'png', 'tiff', 'tif', 'bmp', 'svg', 'jp2', 'jxr', 'webp'] : [];

  const [file, setFile] = useState<SingleFile>(null);
  const [progress, setProgress] = useState(null);

  useUnmount(onClosed);

  const uploadInputRef = useRef(null);

  const processFile = (systemFile: File) => {
    if (!systemFile || !validTypes.includes(popPiece(systemFile.type, '/').toLowerCase())) {
      console.log('wrong file');
      return;
    }
    const reader = new FileReader();
    const { name, type, size } = systemFile;

    reader.onloadend = function() {
      let dataUrl = reader.result;
      let _file = {
        name,
        type,
        size: prettierBytes(size),
        dataUrl
      };
      setFile(_file);
      validateFile(_file);
    };
    reader.readAsDataURL(systemFile);
  };

  const validateFile = (file: SingleFile) => {
    validateActionPolicy(site, {
      type: 'CREATE',
      target: path + file.name
    }).subscribe(({ allowed, modifiedValue, target }) => {
      if (allowed) {
        if (modifiedValue) {
          setFile({ ...file, allowed: false, suggestedName: modifiedValue.replace(`${path}`, '') });
        } else {
          setFile({ ...file, allowed: true });
          uploadFile(file);
        }
      } else {
        setFile({ ...file, allowed: false });
      }
    });
  };

  const uploadFile = ({ name, type, dataUrl }: SingleFile) => {
    switch (dataSourceId) {
      case 'img-desktop-upload': {
        uploadDataUrl(site, { name: name, type, dataUrl }, expandPathMacros(path), xsrfArgument).subscribe(
          ({ type, payload: response }) => {
            if (type === 'complete') {
              onSuccess?.({ url: response.message.uri });
            } else if (type === 'progress') {
              const percentage = Math.floor(
                parseInt(((response.progress.bytesUploaded / response.progress.bytesTotal) * 100).toFixed(2))
              );
              setProgress(percentage);
            }
          },
          (error) => {
            console.log(error);
          }
        );
        break;
      }
    }
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
          type === 'image' ? (
            <FormattedMessage id="uploadFileDialog.uploadBrowse" defaultMessage="Upload an image" />
          ) : (
            <FormattedMessage id="uploadFileDialog.uploadBrowse" defaultMessage="Upload an file" />
          )
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
                      {file.suggestedName ? (
                        <FormattedMessage
                          id="policy.requiresChanges"
                          defaultMessage='File name "{name}" requires changes to comply with site policies.'
                          values={{ name: file.name }}
                        />
                      ) : (
                        <FormattedMessage
                          id="policy.requiresChanges"
                          defaultMessage='File name "{name}" doesn’t comply with site policies and can’t be uploaded.'
                          values={{ name: file.name }}
                        />
                      )}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    className={clsx(
                      classes.fileName,
                      file.allowed === true && 'success',
                      file.allowed === false && 'error'
                    )}
                  >
                    {file.name}
                  </Typography>
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
                      {file.suggestedName && (
                        <IconButton edge="end" onClick={onAcceptChanges}>
                          <CheckRoundedIcon />
                        </IconButton>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
              <ProgressBar progress={progress} />
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
                <FormattedMessage id="singleFileUploadDialog.dropzoneTitle" defaultMessage="Drop file here or" />
              </Typography>
              <Link
                className={classes.browseButton}
                component="button"
                variant="h5"
                onClick={() => uploadInputRef.current && uploadInputRef.current.click()}
              >
                <FormattedMessage id="singleFileUploadDialog.dropzoneBrowse" defaultMessage="Browse file" />
              </Link>
            </Box>
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
