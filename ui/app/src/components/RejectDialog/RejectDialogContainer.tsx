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

import React, { useEffect, useState } from 'react';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useDispatch } from 'react-redux';
import { CannedMessage, fetchCannedMessages } from '../../services/configuration';
import { RejectDialogContainerProps } from './utils';
import { RejectDialogUI } from './RejectDialogUI';
import { updateRejectDialog } from '../../state/actions/dialogs';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { reject } from '../../services/workflow';
import { useSpreadState } from '../../hooks/useSpreadState';
import { fetchStatus } from '../../services/publishing';
import useEnv from '../../hooks/useEnv';

export function RejectDialogContainer(props: RejectDialogContainerProps) {
  const typeCustomReason = 'typeCustomReason';
  const { items, onClose, onRejectSuccess, isSubmitting } = props;
  const [checkedItems, setCheckedItems] = useState([]);
  const [rejectionReason, setRejectionReason] = useState(typeCustomReason);
  const [rejectionComment, setRejectionComment] = useState('');
  const [cannedMessages, setCannedMessages] = useState<CannedMessage[]>(null);
  const [published, setPublished] = useState<boolean>(null);
  const [apiState, setApiState] = useSpreadState({
    error: false,
    errorResponse: null
  });
  const isSubmitDisabled = checkedItems.length === 0 || rejectionComment.trim() === '' || isSubmitting;
  const siteId = useActiveSiteId();
  const dispatch = useDispatch();
  const { activeEnvironment } = useEnv();

  // check all items as default
  useEffect(() => {
    const newChecked = [];

    items.forEach((item) => {
      const uri = item.path;
      newChecked.push(uri);
    });

    setCheckedItems(newChecked);
  }, [items]);

  useEffect(() => {
    if (siteId && activeEnvironment) {
      fetchCannedMessages(siteId, activeEnvironment).subscribe({
        next: (cannedMessages) => {
          setCannedMessages(cannedMessages);
        },
        error: ({ response }) => {
          setApiState({ error: true, errorResponse: response });
        }
      });
    }
  }, [siteId, setApiState, activeEnvironment]);

  useEffect(() => {
    fetchStatus(siteId).subscribe(({ published }) => {
      setPublished(published);
    });
  }, [siteId]);

  const updateChecked = (value) => {
    const itemExist = checkedItems.includes(value);
    const newChecked = [...checkedItems];

    if (itemExist) {
      newChecked.splice(newChecked.indexOf(value), 1);
    } else {
      newChecked.push(value);
    }

    setCheckedItems(newChecked);
  };

  const onReject = () => {
    dispatch(updateRejectDialog({ isSubmitting: true }));

    reject(siteId, checkedItems, rejectionComment).subscribe({
      next: () => {
        dispatch(updateRejectDialog({ hasPendingChanges: false, isSubmitting: false }));
        onRejectSuccess?.();
      },
      error: (error) => {
        dispatch(showErrorDialog({ error }));
      }
    });
  };

  const onRejectionCommentChanges = (value: string) => {
    setRejectionComment(value);
    dispatch(updateRejectDialog({ hasPendingChanges: value !== '' }));
  };

  const onRejectionReasonChange = (key: string) => {
    const message = cannedMessages.filter((message) => message.key === key)[0]?.message ?? '';
    setRejectionComment(message);
    setRejectionReason(key);
  };

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  return (
    <RejectDialogUI
      items={items}
      cannedMessages={cannedMessages}
      published={published}
      error={apiState.errorResponse}
      checkedItems={checkedItems}
      rejectionReason={rejectionReason}
      isSubmitDisabled={isSubmitDisabled}
      isSubmitting={isSubmitting}
      onRejectionReasonChange={onRejectionReasonChange}
      rejectionComment={rejectionComment}
      onCommentChange={onRejectionCommentChanges}
      onUpdateChecked={updateChecked}
      onCloseButtonClick={onCloseButtonClick}
      onReject={onReject}
    />
  );
}
