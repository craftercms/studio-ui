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

import * as React from 'react';
import { ReactNode, useMemo } from 'react';
import { useOnClose } from '../../hooks/useOnClose';
import MuiDialog, { DialogProps as MuiDialogProps } from '@mui/material/Dialog';
import { useUnmount } from '../../hooks/useUnmount';
import DialogHeader, { DialogHeaderProps } from '../DialogHeader';
import MinimizedBar from '../MinimizedBar';
import { EnhancedDialogState } from '../../hooks/useEnhancedDialogState';
import { EnhancedDialogContext } from './useEnhancedDialogContext';
import Suspencified from '../Suspencified';

export interface EnhancedDialogProps extends Omit<MuiDialogProps, 'title'>, EnhancedDialogState {
  title?: ReactNode;
  subtitle?: ReactNode;
  onMinimize?(): void;
  onMaximize?(): void;
  onClosed?(): void;
  onFullScreen?(): void;
  onCancelFullScreen?(): void;
  onWithPendingChangesCloseRequest?: MuiDialogProps['onClose'];
  omitHeader?: boolean;
  dialogHeaderProps?: Partial<DialogHeaderProps>;
}

export function EnhancedDialog(props: EnhancedDialogProps) {
  // region const { ... } = props
  const {
    open,
    isSubmitting = false,
    hasPendingChanges = false,
    isMinimized = false,
    isFullScreen = false,
    title,
    subtitle,
    onClosed,
    onMinimize,
    onMaximize,
    onWithPendingChangesCloseRequest,
    children,
    dialogHeaderProps,
    omitHeader = false,
    onFullScreen,
    onCancelFullScreen,
    ...dialogProps
  } = props;
  // endregion
  const onClose = useOnClose({
    onClose(e, reason) {
      if (hasPendingChanges) {
        onWithPendingChangesCloseRequest?.(e, reason);
      } else if (!isSubmitting) {
        dialogProps.onClose?.(e, reason);
      }
    },
    disableBackdropClick: isSubmitting,
    disableEscapeKeyDown: isSubmitting
  });
  const context = useMemo<EnhancedDialogState>(
    () => ({
      open,
      isMinimized,
      isFullScreen,
      isSubmitting,
      hasPendingChanges
    }),
    [hasPendingChanges, isFullScreen, isMinimized, isSubmitting, open]
  );
  return (
    <EnhancedDialogContext.Provider value={context}>
      <MuiDialog
        open={open && !isMinimized}
        keepMounted={isMinimized}
        fullWidth
        maxWidth="md"
        fullScreen={isFullScreen}
        {...dialogProps}
        onClose={onClose}
      >
        {!omitHeader && (
          <DialogHeader
            {...dialogHeaderProps}
            title={title ?? dialogHeaderProps?.title}
            subtitle={subtitle ?? dialogHeaderProps?.subtitle}
            disabled={isSubmitting}
            onMinimizeButtonClick={onMinimize}
            onFullScreenButtonClick={isFullScreen ? onCancelFullScreen : onFullScreen}
            onCloseButtonClick={(e) => onClose(e, null)}
          />
        )}
        <Suspencified>
          {React.Children.map(children, (child) => React.cloneElement(child as React.ReactElement, { onClose }))}
        </Suspencified>
        <OnClosedInvoker onClosed={onClosed} />
      </MuiDialog>
      <MinimizedBar open={isMinimized} onMaximize={onMaximize} title={title} />
    </EnhancedDialogContext.Provider>
  );
}

export default EnhancedDialog;

function OnClosedInvoker({ onClosed }: { onClosed }) {
  useUnmount(onClosed);
  return null as JSX.Element;
}
