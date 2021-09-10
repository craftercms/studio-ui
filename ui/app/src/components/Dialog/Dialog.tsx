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

import * as React from 'react';
import { PropsWithChildren, useEffect } from 'react';
import { useOnClose } from '../../utils/hooks/useOnClose';
import { useDispatch } from 'react-redux';
import { maximizeDialog, minimizeDialog, popDialog, pushDialog } from '../../state/reducers/dialogs/minimizedDialogs';
import MuiDialog, { DialogProps as MuiDialogProps } from '@material-ui/core/Dialog';
import { showConfirmDialog } from '../../state/actions/dialogs';
import translations from '../CodeEditorDialog/translations';
import { useIntl } from 'react-intl';

interface DialogProps<P = {}> extends PropsWithChildren<MuiDialogProps> {
  ChildProps: P;
  title: string;
  readonly: boolean;
  minimized: boolean;
  hasPendingChanges: boolean;
  isSubmitting: boolean;
  onClose?(): void;
}

export function Dialog(props: DialogProps) {
  const { id, ChildProps, readonly, isSubmitting, hasPendingChanges, minimized, title, ...dialogProps } = props;
  const onMinimize = () => dispatch(minimizeDialog({ id }));
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const onClose = useOnClose({
    onClose(e, reason) {
      if (readonly) {
        dialogProps.onClose();
      } else if (hasPendingChanges) {
        dispatch(
          showConfirmDialog({
            title: formatMessage(translations.pendingChanges)
            // onOk: batchActions([
            //   conditionallyUnlockItem({ path: props.path }),
            //   closeConfirmDialog(),
            //   closeCodeEditorDialog()
            // ]),
            // onCancel: closeConfirmDialog()
          })
        );
      } else {
        dialogProps.onClose();
      }
    },
    disableBackdropClick: isSubmitting,
    disableEscapeKeyDown: isSubmitting
  });
  useEffect(() => {
    if (minimized) {
      dispatch(pushDialog({ id, onMaximized: maximizeDialog({ id }), minimized, title }));
      return () => {
        dispatch(popDialog({ id }));
      };
    }
  }, [dispatch, id, minimized, title]);
  return (
    <MuiDialog {...dialogProps} onClose={onClose}>
      {React.Children.map(props.children, (child) =>
        React.cloneElement(child as React.ReactElement, { ...ChildProps, onMinimize, onClose })
      )}
    </MuiDialog>
  );
}

export default Dialog;
