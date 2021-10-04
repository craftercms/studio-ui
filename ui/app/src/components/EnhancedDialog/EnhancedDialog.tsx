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
import { ReactNode } from 'react';
import { useOnClose } from '../../utils/hooks/useOnClose';
import MuiDialog, { DialogProps as MuiDialogProps } from '@mui/material/Dialog';
import { useUnmount } from '../../utils/hooks/useUnmount';
import DialogHeader, { DialogHeaderProps } from '../DialogHeader';
import MinimizedBar from '../MinimizedBar';
import { EnhancedDialogState } from '../../utils/hooks/useEnhancedDialogState';

export interface EnhancedDialogProps extends Omit<MuiDialogProps, 'title'>, EnhancedDialogState {
  title?: ReactNode;
  onMinimize?(): void;
  onMaximize?(): void;
  onClosed?(): void;
  onWithPendingChangesCloseRequest?: MuiDialogProps['onClose'];
  omitHeader?: boolean;
  dialogHeaderProps?: Partial<DialogHeaderProps>;
}

export function EnhancedDialog(props: EnhancedDialogProps) {
  // region const { ... } = props
  const {
    id,
    open,
    isSubmitting,
    hasPendingChanges,
    isMinimized,
    title,
    onClosed,
    onMinimize,
    onMaximize,
    onWithPendingChangesCloseRequest,
    children,
    dialogHeaderProps,
    omitHeader = false,
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

  return (
    <>
      <MuiDialog
        open={open && !isMinimized}
        keepMounted={isMinimized}
        fullWidth
        maxWidth="md"
        {...dialogProps}
        onClose={onClose}
      >
        {!omitHeader && (
          <DialogHeader
            {...dialogHeaderProps}
            onMinimizeButtonClick={onMinimize}
            title={title}
            onCloseButtonClick={(e) => onClose(e, null)}
            disableDismiss={isSubmitting}
          />
        )}
        {React.Children.map(children, (child) => React.cloneElement(child as React.ReactElement, { onClose }))}
        <OnClosedInvoker onClosed={onClosed} />
      </MuiDialog>
      <MinimizedBar open={isMinimized} onMaximize={onMaximize} title={title} />
    </>
  );
}

export default EnhancedDialog;

function OnClosedInvoker({ onClosed }: { onClosed }) {
  useUnmount(onClosed);
  return null as JSX.Element;
}
