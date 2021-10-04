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

import React, { useCallback, useEffect, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Dialog from '@mui/material/Dialog';
import { useDispatch } from 'react-redux';

import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import { closeConfirmDialog, closeUploadDialog, showConfirmDialog } from '../../state/actions/dialogs';
import { batchActions } from '../../state/actions/misc';
import { UploadDialogProps } from './util';
import { translations } from './translations';
import { UploadDialogContainer } from './UploadDialogContainer';
import MinimizedBar from '../MinimizedBar';
import { useEnhancedDialogState } from '../../utils/hooks/useEnhancedDialogState';

export const useStyles = makeStyles(() =>
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

export default function UploadDialog(props: UploadDialogProps) {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { isMinimized, onMaximize, onMinimize, hasPendingChanges, onSubmittingAndOrPendingChange } =
    useEnhancedDialogState();
  const pendingChangesRef = useRef(false);
  const { open } = props;

  const preventWrongDrop = (e: React.DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const setPendingChanges = (value: boolean) => {
    onSubmittingAndOrPendingChange({
      hasPendingChanges: value
    });
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
    <>
      <Dialog
        open={open && !isMinimized}
        keepMounted={isMinimized}
        onDrop={preventWrongDrop}
        onDragOver={preventWrongDrop}
        onClose={onClose}
        fullWidth
        maxWidth="md"
      >
        <UploadDialogContainer
          {...props}
          onClose={onClose}
          onMinimized={onMinimize}
          hasPendingChanges={hasPendingChanges}
          setPendingChanges={setPendingChanges}
        />
      </Dialog>
      <MinimizedBar
        open={isMinimized}
        onMaximize={onMaximize}
        title={<FormattedMessage id="words.upload" defaultMessage="Upload" />}
      />
    </>
  );
}
