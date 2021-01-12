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

import React, { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { interval, Observable } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { defineMessages, useIntl } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ReplayIcon from '@material-ui/icons/ReplayRounded';
import DeleteRoundedIcon from '@material-ui/icons/DeleteRounded';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import Core from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';

import getDroppedFiles from '@uppy/utils/lib/getDroppedFiles';
import toArray from '@uppy/utils/lib/toArray';

import DialogHeader from './DialogHeader';
import Button from '@material-ui/core/Button';
import { getBulkUploadUrl } from '../../services/content';
import { LookupTable } from '../../models/LookupTable';
import { bytesToSize } from '../../utils/string';
import { useMinimizeDialog, useSpreadState, useSubject, useUnmount } from '../../utils/hooks';
import clsx from 'clsx';
import GetAppIcon from '@material-ui/icons/GetApp';
import RemoveRoundedIcon from '@material-ui/icons/RemoveRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import DialogFooter from './DialogFooter';
import DialogBody from './DialogBody';
import { minimizeDialog, updateDialog } from '../../state/reducers/dialogs/minimizedDialogs';
import { useDispatch } from 'react-redux';
import { ProgressBar } from '../SystemStatus/ProgressBar';
import palette from '../../styles/palette';
import StandardAction from '../../models/StandardAction';
import { emitSystemEvent, itemCreated } from '../../state/actions/system';
import { PrimaryButton } from '../PrimaryButton';

const translations = defineMessages({
  title: {
    id: 'uploadDialog.title',
    defaultMessage: 'Upload'
  },
  subtitle: {
    id: 'uploadDialog.subtitle',
    defaultMessage: 'Drop the desired files from your desktop into space below.'
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
    id: 'uploadDialog.dropHere',
    defaultMessage: 'Drop files here or <span>browse</span>'
  },
  browse: {
    id: 'words.browse',
    defaultMessage: 'Browse'
  },
  cancelAll: {
    id: 'uploadDialog.cancelAll',
    defaultMessage: 'Cancel all'
  },
  filesProgression: {
    id: 'uploadDialog.filesProgression',
    defaultMessage: '{start}/{end}'
  },
  uploadInProgress: {
    id: 'uploadDialog.uploadInProgress',
    defaultMessage:
      'Uploads are still in progress. Leaving this page would stop the pending uploads. Are you sure you wish to leave?'
  }
});

const useStyles = makeStyles((theme) =>
  createStyles({
    dialogContent: {
      flexDirection: 'row'
    },
    dragZone: {
      height: '300px',
      width: '100%',
      border: `2px dashed ${palette.gray.medium2}`,
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
        backgroundColor: theme.palette.type === 'dark' ? palette.gray.dark4 : palette.gray.light4,
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
    }
  })
);

const UppyItemStyles = makeStyles((theme) =>
  createStyles({
    cardRoot: {
      display: 'flex',
      backgroundColor: theme.palette.background.paper,
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
  };
  type: string;
  data: File | Blob;
  progress: {
    percentage: number;
    bytesUploaded: number;
    bytesTotal: number;
    uploadComplete: boolean;
    uploadStarted: number;
    status?: string;
  };
  size: number;
  isRemote: boolean;
  remote: {
    host: string;
    url: string;
  };
  preview: any;
}

interface UppyItemProps {
  file: any;

  retryFileUpload(file: UppyFile): void;

  onRemove(file: UppyFile): void;
}

function UppyItem(props: UppyItemProps) {
  const classes = UppyItemStyles({});
  const { file, retryFileUpload, onRemove } = props;

  const handleRetry = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, file: UppyFile) => {
    event.preventDefault();
    event.stopPropagation();
    retryFileUpload(file);
  };

  const handleRemove = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, file: UppyFile) => {
    event.preventDefault();
    event.stopPropagation();
    onRemove(file);
  };

  return (
    <Card className={classes.cardRoot}>
      {file.preview && <CardMedia title={file.id} image={file.preview} className={classes.cardMedia} />}
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
          {file.progress.percentage !== 100 && (
            <IconButton
              onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                handleRemove(event, file);
              }}
              className={classes.iconRetry}
            >
              <DeleteRoundedIcon />
            </IconButton>
          )}
          {file.progress.status === 'failed' && (
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
        <ProgressBar status={file.progress.status} progress={file.progress.percentage} />
      </CardContent>
    </Card>
  );
}

interface DropZoneProps {
  path: string;
  site: string;
  maxSimultaneousUploads: number;
  cancelRequestObservable$: Observable<any>;

  onStatusChange(status: DropZoneStatus): void;
  onFileUploaded(path: string): void;
}

const DropZone = React.forwardRef((props: DropZoneProps, ref: any) => {
  const classes = useStyles({});
  const dndRef = useRef(null);
  const { onStatusChange, path, site, maxSimultaneousUploads, onFileUploaded, cancelRequestObservable$ } = props;
  const { formatMessage } = useIntl();
  const [filesPerPath, setFilesPerPath] = useState<LookupTable<string[]>>(null);
  const [files, setFiles] = useSpreadState<LookupTable<UppyFile>>(null);
  const [dragOver, setDragOver] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(null);

  const retryFileUpload = (file: UppyFile) => {
    uppy.retryUpload(file.id);
  };

  const onRemove = (file: UppyFile) => {
    uppy.removeFile(file.id);
    setFiles({ [file.id]: null });
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
        const file: File & { relativePath?: string } = files[index];
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

  function checkFileExist(newFile: File) {
    return !uppy.getFiles().some((file) => file.name === newFile.name && file.type === newFile.type);
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
        Object.values(files).forEach((file: UppyFile) => {
          if (file?.progress?.percentage < 100) {
            successFiles[file.id] = null;
          } else {
            count++;
          }
        });
        setFiles(successFiles);
        setTotalFiles(count);
        onStatusChange({ status: 'complete', files: count });
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
    const handleUploadProgress = (file: UppyFile, progress: any) => {
      const newFile = { ...file, preview: uppy.getFile(file.id).preview };
      newFile.progress.bytesUploaded = progress.bytesUploaded;
      newFile.progress.bytesTotal = progress.bytesTotal;
      newFile.progress.percentage = Math.floor(
        parseInt(((progress.bytesUploaded / progress.bytesTotal) * 100).toFixed(2))
      );
      setFiles({ [file.id]: newFile });
      onStatusChange({ status: 'uploading' });
    };

    const handleUploadError = (file: UppyFile) => {
      const newFile = uppy.getFile(file.id) as UppyFile;
      newFile.progress.status = 'failed';
      setFiles({ [file.id]: newFile });
    };

    const handleFileAdded = (file: UppyFile) => {
      const newPath = file.meta.relativePath
        ? path + file.meta.relativePath.substring(0, file.meta.relativePath.lastIndexOf('/'))
        : path;
      uppy.setFileMeta(file.id, { path: newPath });
      file.meta.path = newPath;
      if (file.type.includes('image')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          file.preview = e.target.result;
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
    const handleUploadSuccess = (file, response) => {
      onFileUploaded(response.body.message.uri);
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
  }, [onStatusChange, totalFiles, uploadedFiles, onFileUploaded]);

  useEffect(() => {
    if (files !== null) {
      let filesPerPath: any = {};
      Object.values(files).forEach((file: UppyFile) => {
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
        className={clsx(classes.dragZone, dragOver && 'over', filesPerPath && 'hasFiles')}
        onDrop={handleOnDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !filesPerPath && ref.current?.click()}
      >
        {filesPerPath && files ? (
          Object.keys(filesPerPath).map((fileId) => (
            <div key={fileId} className={classes.sectionFiles}>
              <Typography variant="subtitle2" className={classes.sectionTitle}>
                {fileId}:
              </Typography>
              {files &&
                filesPerPath[fileId].map(
                  (id: string) =>
                    files[id] && (
                      <UppyItem file={files[id]} key={id} retryFileUpload={retryFileUpload} onRemove={onRemove} />
                    )
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

export interface DropZoneStatus {
  status?: string;
  files?: number;
  uploadedFiles?: number;
  progress?: number;
}

const initialDropZoneStatus: DropZoneStatus = {
  status: 'idle',
  files: null,
  uploadedFiles: 0,
  progress: 0
};

interface UploadDialogBaseProps {
  open: boolean;
  path: string;
  site: string;
  maxSimultaneousUploads?: number;
}

export type UploadDialogProps = PropsWithChildren<
  UploadDialogBaseProps & {
    onClose(response: { dropZoneStatus: DropZoneStatus; path?: string }): void;
    onClosed?(): void;
  }
>;

export interface UploadDialogStateProps extends UploadDialogBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
}

export default function UploadDialog(props: UploadDialogProps) {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  // NOTE: this id needs to changed if we added support to many dialogs at the same time;
  const id = 'uploadDialog';
  const { open, path, onClose } = props;
  const [dropZoneStatus, setDropZoneStatus] = useSpreadState<DropZoneStatus>(initialDropZoneStatus);

  const minimized = useMinimizeDialog({
    id,
    title: formatMessage(translations.title),
    minimized: false
  });

  const onMinimized = () => {
    dispatch(minimizeDialog({ id }));
  };

  const preventWrongDrop = (e: React.DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const onFileUploaded = useCallback(
    (path: string) => {
      dispatch(emitSystemEvent(itemCreated({ target: path })));
    },
    [dispatch]
  );

  const onStatusChange = useCallback(
    (status: DropZoneStatus) => {
      setDropZoneStatus(status);
      if (minimized) {
        dispatch(updateDialog({ id, status }));
      }
    },
    [setDropZoneStatus, minimized, dispatch]
  );

  return (
    <Dialog
      open={open && !minimized}
      keepMounted={minimized}
      onDrop={preventWrongDrop}
      onDragOver={preventWrongDrop}
      onBackdropClick={
        dropZoneStatus.status === 'uploading'
          ? onMinimized
          : () =>
              onClose({
                dropZoneStatus,
                path
              })
      }
      onEscapeKeyDown={
        dropZoneStatus.status === 'uploading'
          ? onMinimized
          : () =>
              onClose({
                dropZoneStatus,
                path
              })
      }
      onClose={() => onClose({ dropZoneStatus, path })}
      fullWidth
      maxWidth="sm"
    >
      <UploadDialogUI
        {...props}
        onMinimized={onMinimized}
        dropZoneStatus={dropZoneStatus}
        onFileUploaded={onFileUploaded}
        onStatusChange={onStatusChange}
      />
    </Dialog>
  );
}

interface UploadDialogUIProps extends UploadDialogProps {
  dropZoneStatus: DropZoneStatus;
  onMinimized?(): void;
  onStatusChange(status: DropZoneStatus): void;
  onFileUploaded(path: string): void;
}

function UploadDialogUI(props: UploadDialogUIProps) {
  const { formatMessage } = useIntl();
  const classes = useStyles({});
  const {
    site,
    path,
    onClose,
    onClosed,
    maxSimultaneousUploads = 1,
    onMinimized,
    onStatusChange,
    onFileUploaded,
    dropZoneStatus
  } = props;
  const inputRef = useRef(null);
  const cancelRef = useRef(null);

  const cancelRequestObservable$ = useSubject<void>();

  const onBrowse = () => {
    inputRef.current.click();
  };

  const onCancel = () => {
    cancelRequestObservable$.next();
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

  useUnmount(onClosed);

  return (
    <>
      <DialogHeader
        title={formatMessage(translations.title)}
        subtitle={formatMessage(translations.subtitle)}
        onDismiss={
          dropZoneStatus.status === 'uploading'
            ? onMinimized
            : () =>
                onClose({
                  dropZoneStatus,
                  path
                })
        }
        closeIcon={dropZoneStatus.status === 'uploading' ? RemoveRoundedIcon : CloseRoundedIcon}
      />
      <DialogBody className={classes.dialogContent}>
        <DropZone
          onFileUploaded={onFileUploaded}
          onStatusChange={onStatusChange}
          path={path}
          site={site}
          maxSimultaneousUploads={maxSimultaneousUploads}
          ref={inputRef}
          cancelRequestObservable$={cancelRequestObservable$}
        />
      </DialogBody>
      {dropZoneStatus.status !== 'idle' && (
        <DialogFooter>
          {dropZoneStatus.status === 'uploading' && (
            <Button
              id="cancelBtn"
              onClick={onCancel}
              variant="outlined"
              color="primary"
              ref={cancelRef}
              className={classes.cancelBtn}
              children={formatMessage(translations.cancelAll)}
            />
          )}
          {dropZoneStatus.files && (
            <Typography variant="caption" className={classes.status}>
              {formatMessage(translations.filesProgression, {
                start: dropZoneStatus.uploadedFiles,
                end: dropZoneStatus.files
              })}
            </Typography>
          )}
          <PrimaryButton onClick={onBrowse} children={formatMessage(translations.browse)} />
        </DialogFooter>
      )}
    </>
  );
}

function percentageCalculator(number: number, total: number): number {
  return Math.round((number / total) * 100);
}
