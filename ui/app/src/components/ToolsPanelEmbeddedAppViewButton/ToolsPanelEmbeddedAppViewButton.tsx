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

import React from 'react';
import ToolsPanelListItemButton, { ToolsPanelListItemButtonProps } from '../ToolsPanelListItemButton';
import WidgetDialog from '../WidgetDialog';
import { usePossibleTranslation } from '../../hooks/usePossibleTranslation';
import { WidgetDescriptor } from '../Widget';
import { useEnhancedDialogState } from '../../hooks/useEnhancedDialogState';
import { useWithPendingChangesCloseRequest } from '../../hooks/useWithPendingChangesCloseRequest';

interface ToolsPanelEmbeddedAppViewButtonProps extends Omit<ToolsPanelListItemButtonProps, 'onClick'> {
  widget: WidgetDescriptor;
}

export function ToolsPanelEmbeddedAppViewButton(props: ToolsPanelEmbeddedAppViewButtonProps) {
  const {
    open,
    onOpen,
    onClose,
    hasPendingChanges,
    isSubmitting,
    isMinimized,
    onMinimize,
    onMaximize,
    onSubmittingAndOrPendingChange
  } = useEnhancedDialogState();
  const title = usePossibleTranslation(props.title);
  const widgetDialogPendingChangesCloseRequest = useWithPendingChangesCloseRequest(onClose);

  const openEmbeddedApp = () => {
    if (isMinimized) {
      onMaximize();
    }
    onOpen();
  };

  return (
    <>
      <ToolsPanelListItemButton {...props} onClick={openEmbeddedApp} />
      <WidgetDialog
        title={title}
        open={open}
        onClose={onClose}
        widget={props.widget}
        extraProps={{
          onMinimize,
          onMaximize,
          onClose
        }}
        hasPendingChanges={hasPendingChanges}
        onSubmittingAndOrPendingChange={onSubmittingAndOrPendingChange}
        onWithPendingChangesCloseRequest={widgetDialogPendingChangesCloseRequest}
        onMaximize={onMaximize}
        onMinimize={onMinimize}
        isMinimized={isMinimized}
        isSubmitting={isSubmitting}
      />
    </>
  );
}

export default ToolsPanelEmbeddedAppViewButton;
