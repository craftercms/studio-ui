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
import { defineMessages, useIntl } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
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
import UppyDashboard from '../UppyDashboard';
import { Button, IconButton } from '@material-ui/core';
import CloseIconRounded from '@material-ui/icons/CloseRounded';
import { closeConfirmDialog, closeUploadDialog, showConfirmDialog } from '../../state/actions/dialogs';
import { batchActions } from '../../state/actions/misc';

const translations = defineMessages({
  title: {
    id: 'uploadDialog.title',
    defaultMessage: 'Upload'
  },
  uploadInProgress: {
    id: 'uploadDialog.uploadInProgress',
    defaultMessage:
      'Uploads are still in progress. Leaving this page would stop the pending uploads. Are you sure you wish to leave?'
  },
  uploadInProgressConfirmation: {
    id: 'uploadDialog.uploadInProgressConfirmation',
    defaultMessage:
      'Uploads are still in progress. Closing this modal would stop the pending uploads. Are you sure you wish to close it?'
  },
  noDuplicates: {
    id: 'uppyCore.noDuplicates',
    defaultMessage: "Cannot add the duplicate file “%'{fileName}'”, it already exists"
  }
});

const useStyles = makeStyles((theme) =>
  createStyles({
    rootTitle: {
      paddingBottom: 0,
      display: 'none'
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
  const [hasPendingChanges, setPendingChanges] = useState<boolean>(false);
  const pendingChangesRef = useRef(false);
  // NOTE: this id needs to changed if we added support to many dialogs at the same time;
  const id = 'uploadDialog';
  const { open, path } = props;

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

  useEffect(() => {
    pendingChangesRef.current = hasPendingChanges;
  }, [hasPendingChanges]);

  const onClose = useCallback(() => {
    if (pendingChangesRef.current) {
      dispatch(
        showConfirmDialog({
          body: formatMessage(translations.uploadInProgressConfirmation),
          onOk: batchActions([closeConfirmDialog(), closeUploadDialog()]),
          onCancel: closeConfirmDialog()
        })
      );
    } else {
      props.onClose();
    }
  }, [dispatch, formatMessage, props]);

  return (
    <Dialog
      open={open && !minimized}
      keepMounted={minimized}
      onDrop={preventWrongDrop}
      onDragOver={preventWrongDrop}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <UploadDialogUI
        {...props}
        onClose={onClose}
        onMinimized={onMinimized}
        hasPendingChanges={hasPendingChanges}
        setPendingChanges={setPendingChanges}
      />
    </Dialog>
  );
}

interface UploadDialogUIProps extends UploadDialogProps {
  hasPendingChanges: boolean;
  setPendingChanges?(pending: boolean): void;
  onMinimized?(): void;
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
    hasPendingChanges,
    setPendingChanges
  } = props;

  const uppy = React.useMemo(() => {
    return new Uppy({
      meta: { site },
      locale: {
        strings: {
          noDuplicates: formatMessage(translations.noDuplicates)
        }
      }
    }).use(XHRUpload, {
      endpoint: getBulkUploadUrl(site, path),
      formData: true,
      fieldName: 'file',
      limit: maxSimultaneousUploads,
      headers: getGlobalHeaders()
    });
  }, [formatMessage, maxSimultaneousUploads, path, site]);

  useUnmount(() => {
    uppy.close();
    onClosed();
  });

  useEffect(() => {
    const handleBeforeUpload = () => {
      return formatMessage(translations.uploadInProgress);
    };

    if (hasPendingChanges) {
      window.onbeforeunload = handleBeforeUpload;
    } else {
      window.onbeforeunload = null;
    }

    return () => {
      window.onbeforeunload = null;
    };
  }, [hasPendingChanges, formatMessage]);

  return (
    <>
      <Button style={{ display: 'none' }}>test</Button>
      <IconButton style={{ display: 'none' }}>
        <CloseIconRounded />
      </IconButton>
      <DialogBody className={classes.dialogBody}>
        <UppyDashboard
          uppy={uppy}
          site={site}
          path={path}
          onMinimized={onMinimized}
          onPendingChanges={setPendingChanges}
          onClose={onClose}
          title={formatMessage(translations.title)}
        />
      </DialogBody>
    </>
  );
}
