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
import { PropsWithChildren } from 'react';
import { useOnClose } from '../../utils/hooks/useOnClose';
import { useDispatch } from 'react-redux';
import MuiDialog, { DialogProps as MuiDialogProps } from '@material-ui/core/Dialog';
import { updateCreateFolderDialog } from '../../state/actions/dialogs';
import TranslationOrText from '../../models/TranslationOrText';
import { Button } from '@material-ui/core';
import { usePossibleTranslation } from '../../utils/hooks/usePossibleTranslation';
import { useUnmount } from '../../utils/hooks/useUnmount';
import { DialogHeaderProps } from '../Dialogs/DialogHeader';
import { useWithPendingChangesCloseRequest } from '../../utils/hooks/useWithPendingChangesCloseRequest';
import MinimizedBar from '../SystemStatus/MinimizedBar';

export interface DialogProps extends PropsWithChildren<Omit<MuiDialogProps, 'title'>> {
  title?: TranslationOrText;
  minimized?: boolean;
  hasPendingChanges?: boolean;
  isSubmitting?: boolean;
  onClosed?(): void;
}

export function Dialog(props: DialogProps) {
  const { id, minimized, title, ...dialogProps } = props;
  const dispatch = useDispatch();
  const onMinimize = () => dispatch(updateCreateFolderDialog({ minimized: true }));
  const onMaximize = () => dispatch(updateCreateFolderDialog({ minimized: false }));
  const onWithPendingChangesCloseRequest = useWithPendingChangesCloseRequest(dialogProps.onClose);
  return (
    <EnhancedDialog
      {...dialogProps}
      open={props.open && !minimized}
      keepMounted={minimized}
      title={title}
      minimized={minimized}
      onMaximize={onMaximize}
      onMinimize={onMinimize}
      onWithPendingChangesCloseRequest={onWithPendingChangesCloseRequest}
    />
  );
}

export default Dialog;

interface EnhancedDialogProps extends DialogProps /* , EnhancedDialogState */ {
  onMinimize(): void;
  onMaximize(): void;
  onWithPendingChangesCloseRequest: MuiDialogProps['onClose'];
  dialogHeaderProps?: Partial<DialogHeaderProps>;
}

export function EnhancedDialog(props: EnhancedDialogProps) {
  // region const { ... } = props
  const {
    id,
    open,
    isSubmitting,
    hasPendingChanges,
    minimized,
    title,
    onClosed,
    onMinimize,
    onMaximize,
    onWithPendingChangesCloseRequest,
    ...dialogProps
  } = props;
  // endregion
  const onClose = useOnClose({
    onClose(e, reason) {
      if (hasPendingChanges) {
        onWithPendingChangesCloseRequest(e, reason);
      } else {
        dialogProps.onClose?.(e, reason);
      }
    },
    disableBackdropClick: isSubmitting,
    disableEscapeKeyDown: isSubmitting
  });
  const titleText = usePossibleTranslation(title);
  return (
    <>
      <MuiDialog
        open={open && !minimized}
        keepMounted={minimized}
        fullWidth
        maxWidth="md"
        {...dialogProps}
        onClose={onClose}
      >
        {/* <DialogHeader ... /> */}
        <Button onClick={onMinimize}>Minimize</Button>
        {React.Children.map(props.children, (child) =>
          React.cloneElement(child as React.ReactElement, { onMinimize, onClose })
        )}
        <OnClosedInvoker onClosed={onClosed} />
      </MuiDialog>
      <MinimizedBar open={minimized} onMaximize={onMaximize} title={titleText} />
    </>
  );
}

// export default EnhancedDialog;

function OnClosedInvoker({ onClosed }: { onClosed }) {
  useUnmount(onClosed);
  return null as JSX.Element;
}
