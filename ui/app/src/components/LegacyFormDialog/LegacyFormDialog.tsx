/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import DialogHeader from '../DialogHeader';
import { LegacyFormDialogProps } from './utils';
import { EmbeddedLegacyContainer } from './EmbeddedLegacyContainer';
import MinimizedBar from '../MinimizedBar';
import Dialog from '@mui/material/Dialog';
import { useStyles } from './styles';
import { translations } from './translations';
import useEnhancedDialogState from '../../hooks/useEnhancedDialogState';
import { RenameContentDialog } from '../RenameContentDialog';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

const renameContentDialogDataInitialState = {
  id: '',
  path: '',
  value: ''
};

export function LegacyFormDialog(props: LegacyFormDialogProps) {
  const { formatMessage } = useIntl();
  const { classes } = useStyles();
  const { open, inProgress, isSubmitting, disableHeader, isMinimized, onMaximize, onMinimize, ...rest } = props;
  const renameContentDialogState = useEnhancedDialogState();
  const [renameContentDialogData, setRenameContentDialogData] = useState(renameContentDialogDataInitialState);

  const iframeRef = useRef<HTMLIFrameElement>();
  const messages = fromEvent(window, 'message').pipe(filter((e: any) => e.data && e.data.type));

  const title = formatMessage(translations.title);

  const onClose = (e, reason?) => {
    // The form engine is too expensive to load to lose it with an unintentional
    // backdrop click. Disabling backdrop click until form engine 2.
    if ('backdropClick' !== reason && !isSubmitting) {
      if (inProgress) {
        props?.onClose();
      }
      iframeRef.current.contentWindow.postMessage({ type: 'LEGACY_FORM_DIALOG_CANCEL_REQUEST' }, '*');
    }
  };

  const onCloseButtonClick = (e) => {
    onClose(e);
  };

  const onContentRenamed = (newName) => {
    renameContentDialogState.onClose();
    iframeRef.current.contentWindow.postMessage(
      { type: 'LEGACY_FORM_DIALOG_RENAMED_CONTENT', newName, id: renameContentDialogData.id },
      '*'
    );
  };

  useEffect(() => {
    const messagesSubscription = messages.subscribe((e: any) => {
      switch (e.data.type) {
        case 'LEGACY_FORM_DIALOG_RENAME_CONTENT':
          const { path, fileName, id } = e.data;
          setRenameContentDialogData({
            id,
            path,
            value: fileName
          });
          renameContentDialogState.onOpen();
          break;
      }
    });

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [messages, renameContentDialogState]);

  return (
    <>
      <Dialog
        open={open && !isMinimized}
        keepMounted={isMinimized}
        fullWidth
        maxWidth="xl"
        classes={{ paper: classes.dialog }}
        onClose={onClose}
      >
        {!disableHeader && (
          <DialogHeader
            title={title}
            disabled={isSubmitting}
            onCloseButtonClick={onCloseButtonClick}
            rightActions={[
              {
                icon: { id: '@mui/icons-material/RemoveRounded' },
                onClick: onMinimize
              }
            ]}
          />
        )}
        <EmbeddedLegacyContainer ref={iframeRef} inProgress={inProgress} onMinimize={onMinimize} {...rest} />
      </Dialog>
      <MinimizedBar open={isMinimized} onMaximize={onMaximize} title={title} />
      <RenameContentDialog
        open={renameContentDialogState.open}
        hasPendingChanges={renameContentDialogState.hasPendingChanges}
        onSubmittingAndOrPendingChange={renameContentDialogState.onSubmittingAndOrPendingChange}
        onClose={() => {
          renameContentDialogState.onClose();
          setRenameContentDialogData(renameContentDialogDataInitialState);
        }}
        onRenamed={onContentRenamed}
        path={renameContentDialogData.path}
        value={renameContentDialogData.value}
      />
    </>
  );
}

export default LegacyFormDialog;
