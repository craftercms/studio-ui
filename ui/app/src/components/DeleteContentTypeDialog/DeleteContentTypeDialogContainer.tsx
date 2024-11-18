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

import { DeleteContentTypeDialogContainerProps } from './utils';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import * as React from 'react';
import { useEffect } from 'react';
import { deleteContentType, fetchContentTypeUsage } from '../../services/contentTypes';
import { showSystemNotification } from '../../state/actions/system';
import DeleteContentTypeDialogBody from './DeleteContentTypeDialogBody';
import useUpdateRefs from '../../hooks/useUpdateRefs';
import useSpreadState from '../../hooks/useSpreadState';
import ApiResponseErrorState from '../ApiResponseErrorState';
import LoadingState from '../LoadingState';

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

export function DeleteContentTypeDialogContainer(props: DeleteContentTypeDialogContainerProps) {
  const { onClose, contentType, onComplete, isSubmitting, onSubmittingAndOrPendingChange } = props;
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const functionRefs = useUpdateRefs({
    onSubmittingAndOrPendingChange
  });
  const [{ data, isFetching, error }, setState] = useSpreadState({
    data: null,
    isFetching: false,
    error: null
  });

  useEffect(() => {
    setState({ isFetching: true });
    const sub = fetchContentTypeUsage(site, contentType.id).subscribe({
      next(response) {
        setState({
          data: response,
          isFetching: false,
          error: null
        });
      },
      error(e) {
        setState({
          error: e,
          isFetching: false
        });
      }
    });
    return () => {
      sub.unsubscribe();
    };
  }, [site, contentType.id, setState]);

  const onSubmit = () => {
    functionRefs.current.onSubmittingAndOrPendingChange({
      isSubmitting: true
    });
    deleteContentType(site, contentType.id).subscribe({
      next() {
        functionRefs.current.onSubmittingAndOrPendingChange({
          isSubmitting: false
        });
        dispatch(showSystemNotification({ message: formatMessage(messages.deleteComplete) }));
        onComplete?.();
      },
      error(e) {
        functionRefs.current.onSubmittingAndOrPendingChange({
          isSubmitting: false
        });
        const response = e.response?.response ?? e.response;
        dispatch(
          showSystemNotification({
            message: response?.message ?? formatMessage(messages.deleteFailed),
            options: { variant: 'error' }
          })
        );
      }
    });
  };

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  return error ? (
    <ApiResponseErrorState error={error} />
  ) : isFetching ? (
    <LoadingState styles={{ root: { width: 300, height: 250 } }} />
  ) : data ? (
    <DeleteContentTypeDialogBody
      submitting={isSubmitting}
      onCloseButtonClick={onCloseButtonClick}
      data={data}
      contentType={contentType}
      onSubmit={onSubmit}
    />
  ) : null;
}
