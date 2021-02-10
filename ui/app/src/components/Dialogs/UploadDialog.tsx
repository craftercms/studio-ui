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

import React, { PropsWithChildren, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from './DialogHeader';
import { useMinimizeDialog, useUnmount } from '../../utils/hooks';
import DialogBody from './DialogBody';
import { minimizeDialog } from '../../state/reducers/dialogs/minimizedDialogs';
import { useDispatch } from 'react-redux';
import StandardAction from '../../models/StandardAction';
import { Dashboard, useUppy } from '@uppy/react';
import { XHRUpload } from 'uppy';
import { Uppy } from '@uppy/core';
import ImageEditor from '@uppy/image-editor';

import '@uppy/image-editor/dist/style.css';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';

import { getBulkUploadUrl } from '../../services/content';
import { getGlobalHeaders } from '../../utils/ajax';
import { UppyFile } from '@uppy/utils';
import { validateActionPolicy } from '../../services/sites';
import { Action } from '../../models/Site';
import TabPanel from '@material-ui/lab/TabPanel';
import Tab from '@material-ui/core/Tab';
import TabContext from '@material-ui/lab/TabContext';
import { FormattedMessage } from 'react-intl/lib';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import IconButton from '@material-ui/core/IconButton';
import ArrowLeftRoundedIcon from '@material-ui/icons/ArrowLeftRounded';
import ArrowRightRoundedIcon from '@material-ui/icons/ArrowRightRounded';
import Button from '@material-ui/core/Button';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDownRounded';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Card from '@material-ui/core/Card';
import clsx from 'clsx';
import CardContent from '@material-ui/core/CardContent';
import WarningIcon from '@material-ui/icons/WarningRounded';
import ForwardIcon from '@material-ui/icons/ForwardRounded';
import { bytesToSize } from '../../utils/string';
import SecondaryButton from '../SecondaryButton';
import { PrimaryButton } from '../PrimaryButton';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import palette from '../../styles/palette';
import { nou } from '../../utils/object';

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
    rootTitle: {
      paddingBottom: 0
    },
    rootTabPanel: {
      padding: 0
    },
    rootTab: {
      minWidth: 'auto'
    },
    subtitleWrapper: {
      paddingBottom: 0,
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'space-between'
    }
  })
);

interface UploadDialogBaseProps {
  open: boolean;
  path: string;
  site: string;
  maxSimultaneousUploads?: number;
}

export type UploadDialogProps = PropsWithChildren<
  UploadDialogBaseProps & {
    onClose(): void;
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

  return (
    <Dialog
      open={open && !minimized}
      keepMounted={minimized}
      onDrop={preventWrongDrop}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <UploadDialogUI {...props} onMinimized={onMinimized} />
    </Dialog>
  );
}

interface UploadDialogUIProps extends UploadDialogProps {
  onMinimized?(): void;
}

interface ConflictedFile {
  id: string;
  name: string;
  suggestedName?: string;
  allowed?: boolean;
  index: number;
  size: number;
  type: string;
  data: Blob | File;
  meta?: {
    relativePath?: string;
  };
}

function UploadDialogUI(props: UploadDialogUIProps) {
  const { formatMessage } = useIntl();
  const classes = useStyles({});
  const { site, path, onClose, onClosed, maxSimultaneousUploads = 1, onMinimized } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [conflictedFiles, setConflictedFiles] = useState<ConflictedFile[]>([]);
  const [disableUpload, setDisableUpload] = useState(true);
  const [currentTab, setCurrentTab] = React.useState('1');

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setCurrentTab(newValue);
  };

  const uppy = useUppy(() => {
    return new Uppy({
      meta: { site },
      onBeforeFileAdded: (currentFile: UppyFile, files) => {
        const filePath = currentFile.meta.relativePath
          ? path + currentFile.meta.relativePath.substring(0, currentFile.meta.relativePath.lastIndexOf('/'))
          : path;
        return { ...currentFile, meta: { ...currentFile.meta, path: filePath } };
      }
    })
      .use(XHRUpload, {
        endpoint: getBulkUploadUrl(site, path),
        formData: true,
        fieldName: 'file',
        limit: maxSimultaneousUploads,
        headers: getGlobalHeaders()
      })
      .use(ImageEditor, { id: 'ImageEditor' });
  });

  useEffect(() => {
    const handleFilesAdded = (files: UppyFile[]) => {
      // EveryTime a file is added will trigger this event, the below filter should remove the validated ones
      const pendingValidationFiles = files.filter((file) => nou(file.meta.validated));

      if (pendingValidationFiles.length === 0) {
        setDisableUpload(false);
        return;
      }

      setDisableUpload(true);
      validateActionPolicy(
        site,
        pendingValidationFiles.map((file) => ({
          type: 'CREATE',
          target: `${path}/${file.name}`
        })) as Action[]
      ).subscribe((response) => {
        let disable = false;
        response.forEach((contentValidationResult, index) => {
          const { allowed, modifiedValue, target } = contentValidationResult;
          const fileName = target.replace(`${path}/`, '');
          const file = pendingValidationFiles.find((file) => file.name === fileName);
          setConflictedFiles((files) => [
            ...(files ? files : []),
            {
              id: file.id,
              name: fileName,
              data: file.data,
              ...(modifiedValue && { suggestedName: modifiedValue.replace(`${path}/`, '') }),
              allowed,
              size: file.size,
              type: file.type,
              meta: {
                relativePath: file.meta.relativePath
              },
              index
            }
          ]);

          if (!allowed || modifiedValue) {
            disable = true;
            uppy.removeFile(file.id);
          }
        });
        setDisableUpload(disable);
      });
    };

    uppy.on('files-added', handleFilesAdded);

    return () => {
      uppy.off('files-added', handleFilesAdded);
    };
  }, [path, site, uppy]);

  useUnmount(() => {
    uppy.close();
    onClosed();
  });

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const onRemove = (conflictedFile: ConflictedFile) => {
    uppy.removeFile(conflictedFile.id);
  };

  const onRetryFileUpload = (conflictedFile: ConflictedFile) => {
    setConflictedFiles((prev) => prev.filter((file) => file.id !== conflictedFile.id));
    uppy.addFile({
      name: conflictedFile.name,
      type: conflictedFile.type,
      data: conflictedFile.data,
      meta: {
        ...conflictedFile.meta,
        validated: true
      }
    });
  };

  return (
    <>
      <DialogHeader
        title={formatMessage(translations.title)}
        classes={{ root: classes.rootTitle, subtitleWrapper: classes.subtitleWrapper }}
        onDismiss={onClose}
        rightActions={[
          {
            icon: 'MinimizeIcon',
            onClick: onMinimized
          }
        ]}
      >
        {Boolean(conflictedFiles.length) && (
          <>
            <Tabs value={currentTab} onChange={handleChange}>
              <Tab
                label={<FormattedMessage id="words.files" defaultMessage="Files" />}
                value="1"
                classes={{ root: classes.rootTab }}
              />
              <Tab
                label={
                  <FormattedMessage
                    id="uploadDialog.numberOfIssues"
                    defaultMessage="{count, plural, one {{count} issue} other {{count} issues}}"
                    values={{
                      count: conflictedFiles.length
                    }}
                  />
                }
                value="2"
                classes={{ root: classes.rootTab }}
              />
            </Tabs>
            <section>
              <IconButton size="small" color="primary" onClick={() => {}}>
                <ArrowLeftRoundedIcon />
              </IconButton>
              <IconButton size="small" color="primary" onClick={() => {}}>
                <ArrowRightRoundedIcon />
              </IconButton>
              <Button size="small" onClick={openMenu} color="primary">
                <FormattedMessage id="words.options" defaultMessage="Options" />
                <ArrowDropDownIcon />
              </Button>
            </section>
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
              <MenuItem onClick={() => {}}>
                <FormattedMessage id="sitePolicyOptionAcceptAll" defaultMessage="Accept all changes" />
              </MenuItem>
              <MenuItem onClick={() => {}}>
                <FormattedMessage id="sitePolicyOptionRejectAll" defaultMessage="Reject all changes" />
              </MenuItem>
            </Menu>
          </>
        )}
      </DialogHeader>
      <DialogBody style={{ minHeight: '60vh' }}>
        <TabContext value={conflictedFiles.length ? currentTab : '1'}>
          <TabPanel value="1" classes={{ root: classes.rootTabPanel }}>
            <Dashboard
              uppy={uppy}
              plugins={['ImageEditor']}
              hideUploadButton={disableUpload}
              proudlyDisplayPoweredByUppy={false}
              width="100%"
              metaFields={[
                {
                  id: 'path',
                  name: 'path',
                  render: function({ value, onChange }, h) {
                    return h('input', {
                      type: 'input',
                      disabled: true,
                      value,
                      class: 'uppy-u-reset uppy-c-textInput uppy-Dashboard-FileCard-input'
                    });
                  }
                }
              ]}
            />
          </TabPanel>
          <TabPanel value="2" classes={{ root: classes.rootTabPanel }}>
            {conflictedFiles.map((conflictedFile) => (
              <UppyItem
                key={conflictedFile.id}
                conflictedFile={conflictedFile}
                onRemove={onRemove}
                retryFileUpload={onRetryFileUpload}
              />
            ))}
          </TabPanel>
        </TabContext>
      </DialogBody>
    </>
  );
}

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

interface UppyItemProps {
  conflictedFile: ConflictedFile;
  retryFileUpload(file: ConflictedFile): void;
  onRemove(file: ConflictedFile): void;
  active?: boolean;
}

function UppyItem(props: UppyItemProps) {
  const classes = UppyItemStyles({});
  const { conflictedFile, retryFileUpload, onRemove, active } = props;

  return (
    <Card className={clsx(classes.cardRoot, active && classes.cardActive)} data-issue-id={conflictedFile.index}>
      <CardContent className={classes.cardContentRoot}>
        <div className={classes.cardContent}>
          {conflictedFile.allowed ? (
            <div className={classes.cardContentWrapper}>
              <div className={classes.sitePolicySuggestion}>
                <WarningIcon />
                <Typography variant="body2">
                  <FormattedMessage
                    id="uploadDialog.sitePolicySuggestion"
                    defaultMessage="File name “{name}” requires changes to comply with site policies."
                    values={{ name: conflictedFile.name }}
                  />
                </Typography>
              </div>
              <div className={classes.sitePolicySuggestionFileName}>
                <Typography variant="body2" className={classes.textUnderlined}>
                  {conflictedFile.name}
                </Typography>
                <ForwardIcon fontSize="small" />
                <Typography variant="body2" className={classes.textAccepted}>
                  {conflictedFile.suggestedName}
                </Typography>
              </div>
              <Typography variant="caption" className={classes.caption}>
                {conflictedFile.type} @ {bytesToSize(conflictedFile.size)}
              </Typography>
              <div className={classes.sitePolicySuggestionActions}>
                <SecondaryButton
                  size="small"
                  onClick={() => {
                    onRemove(conflictedFile);
                  }}
                >
                  <FormattedMessage id="sitePolicy.cancelUpload" defaultMessage="Cancel Upload" />
                </SecondaryButton>
                <PrimaryButton
                  size="small"
                  onClick={() => {
                    retryFileUpload(conflictedFile);
                  }}
                >
                  <FormattedMessage id="sitePolicy.acceptChanges" defaultMessage="Accept Changes" />
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <div className={classes.cardContentWrapper}>
              <div className={classes.sitePolicySuggestion}>
                <WarningIcon />
                <Typography variant="body2">
                  <FormattedMessage
                    id="uploadDialog.sitePolicySuggestion"
                    defaultMessage="File name “{name}” doesn't comply with site policies and can’t be uploaded."
                    values={{ name: conflictedFile.name }}
                  />
                </Typography>
              </div>
              <div className={classes.cardContentFlexWrapper}>
                <div>
                  <Typography variant="body2" className={classes.textUnderlined}>
                    {conflictedFile.name}
                  </Typography>
                  <Typography variant="caption" className={classes.caption}>
                    {conflictedFile.type} @ {bytesToSize(conflictedFile.size)}
                  </Typography>
                </div>
                <IconButton
                  onClick={() => {
                    onRemove(conflictedFile);
                  }}
                  className={classes.iconRetry}
                >
                  <CloseOutlinedIcon />
                </IconButton>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
