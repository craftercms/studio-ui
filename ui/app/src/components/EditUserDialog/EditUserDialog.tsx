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
import { EditUserDialogProps } from './utils';
import EnhancedDialog from '../EnhancedDialog';
import EditUserDialogContainer from './EditUserDialogContainer';

export function EditUserDialog(props: EditUserDialogProps) {
  const {
    open,
    user,
    onUserEdited,
    passwordRequirementsRegex,
    passwordRequirementsMinComplexity,
    onSubmittingAndOrPendingChange,
    isSubmitting,
    ...rest
  } = props;

  return (
    <EnhancedDialog open={open} omitHeader isSubmitting={isSubmitting} {...rest}>
      <EditUserDialogContainer
        open={open}
        user={user}
        onUserEdited={onUserEdited}
        onSubmittingAndOrPendingChange={onSubmittingAndOrPendingChange}
        passwordRequirementsRegex={passwordRequirementsRegex}
        passwordRequirementsMinComplexity={passwordRequirementsMinComplexity}
        isSubmitting={isSubmitting}
      />
    </EnhancedDialog>
  );
}

export default EditUserDialog;
