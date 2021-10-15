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

import { WidgetDescriptor } from '../Widget';
import { usePossibleTranslation } from '../../utils/hooks/usePossibleTranslation';
import WidgetDialog from '../WidgetDialog';
import React from 'react';
import TranslationOrText from '../../models/TranslationOrText';
import SystemIcon, { SystemIconDescriptor } from '../SystemIcon';
import { useEnhancedDialogState } from '../../utils/hooks/useEnhancedDialogState';
import { IconButton, Tooltip } from '@mui/material';
import { useWithPendingChangesCloseRequest } from '../../utils/hooks/useWithPendingChangesCloseRequest';

interface WidgetDialogIconButtonProps {
  title: TranslationOrText;
  icon: SystemIconDescriptor;
  widget: WidgetDescriptor;
}

export function WidgetDialogIconButton(props: WidgetDialogIconButtonProps) {
  const title = usePossibleTranslation(props.title);
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
  const widgetDialogPendingChangesCloseRequest = useWithPendingChangesCloseRequest(onClose);

  const openEmbeddedApp = () => {
    if (isMinimized) {
      onMaximize();
    }
    onOpen();
  };

  return (
    <>
      <Tooltip title={title}>
        <IconButton onClick={openEmbeddedApp}>
          <SystemIcon icon={props.icon} fontIconProps={{ fontSize: 'small' }} />
        </IconButton>
      </Tooltip>
      <WidgetDialog
        title={title}
        open={open}
        onClose={() => onClose()}
        widget={props.widget}
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

export default WidgetDialogIconButton;
