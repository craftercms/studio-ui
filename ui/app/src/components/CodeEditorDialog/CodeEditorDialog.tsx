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

import React, { PropsWithChildren } from 'react';
import StandardAction from '../../models/StandardAction';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { useActiveSiteId, useActiveUser, useDetailedItem, useMinimizeDialog } from '../../utils/hooks';
import { minimizeDialog } from '../../state/reducers/dialogs/minimizedDialogs';
import { closeCodeEditorDialog, closeConfirmDialog, showConfirmDialog } from '../../state/actions/dialogs';
import { batchActions } from '../../state/actions/misc';
import { unlockItem } from '../../state/actions/content';
import translations from './translations';
import Dialog from '@material-ui/core/Dialog';
import { CodeEditorDialogContainer } from './CodeEditorDialogContainer';

interface CodeEditorDialogBaseProps {
  open?: boolean;
  path: string;
  mode: string;
  pendingChanges: boolean;
  contentType?: string;
  readonly?: boolean;
}

export type CodeEditorDialogProps = PropsWithChildren<
  CodeEditorDialogBaseProps & {
    onSuccess?(response?: any): void;
    onClose?(): void;
    onClosed?(): void;
  }
>;

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
  const { open, pendingChanges, path } = props;
  const item = useDetailedItem(path);
  const site = useActiveSiteId();
  const user = useActiveUser();

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
    if (pendingChanges) {
      dispatch(
        showConfirmDialog({
          title: formatMessage(translations.pendingChanges),
          onOk: batchActions(
            !item.lockOwner || item.lockOwner === user.username
              ? [closeConfirmDialog(), closeCodeEditorDialog(), unlockItem({ path: props.path, notify: false })]
              : [closeConfirmDialog(), closeCodeEditorDialog()]
          ),
          onCancel: closeConfirmDialog()
        })
      );
    } else {
      if (!item.lockOwner || item.lockOwner === user.username) {
        dispatch(unlockItem({ path: props.path, notify: false }));
      }
      props.onClose();
    }
  };

  return (
    <Dialog open={open && !minimized} keepMounted={minimized} onClose={onClose} fullWidth maxWidth="xl">
      <CodeEditorDialogContainer
        {...props}
        item={item}
        site={site}
        user={user}
        onClose={onClose}
        title={title}
        onMinimized={onMinimized}
      />
    </Dialog>
  );
}
