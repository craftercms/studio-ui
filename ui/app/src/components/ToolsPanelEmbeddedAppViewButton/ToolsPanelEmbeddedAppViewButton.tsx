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
import ToolsPanelListItemButton, { ToolsPanelListItemButtonProps } from '../ToolsPanelListItemButton';
import WidgetDialog from '../WidgetDialog';
import { usePossibleTranslation } from '../../utils/hooks/usePossibleTranslation';
import { WidgetDescriptor } from '../Widget';
import { useEnhancedDialogState } from '../../utils/hooks/useEnhancedDialogState';

interface ToolsPanelEmbeddedAppViewButtonProps extends Omit<ToolsPanelListItemButtonProps, 'onClick'> {
  widget: WidgetDescriptor;
}

export default function ToolsPanelEmbeddedAppViewButton(props: ToolsPanelEmbeddedAppViewButtonProps) {
  const [open, setOpen] = useState(false);
  const { hasPendingChanges, isSubmitting, isMinimized, onMinimize, onMaximize } = useEnhancedDialogState();
  const title = usePossibleTranslation(props.title);

  const openEmbeddedApp = () => {
    if (isMinimized) {
      onMaximize();
    }
    setOpen(true);
  };

  return (
    <>
      <ToolsPanelListItemButton {...props} onClick={openEmbeddedApp} />
      <WidgetDialog
        title={title}
        open={open}
        onClose={() => setOpen(false)}
        widget={props.widget}
        hasPendingChanges={hasPendingChanges}
        onMaximize={onMaximize}
        onMinimize={onMinimize}
        isMinimized={isMinimized}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
