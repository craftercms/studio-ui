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
import { useMemo, useState } from 'react';
import { Dialog } from '@material-ui/core';
import { defineMessages, useIntl } from 'react-intl';
import { deleteContentType, fetchContentTypeUsage } from '../../services/contentTypes';
import ContentType from '../../models/ContentType';
import Suspencified from '../SystemStatus/Suspencified';
import DeleteContentTypeDialogBody from './DeleteContentTypeDialogBody';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../state/actions/system';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { createResource } from '../../utils/hooks/createResource';
import { useUnmount } from '../../utils/hooks/useUnmount';

export interface DeleteContentTypeDialogProps {
  open: boolean;
  contentType: ContentType;
  onClose?(): void;
  onClosed?(): void;
  /**
   * Callback triggered when submission was successful
   **/
  onComplete?();
}

const messages = defineMessages({
  deleteComplete: {
    id: 'deleteContentTypeDialog.contentTypeDeletedMessage',
    defaultMessage: 'Content type deleted successfully'
  },
  deleteFailed: {
    id: 'deleteContentTypeDialog.contentTypeDeleteFailedMessage',
    defaultMessage: 'Error deleting content type'
  }
});

export function DeleteContentTypeDialogContainer(props: DeleteContentTypeDialogProps) {
  const { onClose, onClosed, contentType, onComplete } = props;
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const resource = useMemo(() => createResource(() => fetchContentTypeUsage(site, contentType.id).toPromise()), [
    site,
    contentType.id
  ]);
  const onSubmit = () => {
    setSubmitting(true);
    deleteContentType(site, contentType.id).subscribe(
      () => {
        setSubmitting(false);
        dispatch(showSystemNotification({ message: formatMessage(messages.deleteComplete) }));
        onComplete?.();
      },
      (e) => {
        setSubmitting(false);
        const response = e.response?.response ?? e.response;
        dispatch(
          showSystemNotification({
            message: response?.message ?? formatMessage(messages.deleteFailed),
            options: { variant: 'error' }
          })
        );
      }
    );
  };
  useUnmount(onClosed);
  return (
    <Suspencified loadingStateProps={{ styles: { root: { width: 300, height: 250 } } }}>
      <DeleteContentTypeDialogBody
        submitting={submitting}
        onClose={onClose}
        resource={resource}
        contentType={contentType}
        onSubmit={onSubmit}
      />
    </Suspencified>
  );
}

function DeleteContentTypeDialog(props: DeleteContentTypeDialogProps) {
  const { open, onClose } = props;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DeleteContentTypeDialogContainer {...props} />
    </Dialog>
  );
}

export default DeleteContentTypeDialog;
