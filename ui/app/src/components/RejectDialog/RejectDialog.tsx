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
import { RejectDialogContainer } from './RejectDialogContainer';
import { RejectDialogProps } from './utils';
import EnhancedDialog from '../EnhancedDialog/EnhancedDialog';
import { FormattedMessage } from 'react-intl';

export function RejectDialog(props: RejectDialogProps) {
  const { items, onRejectSuccess, isSubmitting, ...rest } = props;
  return (
    <EnhancedDialog
      title={<FormattedMessage id="rejectDialog.title" defaultMessage="Reject" />}
      dialogHeaderProps={{
        subtitle: (
          <FormattedMessage
            id="rejectDialog.subtitle"
            defaultMessage="The following checked item(s) will be rejected."
          />
        )
      }}
      isSubmitting={isSubmitting}
      {...rest}
    >
      <RejectDialogContainer items={items} onRejectSuccess={onRejectSuccess} isSubmitting={isSubmitting} />
    </EnhancedDialog>
  );
}

export default RejectDialog;
