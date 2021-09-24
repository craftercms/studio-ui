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
import { CreateUserDialogContainer } from './CreateUserDialogContainer';
import { CreateUserDialogProps } from './utils';
import EnhancedDialog from '../EnhancedDialog';
import { FormattedMessage } from 'react-intl';

export function CreateUserDialog(props: CreateUserDialogProps) {
  const { passwordRequirementsRegex, onSubmittingAndOrPendingChange, isSubmitting, onCreateSuccess, ...rest } = props;
  return (
    <EnhancedDialog
      title={<FormattedMessage id="CreateUserDialog.title" defaultMessage="Create User" />}
      isSubmitting={isSubmitting}
      {...rest}
    >
      <CreateUserDialogContainer
        passwordRequirementsRegex={passwordRequirementsRegex}
        onCreateSuccess={onCreateSuccess}
        onSubmittingAndOrPendingChange={onSubmittingAndOrPendingChange}
        isSubmitting={isSubmitting}
      />
    </EnhancedDialog>
  );
}

export default CreateUserDialog;
