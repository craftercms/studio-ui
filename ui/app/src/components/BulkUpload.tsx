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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ReplayIcon from '@material-ui/icons/Replay';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import { Core, XHRUpload } from 'uppy';

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
import { useSpreadState, useSubject } from '../utils/hooks';
import clsx from 'clsx';
import GetAppIcon from '@material-ui/icons/GetApp';
import RemoveRoundedIcon from '@material-ui/icons/RemoveRounded';
import AddRoundedIcon from '@material-ui/icons/AddRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import Paper from '@material-ui/core/Paper';
import { interval, Observable } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { UppyFile } from '@uppy/core';

const translations = defineMessages({
  title: {
    id: 'bulkUpload.title',
    defaultMessage: 'Bulk Upload'
  },
  subtitle: {
    id: 'bulkUpload.subtitle',
    defaultMessage: 'Drop the desired files from your desktop into the browser window.'
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
  cancelAll: {
    id: 'bulkUpload.cancelAll',
    defaultMessage: 'Cancel all'
  },
  filesProgression: {
    id: 'bulkUpload.filesProgression',
    defaultMessage: '{start}/{end}'
  },
  uploadInProgress: {
    id: 'bulkUpload.uploadInProgress',
    defaultMessage:
      'Uploads are still in progress. Leaving this page would stop the pending uploads. Are you sure you wish to leave?'
  }
});

const useStyles = makeStyles(() =>
  createStyles({
    dialogContent: {
      backgroundColor: palette.gray.light0
    },
    dragZone: {
      height: '300px',
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
        minHeight: '300px',
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
      '&.hidden': {
        display: 'none'
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
    cancelBtn: {
      marginRight: 'auto'
    },
    status: {
      marginLeft: 'auto'
    },
    minimized: {
      display: 'none'
    }
  })
);

const useUppyItemStyles = makeStyles(() =>
  createStyles({
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
  })
);

const uppy = Core({ debug: false, autoProceed: true });

type FileWithRelativePath = File & { relativePath?: string };

interface LocalUppyFileMeta {
  site?: string;
  relativePath?: string;
  name: string;
  type: string;
  path: string;
  status: string;
  progressPercentage: number;
}

type LocalUppyFile = UppyFile<LocalUppyFileMeta>;

interface UppyItemProps {
  file: any;

  retryFileUpload(file: LocalUppyFile): void;
}

function UppyItem(props: UppyItemProps) {
  const classes = useUppyItemStyles({});
  const { file, retryFileUpload } = props;

  const handleRetry = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, file: LocalUppyFile) => {
    event.preventDefault();
    event.stopPropagation();
    retryFileUpload(file);
  };

  return (
    <Card className={classes.cardRoot}>
      {file.preview && <CardMedia title={file.id} image={file.preview} className={classes.cardMedia} />}
      <CardContent className={classes.cardContentRoot}>
        <div className={classes.cardContent}>
          <div className={classes.cardContentText}>
            <Typography variant="body2" className={clsx(file.meta.status === 'failed' && classes.textFailed)}>
              {file.name}
            </Typography>
            <Typography variant="caption" className={classes.caption}>
              {file.type} @ {bytesToSize(file.size)}
            </Typography>
          </div>
          {file.meta.status === 'failed' && (
            <IconButton
              onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                handleRetry(event, file);
              }}
              className={classes.iconRetry}
            >
              <ReplayIcon />
            </IconButton>
          )}
        </div>
        <ProgressBar status={file.meta.status} progress={file.meta.progressPercentage} />
      </CardContent>
    </Card>
  );
}

interface DropZoneProps {
  path: string;
  site: string;
  maxSimultaneousUploads: number;
  cancelRequestObservable$: Observable<any>;

  onStatusChange(status: any): void;
}

const DropZone = React.forwardRef((props: DropZoneProps, ref: any) => {
  const classes = useStyles({});
  const dndRef = useRef(null);
  const { onStatusChange, path, site, maxSimultaneousUploads, cancelRequestObservable$ } = props;
  const { formatMessage } = useIntl();
  const [filesPerPath, setFilesPerPath] = useState<LookupTable<string[]>>(null);
  const [files, setFiles] = useSpreadState<LookupTable<LocalUppyFile>>(null);
  const [dragOver, setDragOver] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(null);

  const retryFileUpload = (file: LocalUppyFile) => {
    uppy.retryUpload(file.id);
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
    getDroppedFiles(event.dataTransfer).then((files) => addFiles(files));
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
    setTotalFiles(totalFiles + files.length);
    onStatusChange({ status: 'adding', files: totalFiles + files.length });
    interval(50)
      .pipe(takeUntil(cancelRequestObservable$), take(files.length))
      .subscribe((index) => {
        const file: FileWithRelativePath = files[index];
        checkFileExist(file) &&
          uppy.addFile({
            name: file.name,
            type: file.type,
            data: file,
            meta: {
              relativePath: file.relativePath || null
            }
          });
      });
  }

  function checkFileExist(newFile: FileWithRelativePath) {
    return !uppy
      .getFiles<LocalUppyFileMeta>()
      .some((file) =>
        newFile.relativePath
          ? file.meta.relativePath === newFile.relativePath && file.type === newFile.type
          : file.name === newFile.name && file.type === newFile.type
      );
  }

  function removeDragData(event: React.DragEvent<HTMLElement>) {
    if (event.dataTransfer.items) {
      event.dataTransfer.items.clear();
    } else {
      event.dataTransfer.clearData();
    }
  }

  useEffect(() => {
    if (cancelRequestObservable$) {
      const subs = cancelRequestObservable$.subscribe(() => {
        uppy.cancelAll();
        let successFiles = { ...files };
        let count = 0;
        Object.values(files).forEach((file: LocalUppyFile) => {
          if (file?.progress?.percentage < 100) {
            successFiles[file.id] = null;
          } else {
            count++;
          }
        });
        setFiles(successFiles);
        setTotalFiles(count);
        setUploadedFiles(count);
        onStatusChange({ status: 'complete', uploadedFiles: count, files: count });
      });
      return () => subs.unsubscribe();
    }
  }, [cancelRequestObservable$, files, onStatusChange, setFiles]);

  useEffect(() => {
    uppy
      .use(XHRUpload, {
        endpoint: getBulkUploadUrl(site, path),
        formData: true,
        fieldName: 'file',
        limit: maxSimultaneousUploads
      })
      .setMeta({ site });
    return () => {
      // https://uppy.io/docs/uppy/#uppy-close
      uppy.reset();
      uppy.close();
    };
  }, [maxSimultaneousUploads, path, site]);

  useEffect(() => {
    const handleUploadProgress = (file: LocalUppyFile, progress: any) => {
      const newFile = { ...file, preview: uppy.getFile(file.id).preview };
      newFile.progress.bytesUploaded = progress.bytesUploaded;
      newFile.progress.bytesTotal = progress.bytesTotal;
      newFile.meta.progressPercentage = Math.floor(
        parseInt(((progress.bytesUploaded / progress.bytesTotal) * 100).toFixed(2))
      );
      setFiles({ [file.id]: newFile });
      onStatusChange({ status: 'uploading' });
    };

    const handleUploadError = (file: LocalUppyFile) => {
      const newFile = uppy.getFile(file.id) as LocalUppyFile;
      newFile.meta.status = 'failed';
      setFiles({ [file.id]: newFile });
    };

    const handleFileAdded = (file: LocalUppyFile) => {
      const newPath = file.meta.relativePath
        ? path + file.meta.relativePath.substring(0, file.meta.relativePath.lastIndexOf('/'))
        : path;
      uppy.setFileMeta(file.id, { path: newPath });
      file.meta.path = newPath;
      if (file.type.includes('image')) {
        const reader = new FileReader();
        reader.onload = function (e) {
          file.preview = e.target.result as string;
          try {
            uppy.setFileState(file.id, { preview: e.target.result });
            setFiles({ [file.id]: file });
          } catch (error) {
            console.error(error);
          }
        };
        reader.readAsDataURL(file.data);
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
    };
  }, [filesPerPath, onStatusChange, path, setFiles]);

  useEffect(() => {
    const handleUploadSuccess = () => {
      setUploadedFiles(uploadedFiles + 1);
      onStatusChange({ uploadedFiles: uploadedFiles + 1 });
    };

    const handleComplete = () => {
      if (uploadedFiles === totalFiles) {
        onStatusChange({ status: 'complete', progress: 100 });
      }
    };

    const handleError = () => {
      onStatusChange({ status: 'failed' });
    };

    uppy.on('upload-success', handleUploadSuccess);
    uppy.on('complete', handleComplete);
    uppy.on('error', handleError);
    return () => {
      uppy.off('upload-success', handleUploadSuccess);
      uppy.off('complete', handleComplete);
      uppy.off('error', handleError);
    };
  }, [onStatusChange, totalFiles, uploadedFiles]);

  useEffect(() => {
    if (files !== null) {
      let filesPerPath: any = {};
      Object.values(files).forEach((file: LocalUppyFile) => {
        if (!file) return;
        if (!filesPerPath[file.meta.path]) {
          filesPerPath[file.meta.path] = [];
        }
        filesPerPath[file.meta.path].push(file.id);
      });
      setFilesPerPath(Object.keys(filesPerPath).length ? filesPerPath : null);
    }
  }, [files, onStatusChange]);

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
        {filesPerPath && files ? (
          Object.keys(filesPerPath).map((fileId) => (
            <div key={fileId} className={classes.sectionFiles}>
              <Typography variant="subtitle2" className={classes.sectionTitle}>
                {fileId}:
              </Typography>
              {files &&
                filesPerPath[fileId].map(
                  (id: string) => files[id] && <UppyItem file={files[id]} key={id} retryFileUpload={retryFileUpload} />
                )}
            </div>
          ))
        ) : (
          <>
            <GetAppIcon className={clsx(classes.uploadIcon, dragOver && 'over')} />
            <Typography variant="subtitle1">
              {formatMessage(translations.dropHere, {
                span: (browse) => (
                  <span key="browse" className={classes.browseText}>
                    {browse}
                  </span>
                )
              })}
            </Typography>
          </>
        )}
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
      <section className={clsx(classes.generalProgress, !filesPerPath && 'hidden')}>
        <ProgressBar progress={percentageCalculator(uploadedFiles, totalFiles)} />
      </section>
    </>
  );
});

const minimizedBarStyles = makeStyles((theme: Theme) =>
  createStyles({
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
  })
);

interface MinimizedBarProps {
  title: string;
  subtitle?: string;
  status?: {
    status: string;
    progress: number;
  };

  onMaximized(): void;
}

function MinimizedBar(props: MinimizedBarProps) {
  const { title, onMaximized, subtitle, status } = props;
  const classes = minimizedBarStyles({});
  return (
    <Paper className={classes.root}>
      <Typography variant="h6">{title}</Typography>
      {subtitle && (
        <Typography variant="subtitle1" className={classes.subtitle}>
          {subtitle}
        </Typography>
      )}
      {onMaximized ? (
        <IconButton aria-label="close" onClick={onMaximized}>
          <AddRoundedIcon />
        </IconButton>
      ) : null}
      <ProgressBar status={status.status} progress={status.progress} />
    </Paper>
  );
}

const progressBarStyles = makeStyles((theme: Theme) =>
  createStyles({
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
  })
);

function ProgressBar(props: any) {
  const { status, progress } = props;
  const classes = progressBarStyles({});
  return (
    <div className={classes.progressBar}>
      <div
        className={clsx(classes.progressBarInner, status === 'failed' && 'failed', progress === 100 && 'complete')}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export interface DropZoneStatus {
  status?: string;
  files?: number;
  uploadedFiles?: number;
  progress?: number;
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
  const cancelRef = useRef(null);
  const [minimized, setMinimized] = useState(!open);

  const onStatusChange = useCallback(
    (status: DropZoneStatus) => {
      setDropZoneStatus({
        ...status,
        progress: percentageCalculator(status.uploadedFiles, status.files)
      });
    },
    [setDropZoneStatus]
  );

  const cancelRequestObservable$ = useSubject<void>();

  const onBrowse = () => {
    inputRef.current.click();
  };

  const onCancel = () => {
    cancelRequestObservable$.next();
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
      return formatMessage(translations.uploadInProgress);
    };
    if (dropZoneStatus.status === 'uploading') {
      window.onbeforeunload = handleBeforeUpload;
    } else if (dropZoneStatus.status === 'complete') {
      window.onbeforeunload = null;
    }
    return () => {
      window.onbeforeunload = null;
    };
  }, [dropZoneStatus.status, formatMessage]);

  return (
    <div className={'bulkUpload'}>
      {minimized && (
        <MinimizedBar
          title={formatMessage(translations.title)}
          onMaximized={onMaximized}
          status={dropZoneStatus}
          subtitle={
            dropZoneStatus.files
              ? formatMessage(translations.filesProgression, {
                  start: dropZoneStatus.uploadedFiles,
                  end: dropZoneStatus.files
                })
              : null
          }
        />
      )}
      <Dialog
        open={open}
        className={clsx(minimized && classes.minimized)}
        onDrop={preventWrongDrop}
        onDragOver={preventWrongDrop}
        fullWidth
        maxWidth={'sm'}
      >
        <DialogHeader
          title={formatMessage(translations.title)}
          subtitle={formatMessage(translations.subtitle)}
          onClose={dropZoneStatus.status === 'uploading' ? onMinimized : () => onClose(dropZoneStatus)}
          icon={dropZoneStatus.status === 'uploading' ? RemoveRoundedIcon : CloseRoundedIcon}
        />
        <DialogContent dividers className={classes.dialogContent}>
          <DropZone
            onStatusChange={onStatusChange}
            path={path}
            site={site}
            maxSimultaneousUploads={maxSimultaneousUploads}
            ref={inputRef}
            cancelRequestObservable$={cancelRequestObservable$}
          />
        </DialogContent>
        <DialogActions>
          {dropZoneStatus.status === 'uploading' && (
            <Button
              id="cancelBtn"
              onClick={onCancel}
              variant="contained"
              color="default"
              ref={cancelRef}
              className={classes.cancelBtn}
            >
              {formatMessage(translations.cancelAll)}
            </Button>
          )}
          {dropZoneStatus.files && (
            <Typography variant="caption" className={classes.status}>
              {formatMessage(translations.filesProgression, {
                start: dropZoneStatus.uploadedFiles,
                end: dropZoneStatus.files
              })}
            </Typography>
          )}
          <Button onClick={onBrowse} variant="contained" color="primary">
            {formatMessage(translations.browse)}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function percentageCalculator(number: number, total: number): number {
  return Math.round((number / total) * 100);
}
