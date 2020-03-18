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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import makeStyles from '@material-ui/styles/makeStyles';
import IconButton from '@material-ui/core/IconButton';
import ReplayIcon from '@material-ui/icons/Replay';
import {
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  Theme,
  Typography
} from '@material-ui/core';
import { Core, ProgressBar, ThumbnailGenerator, XHRUpload } from 'uppy';

import getDroppedFiles from '@uppy/utils/lib/getDroppedFiles';

import '@uppy/progress-bar/src/style.scss';
import '@uppy/drag-drop/src/style.scss';

import DialogTitle from './DialogTitle';
import Button from '@material-ui/core/Button';
import { getBulkUploadUrl } from '../services/content';
import { LookupTable } from '../models/LookupTable';
import { palette } from '../styles/theme';
import { bytesToSize } from '../utils/string';
import { useSpreadState } from '../utils/hooks';
import clsx from 'clsx';

const translations = defineMessages({
  title: {
    id: 'bulkUpload.title',
    defaultMessage: 'Bulk Upload'
  },
  subtitle: {
    id: 'bulkUpload.subtitle',
    defaultMessage: 'Drop the desired files from your desktop into the browser\'s window.'
  },
  close: {
    id: 'words.close',
    defaultMessage: 'Close'
  },
  done: {
    id: 'words.done',
    defaultMessage: 'Done'
  },
  dropHere: {
    id: 'bulkUpload.dropHere',
    defaultMessage: 'Drop files here'
  },
  browse: {
    id: 'bulkUpload.browse',
    defaultMessage: 'browse'
  }
});

const useStyles = makeStyles((theme: Theme) => ({
  dialogContent: {
    backgroundColor: palette.gray.light0,
    display: 'flex',
    flexDirection: 'column'
  },
  dragZone: {
    height: '200px',
    border: `2px dashed ${palette.gray.medium2}`,
    backgroundColor: palette.white,
    borderRadius: '7px',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    '&.hasFiles': {
      height: '100%',
      padding: '15px'
    },
    '&.over': {
      backgroundColor: palette.gray.light4,
      borderColor: palette.blue.tint,
      '& .uppy-DragDrop-arrow': {
        fill: palette.gray.medium4
      }
    },
    '& button:focus': {
      boxShadow: 'none'
    }
  },
  sectionFiles: {
    width: '100%',
    marginBottom: '10px',
    '&:last-child': {
      marginBottom: 0
    }
  },
  generalProgress: {
    position: 'absolute',
    width: '100%',
    bottom: '52px',
    left: 0
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  cardRoot: {
    display: 'flex',
    backgroundColor: palette.gray.light0,
    position: 'relative',
    marginBottom: '12px',
    '&:last-child': {
      marginBottom: 0
    }
  },
  elevationError: {
    border: '1px solid red'
  },
  cardContentRoot: {
    flexGrow: 1,
    '&:last-child': {
      padding: '16px'
    }
  },
  cardContent: {
    display: 'flex'
  },
  cardContentText: {},
  cardMedia: {
    width: '80px'
  },
  caption: {
    color: palette.gray.medium5
  },
  textFailed: {
    color: palette.red.main
  },
  iconRetry: {
    marginLeft: 'auto'
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '3px',
    transition: 'height .2s'
  },
  progressBarInner: {
    backgroundColor: palette.blue.tint,
    height: '100%',
    width: 0,
    transition: 'width 0.4s ease',
    '&.complete': {
      transition: 'background-color 0.5s ease',
      backgroundColor: palette.green.main
    },
    '&.failed': {
      width: '100% !important',
      backgroundColor: palette.red.main
    }
  }
}));

interface UppyItemProps {
  file: any,

  retryFileUpload(file: any): void
}

function UppyItem(props: UppyItemProps) {
  const classes = useStyles({});
  const { file, retryFileUpload } = props;
  const [failed, setFailed] = useState(null);

  const handleRetry = (file: any) => {
    setFailed(false);
    retryFileUpload(file);
  };

  useEffect(() => {
    setFailed(file.progress.failed);
  }, [file.progress.failed]);

  return (
    <Card className={classes.cardRoot}>
      {
        file.preview &&
        <CardMedia title={file.id} image={file.preview} className={classes.cardMedia}/>
      }
      <CardContent className={classes.cardContentRoot}>
        <div className={classes.cardContent}>
          <div className={classes.cardContentText}>
            <Typography variant="body2" className={clsx(failed && classes.textFailed)}>
              {file.name}
            </Typography>
            <Typography variant="caption" className={classes.caption}>
              {file.type} @ {bytesToSize(file.size)}
            </Typography>
          </div>
          {
            failed &&
            <IconButton onClick={() => {
              handleRetry(file)
            }} className={classes.iconRetry}>
              <ReplayIcon/>
            </IconButton>
          }
        </div>
        <div className={classes.progressBar}>
          <div
            className={clsx(classes.progressBarInner, failed && 'failed', (file.progress.percentage === 100) && 'complete')}
            style={{ width: `${file.progress.percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

interface DropZoneProps {
  path: string;
  site: string;
  limit: number;

  onComplete(): void;

  onUpload(): void;
}

function DropZone(props: DropZoneProps) {
  const classes = useStyles({});
  const dndRef = useRef(null);
  const generalProgress = useRef(null);
  const { onComplete, onUpload, path, site, limit } = props;
  const { formatMessage } = useIntl();
  const [filesPerPath, setFilesPerPath] = useSpreadState<LookupTable<any>>(null);
  const [files, setFiles] = useSpreadState<LookupTable<any>>(null);
  const [dragOver, setDragOver] = useState(null);

  const uppy = useMemo(() => Core({ debug: true, autoProceed: true }), []);

  const retryFileUpload = (file: any) => {
    uppy.retryUpload(file.id)
  };

  const handleDragOver = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  };

  const handleOnDrop = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    getDroppedFiles(event.dataTransfer)
      .then((files) => {
        files.map((file: any) =>
          uppy.addFile({
            name: file.name,
            type: file.type,
            data: file,
            meta: {
              relativePath: file.relativePath || null
            }
          })
        )
      });
    setDragOver(false);
    removeDragData(event);
  };

  const handleDragLeave = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  };

  function removeDragData(event: any) {
    if (event.dataTransfer.items) {
      event.dataTransfer.items.clear();
    } else {
      event.dataTransfer.clearData();
    }
  }

  useEffect(() => {
    if (dndRef?.current && generalProgress?.current) {
      uppy.use(ThumbnailGenerator, {
        thumbnailWidth: 200,
        thumbnailHeight: 200,
        waitForThumbnailsBeforeUpload: true
      })
        .use(XHRUpload, {
          endpoint: getBulkUploadUrl(site, path),
          formData: true,
          fieldName: 'file',
          limit
        })
        .use(ProgressBar, {
          target: generalProgress.current,
          hideAfterFinish: false
        })
        .setMeta({ site });
    }
    return () => {
      // https://uppy.io/docs/uppy/#uppy-close
      uppy.reset();
      uppy.close();
    };
  }, [formatMessage, path, site, uppy]);

  useEffect(() => {

    const handleComplete = () => {
      onComplete();
    };

    const handleThumbnailGenerated = (file: any) => {
      setFiles({ [file.id]: file });
    };

    const handleUploadProgress = (file: any, progress: any) => {
      file.progress.bytesUploaded = progress.bytesUploaded;
      file.progress.bytesTotal = progress.bytesTotal;
      file.progress.percentage = Math.floor(parseInt((progress.bytesUploaded / progress.bytesTotal * 100).toFixed(2)));
      setFiles({ [file.id]: file });
    };

    const handleUploadError = (file: any, error: any, response: any) => {
      file.progress.failed = true;
      setFiles({ [file.id]: file });
    };

    const handleFileAdded = (file: any) => {
      const newPath = file.meta.relativePath ? path + file.meta.relativePath.substring(0, file.meta.relativePath.lastIndexOf('/')) : path;
      const ids = (filesPerPath && filesPerPath[newPath]) ? [...filesPerPath[newPath], file.id] : [file.id];
      setFilesPerPath({ [newPath]: ids });
      setFiles({ [file.id]: file });
      uppy.setFileMeta(file.id, { path: newPath });
    };

    const handleUpload = () => {
      onUpload();
    };

    uppy.on('complete', handleComplete);
    uppy.on('file-added', handleFileAdded);
    uppy.on('upload', handleUpload);
    uppy.on('upload-error', handleUploadError);
    uppy.on('upload-progress', handleUploadProgress);
    uppy.on('thumbnail:generated', handleThumbnailGenerated);

    return () => {
      uppy.off('complete', handleComplete);
      uppy.off('file-added', handleFileAdded);
      uppy.off('upload', handleUpload);
      uppy.off('upload-error', handleUploadError);
      uppy.off('upload-progress', handleUploadProgress);
      uppy.off('thumbnail:generated', handleThumbnailGenerated);
    }

  }, [filesPerPath, onComplete, path, setFiles, setFilesPerPath, uppy]);

  return (
    <>
      <section
        ref={dndRef}
        className={clsx(classes.dragZone, dragOver && 'over', files && 'hasFiles')}
        onDrop={handleOnDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {
          filesPerPath ? (
            Object.keys(filesPerPath).map(fileId =>
              <div key={fileId} className={classes.sectionFiles}>
                <Typography variant="subtitle2" className={classes.sectionTitle}>
                  {fileId}:
                </Typography>
                {
                  files &&
                  filesPerPath[fileId].map((id: string) =>
                    files[id] && <UppyItem file={files[id]} key={id} retryFileUpload={retryFileUpload}/>
                  )
                }
              </div>
            )
          ) : (
            <>
              <RenderArrowSvg/>
              <Typography variant="subtitle1">
                {formatMessage(translations.dropHere)}
              </Typography>
            </>
          )
        }
      </section>
      <section ref={generalProgress} className={classes.generalProgress}/>
    </>
  )
}

function RenderArrowSvg() {
  return (
    <svg aria-hidden="true" focusable="false" className="UppyIcon uppy-DragDrop-arrow" width="16" height="16"
         viewBox="0 0 16 16">
      <path d="M11 10V0H5v10H2l6 6 6-6h-3zm0 0" fillRule="evenodd"/>
    </svg>
  )
}

export default function BulkUpload(props: any) {
  const { formatMessage } = useIntl();
  const classes = useStyles({});
  const {
    onClose = () => {
    },
    path = '/static-assets/test',
    site = 'editorial',
    limit = 2
  } = props;
  const [status, setStatus] = useState(null);

  const onComplete = () => {
    setStatus('complete');
  };

  const onUpload = () => {
    setStatus('uploading');
  };

  return (
    <Dialog open={true}>
      <DialogTitle
        title={formatMessage(translations.title)}
        subtitle={formatMessage(translations.subtitle)}
        onClose={onClose}
      />
      <DialogContent dividers className={classes.dialogContent}>
        <DropZone onComplete={onComplete} path={path} site={site} onUpload={onUpload} limit={limit}/>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={status === 'uploading'}
          variant="contained"
          color={status === 'complete' ? 'primary' : 'default'}
        >
          {status === 'complete' ? formatMessage(translations.done) : formatMessage(translations.close)}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
