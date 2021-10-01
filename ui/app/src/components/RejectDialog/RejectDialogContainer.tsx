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

import React, { useEffect, useMemo, useState } from 'react';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { getCurrentLocale } from '../../utils/i18n';
import { useDispatch } from 'react-redux';
import { reject } from '../../services/publishing';
import { emitSystemEvent, itemsRejected } from '../../state/actions/system';
import { fetchCannedMessage } from '../../services/configuration';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { useStyles } from './RejectDialog';
import { RejectDialogContainerProps, Return, Source } from './utils';
import { RejectDialogUI } from './RejectDialogUI';
import { updateRejectDialog } from '../../state/actions/dialogs';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { batchActions } from '../../state/actions/misc';

const typeCustomReason = 'typeCustomReason';
export function RejectDialogContainer(props: RejectDialogContainerProps) {
  const { items, onClose, onRejectSuccess, isSubmitting } = props;
  const [checkedItems, setCheckedItems] = useState([]);
  const [rejectionReason, setRejectionReason] = useState(typeCustomReason);
  const [rejectionComment, setRejectionComment] = useState('');
  const [rejectionCommentDirty, setRejectionCommentDirty] = useState(false);
  const isSubmitDisabled = checkedItems.length === 0 || rejectionComment.trim() === '' || isSubmitting;
  const siteId = useActiveSiteId();
  const currentLocale = getCurrentLocale();
  const dispatch = useDispatch();

  // check all items as default
  useEffect(() => {
    const newChecked = [];

    items.forEach((item) => {
      const uri = item.path;
      newChecked.push(uri);
    });

    setCheckedItems(newChecked);
  }, [items]);

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

    reject(siteId, checkedItems, rejectionComment).subscribe(
      () => {
        dispatch(
          batchActions([
            updateRejectDialog({ hasPendingChanges: false, isSubmitting: false }),
            emitSystemEvent(itemsRejected({ targets: checkedItems }))
          ])
        );
        onRejectSuccess?.();
        onClose(null, null);
      },
      (error) => {
        dispatch(showErrorDialog({ error }));
      }
    );
  };

  const onRejectionCommentChanges = (value: string) => {
    setRejectionCommentDirty(value !== '');
    setRejectionComment(value);
    dispatch(updateRejectDialog({ hasPendingChanges: value !== '' }));
  };

  const onRejectionReasonChange = (value: string) => {
    if (value && !rejectionCommentDirty && value !== typeCustomReason) {
      fetchCannedMessage(siteId, currentLocale, value).subscribe(setRejectionComment);
    } else if (value === typeCustomReason) {
      setRejectionComment('');
    }
    setRejectionReason(value);
  };

  const resource = useLogicResource<Return, Source>(items, {
    shouldResolve: (source) => Boolean(source),
    shouldReject: (source) => false,
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => source,
    errorSelector: (source) => null
  });

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  return (
    <RejectDialogUI
      resource={resource}
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
      classes={useStyles()}
    />
  );
}
