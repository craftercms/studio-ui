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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import makeStyles from '@material-ui/styles/makeStyles';
import createStyles from '@material-ui/styles/createStyles';
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
import { Core, ProgressBar as UppyProgressBar, XHRUpload } from 'uppy';

import getDroppedFiles from '@uppy/utils/lib/getDroppedFiles';
import toArray from '@uppy/utils/lib/toArray';

import '@uppy/progress-bar/src/style.scss';
import '@uppy/drag-drop/src/style.scss';

import DialogHeader from './DialogHeader';
import Button from '@material-ui/core/Button';
import { getBulkUploadUrl } from '../services/content';
import { LookupTable } from '../models/LookupTable';
import { palette } from '../styles/theme';
import { bytesToSize } from '../utils/string';
import { useSpreadState } from '../utils/hooks';
import clsx from 'clsx';
import GetAppIcon from '@material-ui/icons/GetApp';
import RemoveRoundedIcon from '@material-ui/icons/RemoveRounded';
import AddRoundedIcon from '@material-ui/icons/AddRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import Paper from '@material-ui/core/Paper';

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
    defaultMessage: 'Drop files here or <span>browse</span>'
  },
  browse: {
    id: 'words.browse',
    defaultMessage: 'Browse'
  },
  filesProgression: {
    id: 'bulkUpload.filesProgression',
    defaultMessage: '{start}/{end}'
  },
  uploadInProgress: {
    id: 'bulkUpload.uploadInProgress',
    defaultMessage: 'There is still a bulk upload in progress. Ares you sure you go away?'
  }
});

const useStyles = makeStyles((theme: Theme) => createStyles({
  dialogContent: {
    backgroundColor: palette.gray.light0
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
    cursor: 'pointer',
    '&.hasFiles': {
      height: '100%',
      minHeight: '200px',
      padding: '15px',
      justifyContent: 'start',
      cursor: 'inherit'
    },
    '&.over': {
      backgroundColor: palette.gray.light4,
      borderColor: palette.blue.tint
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
    left: 0,
    '& .uppy-ProgressBar-inner': {
      backgroundColor: palette.blue.tint
    }
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  uploadIcon: {
    fill: palette.gray.light7,
    fontSize: '60px',
    marginBottom: '10px',
    '&.over': {
      fill: palette.gray.medium4
    }
  },
  hiddenInput: {
    display: 'none !important'
  },
  browseText: {
    color: palette.blue.main
  },
  status: {
    marginRight: 'auto'
  },
  minimized: {
    display: 'none'
  }
}));

const UppyItemStyles = makeStyles((theme: Theme) => createStyles({
  cardRoot: {
    display: 'flex',
    backgroundColor: palette.gray.light0,
    position: 'relative',
    marginBottom: '12px',
    '&:last-child': {
      marginBottom: 0
    }
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
    marginLeft: 'auto',
    height: '48px'
  }
}));

interface UppyFile {
  source: string;
  id: string;
  name: string;
  extension: string;
  meta: {
    site?: string;
    relativePath?: string;
    name: string;
    type: string;
    path: string;
  }
  type: string;
  data: File | Blob;
  progress: {
    percentage: number;
    bytesUploaded: number;
    bytesTotal: number;
    uploadComplete: boolean;
    uploadStarted: number;
    status?: string;
  }
  size: number;
  isRemote: boolean;
  remote: {
    host: string;
    url: string;
  };
  preview: any;
}

interface UppyItemProps {
  file: any,

  retryFileUpload(file: UppyFile): void
}

function UppyItem(props: UppyItemProps) {
  const classes = UppyItemStyles({});
  const { file, retryFileUpload } = props;
  //const [failed, setFailed] = useState(null);

  const handleRetry = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, file: UppyFile) => {
    event.preventDefault();
    event.stopPropagation();
    //setFailed(false);
    retryFileUpload(file);
  };

  // useEffect(() => {
  //   setFailed(file.progress.failed);
  // }, [file.progress.failed]);

  return (
    <Card className={classes.cardRoot}>
      {
        file.preview &&
        <CardMedia title={file.id} image={file.preview} className={classes.cardMedia}/>
      }
      <CardContent className={classes.cardContentRoot}>
        <div className={classes.cardContent}>
          <div className={classes.cardContentText}>
            <Typography variant="body2" className={clsx(file.progress.status === 'failed' && classes.textFailed)}>
              {file.name}
            </Typography>
            <Typography variant="caption" className={classes.caption}>
              {file.type} @ {bytesToSize(file.size)}
            </Typography>
          </div>
          {
            file.progress.status === 'failed' &&
            <IconButton onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
              handleRetry(event, file)
            }} className={classes.iconRetry}>
              <ReplayIcon/>
            </IconButton>
          }
        </div>
        <ProgressBar status={file.progress.status} progress={file.progress.percentage}/>
      </CardContent>
    </Card>
  )
}

interface DropZoneProps {
  path: string;
  site: string;
  maxSimultaneousUploads: number;

  onStatusChange(status: any): void;
}

const DropZone = React.forwardRef((props: DropZoneProps, ref: any) => {
  const classes = useStyles({});
  const dndRef = useRef(null);
  const generalProgress = useRef(null);
  const { onStatusChange, path, site, maxSimultaneousUploads } = props;
  const { formatMessage } = useIntl();
  const [filesPerPath, setFilesPerPath] = useSpreadState<LookupTable<any>>(null);
  const [files, setFiles] = useSpreadState<LookupTable<UppyFile>>(null);
  const [dragOver, setDragOver] = useState(null);
  const uppy = useMemo(() => Core({ debug: true, autoProceed: true }), []);
  const [uploadedFiles, setUploadedFiles] = useState(0);

  const retryFileUpload = (file: UppyFile) => {
    uppy.retryUpload(file.id)
  };

  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  };

  const handleOnDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    getDroppedFiles(event.dataTransfer)
      .then((files) => addFiles(files));
    setDragOver(false);
    removeDragData(event);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = toArray(event.target.files);
    addFiles(files);
    event.target.value = null;
  };

  function addFiles(files: File[]) {
    files.map((file: any) =>
      checkFileExist(file) && uppy.addFile({
        name: file.name,
        type: file.type,
        data: file,
        meta: {
          relativePath: file.relativePath || null
        }
      })
    )
  }

  function checkFileExist(newFile: File) {
    return !uppy.getFiles().some((file) => file.name === newFile.name && file.type === newFile.type)
  }

  function removeDragData(event: React.DragEvent<HTMLElement>) {
    if (event.dataTransfer.items) {
      event.dataTransfer.items.clear();
    } else {
      event.dataTransfer.clearData();
    }
  }

  useEffect(() => {
    if (dndRef?.current && generalProgress?.current) {
      uppy.use(XHRUpload, {
        endpoint: getBulkUploadUrl(site, path),
        formData: true,
        fieldName: 'file',
        limit: maxSimultaneousUploads
      }).use(UppyProgressBar, {
        target: generalProgress.current,
        hideAfterFinish: true
      }).setMeta({ site });
    }
    return () => {
      // https://uppy.io/docs/uppy/#uppy-close
      uppy.reset();
      uppy.close();
    };
  }, [formatMessage, maxSimultaneousUploads, path, site, uppy]);

  useEffect(() => {
    const handleUploadProgress = (file: UppyFile, progress: any) => {
      const newFile = uppy.getFile(file.id) as UppyFile;
      newFile.progress.bytesUploaded = progress.bytesUploaded;
      newFile.progress.bytesTotal = progress.bytesTotal;
      newFile.progress.percentage = Math.floor(parseInt((progress.bytesUploaded / progress.bytesTotal * 100).toFixed(2)));
      setFiles({ [file.id]: newFile });
      onStatusChange({ status: 'uploading', progress: uppy.getState().totalProgress });
    };

    const handleUploadError = (file: UppyFile) => {
      const newFile = uppy.getFile(file.id) as UppyFile;
      newFile.progress.status = 'failed';
      setFiles({ [file.id]: newFile });
    };

    const handleFileAdded = (file: UppyFile) => {
      const newPath = file.meta.relativePath ? path + file.meta.relativePath.substring(0, file.meta.relativePath.lastIndexOf('/')) : path;
      const ids = (filesPerPath && filesPerPath[newPath]) ? [...filesPerPath[newPath], file.id] : [file.id];
      setFilesPerPath({ [newPath]: ids });
      uppy.setFileMeta(file.id, { path: newPath });
      if (file.type.includes('image')) {
        const reader = new FileReader();
        reader.onload = function (e) {
          file.preview = e.target.result;
          uppy.setFileState(file.id, { preview: e.target.result });
          setFiles({ [file.id]: file });
        };
        reader.readAsDataURL(file.data)
      } else {
        setFiles({ [file.id]: file });
      }
    };

    uppy.on('file-added', handleFileAdded);
    uppy.on('upload-error', handleUploadError);
    uppy.on('upload-progress', handleUploadProgress);

    return () => {
      uppy.off('file-added', handleFileAdded);
      uppy.off('upload-error', handleUploadError);
      uppy.off('upload-progress', handleUploadProgress);
    }

  }, [filesPerPath, onStatusChange, path, setFiles, setFilesPerPath, uppy]);

  useEffect(() => {
    const handleUploadSuccess = () => {
      setUploadedFiles(uploadedFiles + 1);
      onStatusChange({ uploadedFiles: uploadedFiles + 1 })
    };

    const handleComplete = () => {
      if (uppy.getState().totalProgress === 100) {
        onStatusChange({ status: 'complete', progress: uppy.getState().totalProgress });
      } else {
        onStatusChange({ status: 'failed', progress: uppy.getState().totalProgress });
      }
    };

    uppy.on('upload-success', handleUploadSuccess);
    uppy.on('complete', handleComplete);
    return () => {
      uppy.off('upload-success', handleUploadSuccess);
      uppy.off('complete', handleComplete);
    }
  }, [onStatusChange, uploadedFiles, uppy]);

  useEffect(() => {
    if (files) {
      onStatusChange({ files: Object.keys(files).length })
    }
  }, [onStatusChange, files]);

  return (
    <>
      <section
        ref={dndRef}
        className={clsx(classes.dragZone, dragOver && 'over', files && 'hasFiles')}
        onDrop={handleOnDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !files && ref.current?.click()}
      >
        {
          (filesPerPath && files) ? (
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
              <GetAppIcon className={clsx(classes.uploadIcon, dragOver && 'over')}/>
              <Typography variant="subtitle1">
                {formatMessage(translations.dropHere, {
                  span: browse => <span className={classes.browseText}>browse</span>
                })}
              </Typography>
            </>
          )
        }
      </section>
      <input
        className={classes.hiddenInput}
        type="file"
        tabIndex={-1}
        ref={ref}
        name="files[]"
        multiple={true}
        onChange={handleInputChange}
      />
      <section ref={generalProgress} className={classes.generalProgress}/>
    </>
  )
});


const minimizedBarStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    display: 'flex',
    padding: '10px 14px',
    alignItems: 'center',
    position: 'absolute',
    bottom: '20px',
    right: '20px'

  },
  title: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  subtitle: {
    fontSize: '14px',
    marginLeft: '15px'
  }
}));

interface MinimizedBarProps {
  title: string;
  subtitle?: string;
  status?: object;

  onMaximized(): void;
}

function MinimizedBar(props: any) {
  const { title, onMaximized, subtitle, status } = props;
  const classes = minimizedBarStyles({});
  return (
    <Paper className={classes.root}>
      <Typography variant="h6">{title}</Typography>
      {
        subtitle &&
        <Typography variant="subtitle1" className={classes.subtitle}>{subtitle}</Typography>
      }
      {onMaximized ? (
        <IconButton aria-label="close" onClick={onMaximized}>
          <AddRoundedIcon/>
        </IconButton>
      ) : null}
      <ProgressBar status={status.status} progress={status.progress}/>
    </Paper>
  )
}


const progressBarStyles = makeStyles((theme: Theme) => createStyles({
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
      backgroundColor: palette.red.main
    }
  }
}));

function ProgressBar(props: any) {
  const { status, progress } = props;
  const classes = progressBarStyles({});
  return (
    <div className={classes.progressBar}>
      <div
        className={clsx(classes.progressBarInner, status === 'failed' && 'failed', (progress === 100) && 'complete')}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default function BulkUpload(props: any) {
  const { formatMessage } = useIntl();
  const classes = useStyles({});
  const { onClose, path, site, maxSimultaneousUploads = 1, open } = props;
  const [dropZoneStatus, setDropZoneStatus] = useSpreadState({
    status: 'idle',
    files: null,
    uploadedFiles: 0,
    progress: 0
  });
  const inputRef = useRef(null);
  const [minimized, setMinimized] = useState(!open);

  const onStatusChange = useCallback((status: any) => {
    setDropZoneStatus(status)
  }, [setDropZoneStatus]);

  const onBrowse = () => {
    inputRef.current.click();
  };

  const onMinimized = () => {
    setMinimized(true);
  };

  const onMaximized = () => {
    setMinimized(false);
  };

  const preventWrongDrop = (e: React.DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    const handleBeforeUpload = () => {
      return formatMessage(translations.uploadInProgress)
    };
    if (dropZoneStatus.status === 'uploading') {
      window.onbeforeunload = handleBeforeUpload;
    } else if (dropZoneStatus.status === 'complete') {
      window.onbeforeunload = null;
    }
    return () => {
      window.onbeforeunload = null;
    }
  }, [dropZoneStatus.status, formatMessage]);

  return (
    <div className={'bulkUpload'}>
      {
        minimized &&
        <MinimizedBar
          title={formatMessage(translations.title)}
          onMaximized={onMaximized}
          status={dropZoneStatus}
          subtitle={
            dropZoneStatus.files ?
              formatMessage(translations.filesProgression,
                {
                  start: dropZoneStatus.uploadedFiles,
                  end: dropZoneStatus.files
                }
              ) : null
          }
        />
      }
      <Dialog
        open={open}
        className={clsx(minimized && classes.minimized)}
        onDrop={preventWrongDrop}
        onDragOver={preventWrongDrop}
      >
        <DialogHeader
          title={formatMessage(translations.title)}
          subtitle={formatMessage(translations.subtitle)}
          onClose={dropZoneStatus.status === 'uploading' ? onMinimized : onClose}
          icon={dropZoneStatus.status === 'uploading' ? RemoveRoundedIcon : CloseRoundedIcon}
        />
        <DialogContent dividers className={classes.dialogContent}>
          <DropZone
            onStatusChange={onStatusChange}
            path={path}
            site={site}
            maxSimultaneousUploads={maxSimultaneousUploads}
            ref={inputRef}
          />
        </DialogContent>
        <DialogActions>
          {
            dropZoneStatus.files &&
            <Typography variant="caption" className={classes.status}>
              {formatMessage(translations.filesProgression,
                {
                  start: dropZoneStatus.uploadedFiles,
                  end: dropZoneStatus.files
                }
              )}
            </Typography>
          }
          {
            dropZoneStatus.status === 'idle' ? (
              <Button
                onClick={onClose}
                variant="contained"
                color='default'
              >
                {formatMessage(translations.close)}
              </Button>
            ) : (
              <>
                <Button
                  onClick={onBrowse}
                  variant="contained"
                  color='default'
                >
                  {formatMessage(translations.browse)}
                </Button>
                <Button
                  onClick={onClose}
                  disabled={dropZoneStatus.status === 'uploading'}
                  variant="contained"
                  color='primary'
                >
                  {formatMessage(translations.done)}
                </Button>
              </>
            )
          }
        </DialogActions>
      </Dialog>
    </div>
  )
}
