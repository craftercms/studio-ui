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

import React from 'react';
import PushDialogContainer from './PushDialogContainer';
import { PushDialogProps } from './utils';
import { EnhancedDialog } from '../../EnhancedDialog';
import { FormattedMessage } from 'react-intl';

export function PushDialog(props: PushDialogProps) {
  const { branches, remoteName, onPushSuccess, onPushError, onSubmittingChange, ...rest } = props;
  return (
    <EnhancedDialog title={<FormattedMessage id="words.push" defaultMessage="Push" />} maxWidth="xs" {...rest}>
      <PushDialogContainer
        branches={branches}
        remoteName={remoteName}
        onPushSuccess={onPushSuccess}
        onPushError={onPushError}
        isSubmitting={rest.isSubmitting}
        onSubmittingChange={onSubmittingChange}
      />
    </EnhancedDialog>
  );
}

export default PushDialog;
