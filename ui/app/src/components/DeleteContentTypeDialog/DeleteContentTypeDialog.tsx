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

import * as React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { DeleteContentTypeDialogProps } from './utils';
import { DeleteContentTypeDialogContainer } from './DeleteContentTypeDialogContainer';
import { EnhancedDialog } from '../EnhancedDialog';

export const messages = defineMessages({
  deleteComplete: {
    id: 'deleteContentTypeDialog.contentTypeDeletedMessage',
    defaultMessage: 'Content type deleted successfully'
  },
  deleteFailed: {
    id: 'deleteContentTypeDialog.contentTypeDeleteFailedMessage',
    defaultMessage: 'Error deleting content type'
  }
});

function DeleteContentTypeDialog(props: DeleteContentTypeDialogProps) {
  const { contentType, onSubmittingAndOrPendingChange, isSubmitting, onComplete, ...rest } = props;
  return (
    <EnhancedDialog
      title={<FormattedMessage id="deleteContentTypeDialog.headerTitle" defaultMessage="Delete Content Type" />}
      dialogHeaderProps={{
        subtitle: (
          <FormattedMessage
            id="deleteContentTypeDialog.headerSubtitle"
            defaultMessage={`Please confirm the deletion of "{name}"`}
            values={{ name: contentType.name }}
          />
        )
      }}
      isSubmitting={isSubmitting}
      {...rest}
    >
      <DeleteContentTypeDialogContainer
        contentType={contentType}
        isSubmitting={isSubmitting}
        onSubmittingAndOrPendingChange={onSubmittingAndOrPendingChange}
        onComplete={onComplete}
      />
    </EnhancedDialog>
  );
}

export default DeleteContentTypeDialog;
