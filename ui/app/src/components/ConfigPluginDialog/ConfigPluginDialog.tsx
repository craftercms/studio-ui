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

import { FormattedMessage } from 'react-intl';
import { ConfigPluginDialogProps } from './utils';
import { useState } from 'react';
import { EnhancedDialog } from '../EnhancedDialog';
import { ConfigPluginDialogContainer } from './ConfigPluginDialogContainer';

export function ConfigPluginDialog(props: ConfigPluginDialogProps) {
  const { pluginId, isSubmitting, onSubmittingAndOrPendingChange, onSaved, onClose, ...rest } = props;

  const [isMaximized, setIsMaximized] = useState(false);

  const onFullScreen = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <EnhancedDialog
      title={<FormattedMessage id="pluginConfigDialog.title" defaultMessage="Plugin Configuration" />}
      maxWidth="xl"
      isSubmitting={isSubmitting}
      onClose={onClose}
      fullScreen={isMaximized}
      onFullscreen={onFullScreen}
      {...rest}
    >
      <ConfigPluginDialogContainer
        pluginId={pluginId}
        onSaved={onSaved}
        onClose={onClose}
        isSubmitting={isSubmitting}
        onSubmittingAndOrPendingChange={onSubmittingAndOrPendingChange}
      />
    </EnhancedDialog>
  );
}

export default ConfigPluginDialog;
