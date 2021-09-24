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

import React, { useRef } from 'react';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { defineMessages, useIntl } from 'react-intl';
import DialogHeader from '../DialogHeader';
import { LegacyFormDialogProps } from './utils';
import { EmbeddedLegacyContainer } from './EmbeddedLegacyContainer';
import MinimizedBar from '../MinimizedBar';
import Dialog from '@mui/material/Dialog';

export const translations = defineMessages({
  title: {
    id: 'legacyFormDialog.title',
    defaultMessage: 'Content Form'
  },
  loadingForm: {
    id: 'legacyFormDialog.loadingForm',
    defaultMessage: 'Loading...'
  },
  error: {
    id: 'legacyFormDialog.errorLoadingForm',
    defaultMessage: 'An error occurred trying to load the form'
  }
});

export const styles = makeStyles(() =>
  createStyles({
    iframe: {
      height: '0',
      border: 0,
      '&.complete': {
        height: '100%',
        flexGrow: 1
      }
    },
    dialog: {
      minHeight: '90vh'
    },
    loadingRoot: {
      flexGrow: 1,
      justifyContent: 'center'
    },
    edited: {
      width: '12px',
      height: '12px',
      marginLeft: '5px'
    }
  })
);

export default function LegacyFormDialog(props: LegacyFormDialogProps) {
  const { formatMessage } = useIntl();
  const classes = styles();
  const { open, inProgress, isMinimized, onMaximize, onMinimize, ...rest } = props;

  const iframeRef = useRef<HTMLIFrameElement>();

  const title = formatMessage(translations.title);

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (inProgress) {
      props?.onClose();
    }
    iframeRef.current.contentWindow.postMessage({ type: 'LEGACY_FORM_DIALOG_CANCEL_REQUEST' }, '*');
  };

  return (
    <>
      <Dialog
        open={open && !isMinimized}
        keepMounted={isMinimized}
        fullWidth
        maxWidth="xl"
        classes={{ paper: classes.dialog }}
        onClose={onCloseButtonClick}
      >
        <DialogHeader
          title={title}
          onCloseButtonClick={onCloseButtonClick}
          rightActions={[
            {
              icon: 'MinimizeIcon',
              onClick: onMinimize
            }
          ]}
        />
        <EmbeddedLegacyContainer ref={iframeRef} inProgress={inProgress} onMinimize={onMinimize} {...rest} />
      </Dialog>
      <MinimizedBar open={isMinimized} onMaximize={onMaximize} title={title} />
    </>
  );
}
