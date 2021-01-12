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

import DialogHeader from './DialogHeader';
import DialogBody from './DialogBody';
import DialogFooter from './DialogFooter';
import DialogContentText from '@material-ui/core/DialogContentText';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import { useUnmount } from '../../utils/hooks';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { SecondaryButton } from '../SecondaryButton';
import { PrimaryButton } from '../PrimaryButton';

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
  onOk: (...args) => any;
  onCancel: (...args) => any;
  onClose?: () => any;
  onClosed?: () => any;
  isPreviewNext: boolean;
}

export default function LegacyContainer(props) {
  const [open, setOpen] = useState(true);
  return (
    <PreviewCompatibilityDialogContainer
      {...props}
      open={open}
      previewUrl={props.data.location.pathname}
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
  const [remember, setRemember] = useState(false);
  useUnmount(props.onClosed);
  return (
    <>
      <DialogHeader id="previewCompatDialogTitle" title={formatMessage(translations.title)} />
      <DialogBody id="previewCompatDialogBody">
        <DialogContentText color="textPrimary">
          {formatMessage(isPreviewNext ? translations.nextCompatibility : translations.legacyCompatibility)}
        </DialogContentText>
      </DialogBody>
      <DialogFooter style={{ width: '100%', display: 'flex', placeContent: 'center space-between' }}>
        <FormControlLabel
          label={formatMessage(translations.rememberChoice)}
          control={<Checkbox color="primary" checked={remember} onChange={(e) => setRemember(e.target.checked)} />}
        />
        <div>
          <SecondaryButton onClick={() => onCancel({ remember })} style={{ marginRight: 5 }}>
            {formatMessage(translations.stay)}
          </SecondaryButton>
          <PrimaryButton onClick={() => onOk({ remember })} autoFocus>
            {formatMessage(translations.go)}
          </PrimaryButton>
        </div>
      </DialogFooter>
    </>
  );
}
