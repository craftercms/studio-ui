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
import { useIntl } from 'react-intl';
import DialogHeader from '../DialogHeader';
import { LegacyFormDialogProps } from './utils';
import { EmbeddedLegacyContainer } from './EmbeddedLegacyContainer';
import MinimizedBar from '../MinimizedBar';
import Dialog from '@mui/material/Dialog';
import { useStyles } from './styles';
import { translations } from './translations';

export function LegacyFormDialog(props: LegacyFormDialogProps) {
  const { formatMessage } = useIntl();
  const classes = useStyles();
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
              icon: { id: '@mui/icons-material/RemoveRounded' },
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

export default LegacyFormDialog;
