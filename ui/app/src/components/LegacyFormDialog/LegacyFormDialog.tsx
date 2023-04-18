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

import React, { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import DialogHeader from '../DialogHeader';
import { LegacyFormDialogProps } from './utils';
import { EmbeddedLegacyContainer } from './EmbeddedLegacyContainer';
import MinimizedBar from '../MinimizedBar';
import Dialog from '@mui/material/Dialog';
import { useStyles } from './styles';
import { translations } from './translations';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { useDispatch } from 'react-redux';
import { updateEditConfig } from '../../state/actions/dialogs';

export function LegacyFormDialog(props: LegacyFormDialogProps) {
  const { formatMessage } = useIntl();
  const { classes } = useStyles();
  const { open, inProgress, disableOnClose, disableHeader, isMinimized, onMaximize, onMinimize, ...rest } = props;
  const dispatch = useDispatch();

  const iframeRef = useRef<HTMLIFrameElement>();

  const title = formatMessage(translations.title);

  const onClose = (e, reason?) => {
    // The form engine is too expensive to load to lose it with an unintentional
    // backdrop click. Disabling backdrop click until form engine 2.
    if ('backdropClick' !== reason && !disableOnClose) {
      if (inProgress) {
        props?.onClose();
      }
      iframeRef.current.contentWindow.postMessage({ type: 'LEGACY_FORM_DIALOG_CANCEL_REQUEST' }, '*');
    }
  };

  const onCloseButtonClick = (e) => {
    onClose(e);
  };

  useEffect(() => {
    const messagesSubscription = fromEvent(window, 'message')
      .pipe(filter((e: any) => e.data && e.data.type))
      .subscribe((e) => {
        switch (e.data.type) {
          case 'EMBEDDED_LEGACY_FORM_SAVE_START': {
            dispatch(updateEditConfig({ disableOnClose: true }));
            break;
          }
          case 'EMBEDDED_LEGACY_FORM_SAVE_END': {
            dispatch(updateEditConfig({ disableOnClose: false }));
            break;
          }
        }
      });

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [dispatch]);

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
            disabled={disableOnClose}
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
    </>
  );
}

export default LegacyFormDialog;
