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
import { FormattedMessage } from 'react-intl';
import { PluginConfigDialogProps } from './utils';
import { EnhancedDialog } from '../EnhancedDialog';
import { PluginConfigDialogContainer } from './PluginConfigDialogContainer';

export function PluginConfigDialog(props: PluginConfigDialogProps) {
  const { pluginId, isSubmitting, onSubmittingAndOrPendingChange, onSaved, onClose, ...rest } = props;

  return (
    <EnhancedDialog
      title={<FormattedMessage id="pluginConfigDialog.title" defaultMessage="Plugin Configuration" />}
      maxWidth="xl"
      isSubmitting={isSubmitting}
      onClose={onClose}
      {...rest}
    >
      <PluginConfigDialogContainer
        pluginId={pluginId}
        onSaved={onSaved}
        onClose={onClose}
        isSubmitting={isSubmitting}
        onSubmittingAndOrPendingChange={onSubmittingAndOrPendingChange}
      />
    </EnhancedDialog>
  );
}

export default PluginConfigDialog;
