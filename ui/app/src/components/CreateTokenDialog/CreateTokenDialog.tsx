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

import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { createToken } from '../../services/tokens';
import { Token } from '../../models/Token';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { useDispatch } from 'react-redux';
import CreateTokenDialogUI from './CreateTokenDialogUI';
import { useOnClose } from '../../utils/hooks/useOnClose';

interface CreateTokenDialogProps {
  open: boolean;
  onCreated?(response: Token): void;
  onClose?(): void;
  onClosed?(): void;
}

export default function CreateTokenDialog(props: CreateTokenDialogProps) {
  const { open, onClose, onCreated, onClosed } = props;
  const [inProgress, setInProgress] = useState(false);
  const dispatch = useDispatch();
  const onOk = ({ label, expiresAt }) => {
    setInProgress(true);
    createToken(label, expiresAt).subscribe(
      (token) => {
        setInProgress(false);
        onCreated?.(token);
      },
      (response) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };
  const [disableQuickDismiss, setDisableQuickDismiss] = useState(false);
  const onCloseHandler = useOnClose({
    onClose,
    disableEscapeKeyDown: disableQuickDismiss,
    disableBackdropClick: disableQuickDismiss
  });

  return (
    <Dialog open={open} fullWidth maxWidth="xs" onClose={onCloseHandler}>
      <CreateTokenDialogUI
        onOk={onOk}
        disabled={inProgress}
        onDismiss={onClose}
        onClosed={onClosed}
        setDisableQuickDismiss={setDisableQuickDismiss}
      />
    </Dialog>
  );
}
