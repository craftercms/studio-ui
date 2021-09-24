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
import EnhancedDialog from '../EnhancedDialog';
import { PublishDialogContainer } from './PublishDialogContainer';
import { PublishDialogProps } from './utils';
import { FormattedMessage } from 'react-intl';

export function PublishDialog(props: PublishDialogProps) {
  const { items, scheduling, onSuccess, isSubmitting, ...rest } = props;
  return (
    <EnhancedDialog
      title={<FormattedMessage id="publishDialog.title" defaultMessage="Publish" />}
      dialogHeaderProps={{
        subtitle: (
          <FormattedMessage
            id="publishDialog.subtitle"
            defaultMessage="Hard dependencies are automatically submitted with the main items. You may choose whether to submit or not soft dependencies"
          />
        )
      }}
      {...rest}
      isSubmitting={isSubmitting}
    >
      <PublishDialogContainer items={items} scheduling={scheduling} onSuccess={onSuccess} isSubmitting={isSubmitting} />
    </EnhancedDialog>
  );
}

export default PublishDialog;
