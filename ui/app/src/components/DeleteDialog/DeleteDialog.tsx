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
import { DeleteDialogContainer } from './DeleteDialogContainer';
import { DeleteDialogProps } from './utils';
import EnhancedDialog from '../EnhancedDialog';
import { FormattedMessage } from 'react-intl';

export default function DeleteDialog(props: DeleteDialogProps) {
  const { items, isSubmitting, onSuccess, isFetching, childItems, dependentItems, ...rest } = props;
  return (
    <EnhancedDialog
      title={<FormattedMessage id="deleteDialog.title" defaultMessage="Delete" />}
      dialogHeaderProps={{
        subtitle: (
          <FormattedMessage
            id="deleteDialog.subtitle"
            defaultMessage="Selected items will be deleted along with their child items. Please review dependent items before deleting as these will end-up with broken link references."
          />
        )
      }}
      isSubmitting={isSubmitting}
      {...rest}
    >
      <DeleteDialogContainer
        items={items}
        onSuccess={onSuccess}
        isFetching={isFetching}
        childItems={childItems}
        dependentItems={dependentItems}
        isSubmitting={isSubmitting}
      />
    </EnhancedDialog>
  );
}
