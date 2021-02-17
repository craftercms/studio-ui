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

import React, { PropsWithChildren } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from './DialogHeader';
import { useMinimizeDialog, useUnmount } from '../../utils/hooks';
import DialogBody from './DialogBody';
import { minimizeDialog } from '../../state/reducers/dialogs/minimizedDialogs';
import { useDispatch } from 'react-redux';
import StandardAction from '../../models/StandardAction';
import { XHRUpload } from 'uppy';
import { Uppy } from '@uppy/core';

import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';

import { getBulkUploadUrl } from '../../services/content';
import { getGlobalHeaders } from '../../utils/ajax';
import { UppyFile } from '@uppy/utils';
import UppyDashboard from '../UppyDashboard';

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
    subtitleWrapper: {
      paddingBottom: 0,
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'space-between'
    },
    dialogBody: {
      minHeight: '60vh',
      padding: 0
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

function UploadDialogUI(props: UploadDialogUIProps) {
  const { formatMessage } = useIntl();
  const classes = useStyles({});
  const { site, path, onClose, onClosed, maxSimultaneousUploads = 1, onMinimized } = props;

  const uppy = React.useMemo(() => {
    return new Uppy({
      meta: { site },
      onBeforeFileAdded: (currentFile: UppyFile, files) => {
        const filePath = currentFile.meta.relativePath
          ? path + currentFile.meta.relativePath.substring(0, currentFile.meta.relativePath.lastIndexOf('/'))
          : path;
        return { ...currentFile, meta: { ...currentFile.meta, path: filePath } };
      }
    }).use(XHRUpload, {
      endpoint: getBulkUploadUrl(site, path),
      formData: true,
      fieldName: 'file',
      limit: maxSimultaneousUploads,
      headers: getGlobalHeaders()
    });
  }, [maxSimultaneousUploads, path, site]);

  useUnmount(() => {
    uppy.close();
    onClosed();
  });

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
      />
      <DialogBody className={classes.dialogBody}>
        <UppyDashboard
          uppy={uppy}
          site={site}
          path={path}
          options={{
            replaceTargetContent: true,
            proudlyDisplayPoweredByUppy: false,
            width: '100%'
          }}
        />
      </DialogBody>
    </>
  );
}
