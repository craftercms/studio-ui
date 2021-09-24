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
import CreateTokenDialogContainer from './CreateTokenDialogContainer';
import { CreateTokenDialogProps } from './utils';
import EnhancedDialog from '../EnhancedDialog';
import { FormattedMessage } from 'react-intl';

export default function CreateTokenDialog(props: CreateTokenDialogProps) {
  const { onCreated, isSubmitting, onSubmittingAndOrPendingChange, ...rest } = props;

  return (
    <EnhancedDialog
      title={<FormattedMessage id="createTokenDialog.title" defaultMessage="Create Access Token" />}
      maxWidth="xs"
      isSubmitting={isSubmitting}
      {...rest}
    >
      <CreateTokenDialogContainer
        onCreated={onCreated}
        isSubmitting={isSubmitting}
        onSubmittingAndOrPendingChange={onSubmittingAndOrPendingChange}
      />
    </EnhancedDialog>
  );
}
