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
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
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
import { getGlobalHeaders } from '../../utils/ajax';
import { validateActionPolicy } from '../../services/sites';
import { Action } from '../../models/Site';
import WarningIcon from '@material-ui/icons/WarningRounded';
import ForwardIcon from '@material-ui/icons/ForwardRounded';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDownRounded';
import ArrowRightRoundedIcon from '@material-ui/icons/ArrowRightRounded';
import ArrowLeftRoundedIcon from '@material-ui/icons/ArrowLeftRounded';
import SecondaryButton from '../SecondaryButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const translations = defineMessages({
  title: {
    id: 'uploadDialog.title',
    defaultMessage: 'Upload'
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
  },
  createPolicy: {
    id: 'uploadDialog.createPolicy',
    defaultMessage:
      'The supplied file path goes against site policies. Suggested file path is: "{path}". Would you like to use the suggested path?'
  },
  policyError: {
    id: 'uploadDialog.policyError',
    defaultMessage: 'The following files paths goes against site policies: {paths}'
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
    },
    subtitle: {
      fontSize: '14px',
      lineHeight: '18px'
    },
    subtitleWrapper: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    subtitlePolicyError: {
      color: theme.palette.error.main,
      display: 'flex',
      alignItems: 'center',
      '& svg': {
        marginRight: '5px'
      }
    }
  })
);

const UppyItemStyles = makeStyles((theme) =>
  createStyles({
    cardActive: {
      border: `1px solid ${theme.palette.primary.main}`
    },
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
    cardContentWrapper: {
      width: '100%'
    },
    cardContentText: {
      marginRight: 'auto'
    },
    cardContentFlexWrapper: {
      display: 'flex',
      justifyContent: 'space-between'
    },
    cardMedia: {
      width: '100px',
      backgroundColor: theme.palette.background.default,
      backgroundSize: 'contain'
    },
    caption: {
      color: palette.gray.medium5
    },
    sitePolicySuggestion: {
      color: theme.palette.error.main,
      display: 'flex',
      marginBottom: '10px',
      alignItems: 'center',
      '& svg': {
        marginRight: '5px'
      }
    },
    sitePolicySuggestionFileName: {
      display: 'flex',
      '& svg': {
        margin: '0 10px',
        color: theme.palette.text.primary
      }
    },
    sitePolicySuggestionActions: {
      marginTop: '10px',
      '& button:first-child': {
        marginRight: '15px'
      }
    },
    textAccepted: {
      color: theme.palette.success.main
    },
    textFailed: {
      color: theme.palette.error.main
    },
    textUnderlined: {
      textDecoration: 'line-through'
    },
    iconRetry: {
      height: '48px'
    }
  })
);

const uppy = Core({
  debug: false,
  autoProceed: false,
  onBeforeUpload: (files) => {
    const allowedFiles = {};
    Object.keys(files).forEach((key) => {
      // @ts-ignore
      if (files[key].meta.allowed && !files[key].meta.suggestedName) {
        allowedFiles[key] = files[key];
      }
    });
    return Object.keys(allowedFiles).length ? allowedFiles : false;
  }
});

export interface UppyFile {
  source: string;
  id: string;
  name: string;
  extension: string;
  meta: {
    site?: string;
    allowed?: boolean;
    suggestedName?: string;
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
  file: UppyFile;
  issueId?: number;
  active?: boolean;

  retryFileUpload(file: UppyFile): void;

  onRemove(file: UppyFile): void;
}

function UppyItem(props: UppyItemProps) {
  const classes = UppyItemStyles({});
  const { file, retryFileUpload, onRemove, issueId, active } = props;

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
    <Card className={clsx(classes.cardRoot, active && classes.cardActive)} data-issue-id={issueId}>
      {file.preview && <CardMedia title={file.id} image={file.preview} className={classes.cardMedia} />}
      <CardContent className={classes.cardContentRoot}>
        <div className={classes.cardContent}>
          {file.meta.allowed && file.meta.suggestedName && (
            <div className={classes.cardContentWrapper}>
              <div className={classes.sitePolicySuggestion}>
                <WarningIcon />
                <Typography variant="body2">
                  <FormattedMessage
                    id="uploadDialog.sitePolicySuggestion"
                    defaultMessage="File name “{name}” requires changes to comply with site policies."
                    values={{ name: file.name }}
                  />
                </Typography>
              </div>
              <div className={classes.sitePolicySuggestionFileName}>
                <Typography variant="body2" className={classes.textUnderlined}>
                  {file.name}
                </Typography>
                <ForwardIcon fontSize="small" />
                <Typography variant="body2" className={classes.textAccepted}>
                  {file.meta.suggestedName}
                </Typography>
              </div>
              <Typography variant="caption" className={classes.caption}>
                {file.type} @ {bytesToSize(file.size)}
              </Typography>
              <div className={classes.sitePolicySuggestionActions}>
                <SecondaryButton
                  size="small"
                  onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                    handleRemove(event, file);
                  }}
                >
                  <FormattedMessage id="sitePolicy.cancelUpload" defaultMessage="Cancel Upload" />
                </SecondaryButton>
                <PrimaryButton
                  size="small"
                  onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                    handleRetry(event, file);
                  }}
                >
                  <FormattedMessage id="sitePolicy.acceptChanges" defaultMessage="Accept Changes" />
                </PrimaryButton>
              </div>
            </div>
          )}
          {file.meta.allowed && !file.meta.suggestedName && (
            <>
              <div className={classes.cardContentText}>
                <Typography variant="body2" className={clsx(file.progress.status === 'failed' && classes.textFailed)}>
                  {file.name}
                </Typography>
                <Typography variant="caption" className={classes.caption}>
                  {file.type} @ {bytesToSize(file.size)}
                </Typography>
              </div>
              {(file.progress.percentage !== 100 || file.progress.status === 'failed') && (
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
            </>
          )}
          {file.meta.allowed === false && (
            <div className={classes.cardContentWrapper}>
              <div className={classes.sitePolicySuggestion}>
                <WarningIcon />
                <Typography variant="body2">
                  <FormattedMessage
                    id="uploadDialog.sitePolicyError"
                    defaultMessage="File name “{name}” doesn't comply with site policies and can’t be uploaded."
                    values={{ name: file.name }}
                  />
                </Typography>
              </div>
              <div className={classes.cardContentFlexWrapper}>
                <div>
                  <Typography variant="body2" className={classes.textUnderlined}>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" className={classes.caption}>
                    {file.type} @ {bytesToSize(file.size)}
                  </Typography>
                </div>
                <IconButton
                  onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                    handleRemove(event, file);
                  }}
                  className={classes.iconRetry}
                >
                  <DeleteRoundedIcon />
                </IconButton>
              </div>
            </div>
          )}
        </div>
        <ProgressBar status={file.progress.status} progress={file.progress.percentage} />
      </CardContent>
    </Card>
  );
}

type actionBus = 'accept' | 'reject' | 'next' | 'previous' | 'cancel' | 'showAll' | 'showIssuesOnly';

interface DropZoneProps {
  path: string;
  site: string;
  maxSimultaneousUploads: number;
  cancelRequestObservable$: Observable<any>;
  actionBus$: Observable<actionBus>;

  onStatusChange(status: DropZoneStatus): void;
  onFileUploaded(path: string): void;
}

const DropZone = React.forwardRef((props: DropZoneProps, ref: any) => {
  const classes = useStyles({});
  const dndRef = useRef(null);
  const {
    onStatusChange,
    path,
    site,
    maxSimultaneousUploads,
    onFileUploaded,
    cancelRequestObservable$,
    actionBus$
  } = props;
  const { formatMessage } = useIntl();
  const [filesPerPath, setFilesPerPath] = useState<LookupTable<string[]>>(null);
  const [filesPerPathFilteredByIssues, setFilesPerPathFilteredByIssues] = useState<LookupTable<string[]>>(null);
  const [files, setFiles] = useSpreadState<LookupTable<UppyFile>>(null);
  const [dragOver, setDragOver] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(null);
  const [issueIdPerFileId, setIssueIdPerFileId] = useState<LookupTable<number>>(null);
  const [selectedIssueId, setSelectedIssueId] = useState(0);
  const [showIssuesOnly, setShowIssuesOnly] = useState(false);

  const onPrevIssue = useCallback(() => {
    if (selectedIssueId > 0) {
      let prev = selectedIssueId - 1;
      setSelectedIssueId(prev);
      document.querySelector(`[data-issue-id="${prev}"]`)?.scrollIntoView();
    }
  }, [selectedIssueId]);

  const onNextIssue = useCallback(() => {
    let next = selectedIssueId + 1;
    const issue = document.querySelector(`[data-issue-id="${selectedIssueId}"]`);
    if (issue) {
      setSelectedIssueId(next);
      document.querySelector(`[data-issue-id="${selectedIssueId}"]`).scrollIntoView();
    }
  }, [selectedIssueId]);

  const retryFileUpload = (file: UppyFile) => {
    file.progress.status = 'uploading';
    if (file.meta.suggestedName) {
      file.meta.suggestedName = null;
      uppy.setFileMeta(file.id, { suggestedName: null });
    }
    setFiles({ [file.id]: file });
    uppy.retryUpload(file.id);
  };

  const onRemove = (file: UppyFile) => {
    if (selectedIssueId > 0 && selectedIssueId === issueIdPerFileId[file.id]) {
      setSelectedIssueId(selectedIssueId - 1);
    }
    if (uploadedFiles === totalFiles - 1) {
      setShowIssuesOnly(false);
    }
    uppy.removeFile(file.id);
    setTotalFiles(totalFiles - 1);
    onStatusChange({ ...(uploadedFiles === totalFiles - 1 && { status: 'complete' }), files: totalFiles - 1 });
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
    getDroppedFiles(event.dataTransfer).then((fileList) => {
      const files = fileList.filter((file) => checkFileExist(file));
      if (files.length) {
        addFiles(files);
      }
    });
    setDragOver(false);
    removeDragData(event);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = toArray(event.target.files).filter((file) => checkFileExist(file));
    if (files.length) {
      addFiles(files);
    }
    event.target.value = null;
  };

  function addFiles(files: File[]) {
    setTotalFiles(totalFiles + files.length);
    onStatusChange({ status: 'validating', files: totalFiles + files.length });
    validateActionPolicy(
      site,
      files.map((file) => ({
        type: 'CREATE',
        target: `${path}/${file.name}`
      })) as Action[]
    ).subscribe((response) => {
      onStatusChange({ status: 'adding' });
      interval(50)
        .pipe(takeUntil(cancelRequestObservable$), take(response.length))
        .subscribe((index) => {
          const { allowed, modifiedValue, target } = response[index];
          const fileName = target.replace(`${path}/`, '');
          const file: File & { relativePath?: string } = files.find((file) => file.name === fileName);
          uppy.addFile({
            name: file.name,
            type: file.type,
            data: file,
            meta: {
              allowed: allowed,
              ...(modifiedValue && { suggestedName: modifiedValue.replace(`${path}/`, '') }),
              relativePath: file.relativePath || null
            }
          });
        });
    });
  }

  function checkFileExist(newFile: File) {
    return (
      !files || !Object.values(files).some((file) => file && file.name === newFile.name && file.type === newFile.type)
    );
  }

  function removeDragData(event: React.DragEvent<HTMLElement>) {
    if (event.dataTransfer.items) {
      event.dataTransfer.items.clear();
    } else {
      event.dataTransfer.clearData();
    }
  }

  // Listening sitePolicyOptions: acceptAll or rejectAll
  useEffect(() => {
    const subs = actionBus$.subscribe((option) => {
      if (option === 'reject') {
        const successFiles = { ...files };
        let count = 0;
        Object.values(files).forEach((file) => {
          if (!file) return;
          if ((file.meta.allowed && file.meta.suggestedName) || !file.meta.allowed) {
            uppy.removeFile(file.id);
            successFiles[file.id] = null;
          } else {
            count++;
          }
        });
        setFiles(successFiles);
        setTotalFiles(count);
        setSelectedIssueId(0);
        onStatusChange({ ...(uploadedFiles === count && { status: 'complete' }), files: count });
      } else if (option === 'accept') {
        const successFiles = { ...files };
        Object.values(files).forEach((file) => {
          if (!file) return;
          if (file.meta.allowed && file.meta.suggestedName) {
            successFiles[file.id] = {
              ...file,
              meta: { ...file.meta, suggestedName: null },
              progress: { ...file.progress, status: 'uploading' }
            };
            uppy.setFileMeta(file.id, { suggestedName: null });
            uppy.retryUpload(file.id);
          }
        });
        setFiles(successFiles);
        setSelectedIssueId(0);
      } else if (option === 'next') {
        onNextIssue();
      } else if (option === 'previous') {
        onPrevIssue();
      } else if (option === 'showAll' || option === 'showIssuesOnly') {
        setShowIssuesOnly(option === 'showIssuesOnly');
      }
    });
    return () => subs.unsubscribe();
  }, [files, onStatusChange, actionBus$, setFiles, uploadedFiles, onNextIssue, onPrevIssue]);

  useEffect(() => {
    if (cancelRequestObservable$) {
      const subs = cancelRequestObservable$.subscribe(() => {
        uppy.cancelAll();
        const successFiles = { ...files };
        let count = 0;
        Object.values(files).forEach((file: UppyFile) => {
          if (file?.progress?.percentage < 100 || file?.progress?.status === 'failed') {
            successFiles[file.id] = null;
          } else {
            count++;
          }
        });
        setFiles(successFiles);
        setTotalFiles(count);
        setSelectedIssueId(0);
        setShowIssuesOnly(false);
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
        limit: maxSimultaneousUploads,
        headers: getGlobalHeaders()
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
            file.preview = e.target.result;
            setFiles({ [file.id]: file });
            if (file.meta.allowed && !file.meta.suggestedName) {
              uppy.retryUpload(file.id);
            } else {
              onStatusChange({ status: 'pending' });
            }
          } catch (error) {
            console.error(error);
          }
        };
        reader.readAsDataURL(file.data);
      } else {
        if (file.meta.allowed && !file.meta.suggestedName) {
          uppy.retryUpload(file.id);
        } else {
          onStatusChange({ status: 'pending' });
        }
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
      } else {
        onStatusChange({ status: 'pending' });
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
      let filesPerPathFilteredByIssues: any = {};
      let issueNumberPerFileId: any = {};
      let count = 0;
      Object.values(files).forEach((file: UppyFile) => {
        if (!file) return;
        if (!filesPerPath[file.meta.path]) {
          filesPerPath[file.meta.path] = [];
          filesPerPathFilteredByIssues[file.meta.path] = [];
        }
        if (file.meta.suggestedName || !file.meta.allowed) {
          filesPerPathFilteredByIssues[file.meta.path].push(file.id);
          issueNumberPerFileId[file.id] = count;
          count++;
        }
        filesPerPath[file.meta.path].push(file.id);
      });

      onStatusChange({ sitePolicyFileCount: count });
      setIssueIdPerFileId(issueNumberPerFileId);
      setFilesPerPath(Object.keys(filesPerPath).length ? filesPerPath : null);
      setFilesPerPathFilteredByIssues(
        Object.keys(filesPerPathFilteredByIssues).length ? filesPerPathFilteredByIssues : null
      );
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
          Object.keys(showIssuesOnly ? filesPerPathFilteredByIssues : filesPerPath).map((fileId, x) => (
            <div key={fileId} className={classes.sectionFiles}>
              <Typography variant="subtitle2" className={classes.sectionTitle}>
                {fileId}:
              </Typography>
              {files &&
                (showIssuesOnly ? filesPerPathFilteredByIssues : filesPerPath)[fileId].map(
                  (id: string, y) =>
                    files[id] && (
                      <UppyItem
                        issueId={
                          (files[id].meta.allowed && files[id].meta.suggestedName) || !files[id].meta.allowed
                            ? issueIdPerFileId[id]
                            : null
                        }
                        active={selectedIssueId === issueIdPerFileId[id]}
                        file={files[id]}
                        key={id}
                        retryFileUpload={retryFileUpload}
                        onRemove={onRemove}
                      />
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

type status = 'adding' | 'validating' | 'pending' | 'uploading' | 'failed' | 'complete' | 'idle';

export interface DropZoneStatus {
  status?: status;
  files?: number;
  uploadedFiles?: number;
  progress?: number;
  sitePolicyFileCount?: number;
}

const initialDropZoneStatus: DropZoneStatus = {
  status: 'idle',
  files: null,
  uploadedFiles: 0,
  progress: 0,
  sitePolicyFileCount: null
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
        dispatch(updateDialog({ id, status: status.progress }));
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
      maxWidth={dropZoneStatus.files ? 'md' : 'sm'}
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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [showAll, setShowAll] = useState<boolean>(true);

  const cancelRequestObservable$ = useSubject<void>();
  const actionBus$ = useSubject<actionBus>();

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const onBrowse = () => {
    inputRef.current.click();
  };

  const onCancel = () => {
    cancelRequestObservable$.next();
  };

  const onOptionMenuClicked = (option: actionBus) => {
    closeMenu();
    actionBus$.next(option);
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
        classes={{
          subtitleWrapper: classes.subtitleWrapper
        }}
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
      >
        {Boolean(dropZoneStatus.sitePolicyFileCount) ? (
          <>
            <div className={classes.subtitlePolicyError}>
              <WarningIcon />
              <Typography className={classes.subtitle}>
                <FormattedMessage
                  id="sitePolicy.subtitle"
                  defaultMessage="{count, plural, one {{count} file name present a issue. Please review the item.} other {{count} file names present issues. Please review the list.}}"
                  values={{
                    count: dropZoneStatus.sitePolicyFileCount
                  }}
                />
              </Typography>
            </div>
            <div>
              <IconButton size="small" color="primary" onClick={() => onOptionMenuClicked('previous')}>
                <ArrowLeftRoundedIcon />
              </IconButton>
              <IconButton size="small" color="primary" onClick={() => onOptionMenuClicked('next')}>
                <ArrowRightRoundedIcon />
              </IconButton>
              <Button size="small" onClick={openMenu} color="primary">
                <FormattedMessage id="words.options" defaultMessage="Options" />
                <ArrowDropDownIcon />
              </Button>
            </div>
            <Menu
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              open={Boolean(anchorEl)}
              onClose={closeMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
            >
              <MenuItem onClick={() => onOptionMenuClicked('accept')}>
                <FormattedMessage id="sitePolicyOptionAcceptAll" defaultMessage="Accept all changes" />
              </MenuItem>
              <MenuItem onClick={() => onOptionMenuClicked('reject')}>
                <FormattedMessage id="sitePolicyOptionRejectAll" defaultMessage="Reject all changes" />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onOptionMenuClicked(showAll ? 'showIssuesOnly' : 'showAll');
                  setShowAll(!showAll);
                }}
              >
                {showAll ? (
                  <FormattedMessage id="sitePolicyOptionIssuesOnly" defaultMessage="Show issues only" />
                ) : (
                  <FormattedMessage id="sitePolicyOptionShowAll" defaultMessage="Show all files" />
                )}
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Typography className={classes.subtitle}>
            <FormattedMessage
              id="uploadDialog.subtitle"
              defaultMessage="Drop the desired files from your desktop into space below."
            />
          </Typography>
        )}
      </DialogHeader>
      <DialogBody className={classes.dialogContent}>
        <DropZone
          onFileUploaded={onFileUploaded}
          onStatusChange={onStatusChange}
          path={path}
          site={site}
          maxSimultaneousUploads={maxSimultaneousUploads}
          ref={inputRef}
          cancelRequestObservable$={cancelRequestObservable$}
          actionBus$={actionBus$}
        />
      </DialogBody>
      {dropZoneStatus.status !== 'idle' && (
        <DialogFooter>
          {['pending', 'uploading', 'validating', 'adding'].includes(dropZoneStatus.status) && (
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
          {Boolean(dropZoneStatus.files) && (
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
