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

import DialogHeader from '../DialogHeader/DialogHeader';
import DialogBody from '../DialogBody/DialogBody';
import DialogFooter from '../DialogFooter/DialogFooter';
import DialogContentText from '@mui/material/DialogContentText';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { useUnmount } from '../../hooks/useUnmount';

const translations = defineMessages({
  go: {
    id: 'words.go',
    defaultMessage: 'Go'
  },
  stay: {
    id: 'words.stay',
    defaultMessage: 'Stay'
  },
  title: {
    id: 'previewCompatDialog.title',
    defaultMessage: 'Preview Compatibility Notice'
  },
  nextCompatibility: {
    id: 'previewCompatDialog.nextCompatMessage',
    defaultMessage: 'This page is compatible with the new editing experience. Would you like to go there now?'
  },
  legacyCompatibility: {
    id: 'previewCompatDialog.legacyCompatMessage',
    defaultMessage: 'This page is compatible with the previous editing experience. Would you like to go there now?'
  },
  rememberChoice: {
    id: 'previewCompatDialog.rememberChoice',
    defaultMessage: 'Remember choice'
  }
});

interface PreviewCompatibilityDialogProps {
  open: boolean;
  onOk: () => any;
  onCancel: () => any;
  onClose?: () => any;
  onClosed?: () => any;
  isPreviewNext: boolean;
}

export function LegacyContainer(props) {
  const [open, setOpen] = useState(true);
  return (
    <PreviewCompatibilityDialogContainer
      {...props}
      open={open}
      onCancel={(options) => {
        setOpen(false);
        props.onCancel(options);
      }}
    />
  );
}

export function PreviewCompatibilityDialogContainer(props: PreviewCompatibilityDialogProps) {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="previewCompatDialogTitle"
      aria-describedby="previewCompatDialogBody"
    >
      <PreviewCompatibilityDialog {...props} />
    </Dialog>
  );
}

export function PreviewCompatibilityDialog(props: PreviewCompatibilityDialogProps) {
  const { onOk, onCancel, isPreviewNext } = props;
  const { formatMessage } = useIntl();
  useUnmount(props.onClosed);
  return (
    <>
      <DialogHeader id="previewCompatDialogTitle" title={formatMessage(translations.title)} />
      <DialogBody id="previewCompatDialogBody">
        <DialogContentText color="textPrimary">
          {formatMessage(isPreviewNext ? translations.nextCompatibility : translations.legacyCompatibility)}
        </DialogContentText>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onCancel} style={{ marginRight: 5 }}>
          {formatMessage(translations.stay)}
        </SecondaryButton>
        <PrimaryButton onClick={onOk} autoFocus>
          {formatMessage(translations.go)}
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}

export default LegacyContainer;

