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

import React from 'react';
import StandardAction from '../../models/StandardAction';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { useMinimizeDialog } from '../../utils/hooks';
import { minimizeDialog } from '../../state/reducers/dialogs/minimizedDialogs';
import { closeCodeEditorDialog, closeConfirmDialog, showConfirmDialog } from '../../state/actions/dialogs';
import { batchActions } from '../../state/actions/misc';
import { conditionallyUnlockItem } from '../../state/actions/content';
import translations from './translations';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import { CodeEditorDialogContainer } from './CodeEditorDialogContainer';

interface CodeEditorDialogBaseProps {
  open: boolean;
  path: string;
  mode: string;
  pendingChanges: boolean;
  contentType?: string;
  readonly?: boolean;
}

export type CodeEditorDialogProps = DialogProps &
  CodeEditorDialogBaseProps & {
    onSuccess?(response?: any): void;
    onClose?(): void;
    onClosed?(): void;
  };

export interface CodeEditorDialogStateProps extends CodeEditorDialogBaseProps {
  onSuccess?: StandardAction;
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onDismiss?: StandardAction;
}

export default function CodeEditorDialog(props: CodeEditorDialogProps) {
  const id = 'code-editor';
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { open, mode, pendingChanges, path, readonly, contentType, onClosed, onSuccess, ...rest } = props;

  const title = formatMessage(translations.title);

  const minimized = useMinimizeDialog({
    id,
    title,
    minimized: false
  });

  const onMinimized = () => {
    dispatch(minimizeDialog({ id }));
  };

  const onClose = () => {
    if (readonly) {
      props.onClose();
      return;
    }
    if (pendingChanges) {
      dispatch(
        showConfirmDialog({
          title: formatMessage(translations.pendingChanges),
          onOk: batchActions([
            conditionallyUnlockItem({ path: props.path, notify: false }),
            closeConfirmDialog(),
            closeCodeEditorDialog()
          ]),
          onCancel: closeConfirmDialog()
        })
      );
    } else {
      dispatch(conditionallyUnlockItem({ path: props.path, notify: false }));
      props.onClose();
    }
  };

  return (
    <Dialog open={open && !minimized} keepMounted={minimized} onClose={onClose} fullWidth maxWidth="xl" {...rest}>
      <CodeEditorDialogContainer {...props} onClose={onClose} title={title} onMinimized={onMinimized} />
    </Dialog>
  );
}
