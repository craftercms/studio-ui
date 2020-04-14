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
import { Observable } from 'rxjs';
import { defineMessages, useIntl } from 'react-intl';
import makeStyles from '@material-ui/styles/makeStyles';
import createStyles from '@material-ui/styles/createStyles';
import IconButton from '@material-ui/core/IconButton';
import ReplayIcon from '@material-ui/icons/ReplayRounded';
import DeleteRoundedIcon from '@material-ui/icons/DeleteRounded';
import { Theme } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
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
import { useActiveSiteId, useMinimizeDialog, useSpreadState, useSubject } from '../utils/hooks';
import clsx from 'clsx';
import GetAppIcon from '@material-ui/icons/GetApp';
import RemoveRoundedIcon from '@material-ui/icons/RemoveRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import DialogFooter from './DialogFooter';
import DialogBody from './DialogBody';
import {
  maximizeDialog,
  minimizeDialog,
  updateDialog
} from '../state/reducers/dialogs/minimizedDialogs';
import { useDispatch } from 'react-redux';
import { ProgressBar } from './SystemStatus/ProgressBar';

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
    defaultMessage: 'Uploads are still in progress. Leaving this page would stop the pending uploads. Are you sure you wish to leave?'
  }
});

const useStyles = makeStyles((theme: Theme) => createStyles({
  dialogContent: {
    backgroundColor: palette.gray.light0,
    flexDirection: 'row'
  },
  dragZone: {
    height: '200px',
    width: '100%',
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
    },
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

  onRemove(file: UppyFile): void
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
      {
        file.preview &&
        <CardMedia title={file.id} image={file.preview} className={classes.cardMedia}/>
      }
      <CardContent className={classes.cardContentRoot}>
        <div className={classes.cardContent}>
          <div className={classes.cardContentText}>
            <Typography
              variant="body2"
              className={clsx(file.progress.status === 'failed' && classes.textFailed)}
            >
              {file.name}
            </Typography>
            <Typography variant="caption" className={classes.caption}>
              {file.type} @ {bytesToSize(file.size)}
            </Typography>
          </div>
          {
            file.progress.percentage !== 100 &&
            <IconButton onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
              handleRemove(event, file)
            }} className={classes.iconRetry}>
              <DeleteRoundedIcon/>
            </IconButton>
          }
          {
            file.progress.percentage === 'failed' &&
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
  cancelRequestObservable$: Observable<any>

  onStatusChange(status: DropZoneStatus): void;
}

const DropZone = React.forwardRef((props: DropZoneProps, ref: any) => {
  const classes = useStyles({});
  const dndRef = useRef(null);
  const generalProgress = useRef(null);
  const { onStatusChange, path, site, maxSimultaneousUploads, cancelRequestObservable$ } = props;
  const { formatMessage } = useIntl();
  const [filesPerPath, setFilesPerPath] = useState<LookupTable<any>>(null);
  const [files, setFiles] = useSpreadState<LookupTable<UppyFile>>(null);
  const [dragOver, setDragOver] = useState(null);
  const uppy = useMemo(() => Core({ debug: false, autoProceed: true }), []);
  const [uploadedFiles, setUploadedFiles] = useState(0);

  const retryFileUpload = (file: UppyFile) => {
    uppy.retryUpload(file.id)
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
    if (cancelRequestObservable$) {
      const subs = cancelRequestObservable$.subscribe(() => {
        uppy.cancelAll();
        let successFiles = { ...files };
        Object.values(files).forEach((file: UppyFile) => {
          if (file.progress.percentage < 100) {
            successFiles[file.id] = null;
          }
        });
        setFiles(successFiles);
        onStatusChange({ status: 'complete' });
      });
      return () => subs.unsubscribe();
    }
  }, [cancelRequestObservable$, files]);

  useEffect(() => {
    if (generalProgress.current) {
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
  }, [maxSimultaneousUploads, path, site, uppy]);

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
      uppy.setFileMeta(file.id, { path: newPath });
      file.meta.path = newPath;
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

  }, [filesPerPath, onStatusChange, path, setFiles, uppy]);

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
    if (files !== null) {
      let filesPerPath: any = {};
      let count = 0;
      Object.values(files).forEach((file: UppyFile) => {
        if (!file) return;
        if (!filesPerPath[file.meta.path]) {
          filesPerPath[file.meta.path] = [];
        }
        filesPerPath[file.meta.path].push(file.id);
        count++;
      });
      setFilesPerPath(Object.keys(filesPerPath).length ? filesPerPath : null);
      if (count) {
        onStatusChange({ files: count });
      } else {
        onStatusChange(initialDropZoneStatus);
      }
    }
  }, [files]);

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
                    files[id] &&
                    <UppyItem
                      file={files[id]} key={id}
                      retryFileUpload={retryFileUpload}
                      onRemove={onRemove}
                    />
                  )
                }
              </div>
            )
          ) : (
            <>
              <GetAppIcon className={clsx(classes.uploadIcon, dragOver && 'over')}/>
              <Typography variant="subtitle1">
                {
                  formatMessage(
                    translations.dropHere,
                    {
                      span: browse =>
                        <span key="browse" className={classes.browseText}>{browse}</span>
                    }
                  )
                }
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
      <section
        ref={generalProgress}
        className={clsx(classes.generalProgress, !filesPerPath && 'hidden')}
      />
    </>
  )
});

export interface DropZoneStatus {
  status?: string,
  files?: number,
  uploadedFiles?: number,
  progress?: number
}

const initialDropZoneStatus: DropZoneStatus = {
  status: 'idle',
  files: null,
  uploadedFiles: 0,
  progress: 0
};

interface BulkUploadProps {
  open: boolean;
  path: string;
  site?: string;
  maxSimultaneousUploads?: number;

  onClose(dropZoneStatus: DropZoneStatus): void;
}

export default function BulkUpload(props: BulkUploadProps) {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  // NOTE: this id needs to changed if we added support to many dialogs at the same time;
  const id = 'bulkUpload';
  const classes = useStyles({});
  const {
    onClose,
    path,
    maxSimultaneousUploads = 1,
    open
  } = props;
  const site = useActiveSiteId();
  const [dropZoneStatus, setDropZoneStatus] = useSpreadState<DropZoneStatus>(initialDropZoneStatus);
  const inputRef = useRef(null);
  const cancelRef = useRef(null);

  const minimized = useMinimizeDialog({
    id,
    title: formatMessage(translations.title),
    minimized: false
  });

  const onMinimized = () => {
    dispatch(minimizeDialog({ id }));
  };

  const onMaximized = () => {
    dispatch(maximizeDialog({ id }));
  };

  const cancelRequestObservable$ = useSubject<void>();

  const onStatusChange = useCallback((status: DropZoneStatus) => {
    setDropZoneStatus(status);
    if (minimized) {
      dispatch(updateDialog({ id, status }));
    }
  }, [setDropZoneStatus, minimized]);

  const onBrowse = () => {
    inputRef.current.click();
  };

  const onCancel = () => {
    cancelRequestObservable$.next();
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
    <Dialog
      open={open && !minimized}
      keepMounted={minimized}
      onDrop={preventWrongDrop}
      onDragOver={preventWrongDrop}
      onBackdropClick={dropZoneStatus.status === 'uploading' ? onMinimized : () => onClose(dropZoneStatus)}
      onEscapeKeyDown={dropZoneStatus.status === 'uploading' ? onMinimized : () => onClose(dropZoneStatus)}
    >
      <DialogHeader
        title={formatMessage(translations.title)}
        subtitle={formatMessage(translations.subtitle)}
        onClose={dropZoneStatus.status === 'uploading' ? onMinimized : () => onClose(dropZoneStatus)}
        closeIcon={dropZoneStatus.status === 'uploading' ? RemoveRoundedIcon : CloseRoundedIcon}
      />
      <DialogBody className={classes.dialogContent}>
        <DropZone
          onStatusChange={onStatusChange}
          path={path}
          site={site}
          maxSimultaneousUploads={maxSimultaneousUploads}
          ref={inputRef}
          cancelRequestObservable$={cancelRequestObservable$}
        />
      </DialogBody>

      {
        dropZoneStatus.status !== 'idle' &&
        <DialogFooter>
          {
            dropZoneStatus.status === 'uploading' &&
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

          }
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
          <Button
            onClick={onBrowse}
            variant="contained"
            color="primary"
          >
            {formatMessage(translations.browse)}
          </Button>
        </DialogFooter>
      }
    </Dialog>
  )
}
