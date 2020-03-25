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

import React, { useState } from 'react';
import { Item } from '../../../models/Item';
import DeleteDialogUI from './DeleteDialogUI';
import { deleteItems } from '../../../services/content';
import { useActiveSiteId, useActiveUser, useSpreadState } from '../../../utils/hooks';

interface DeleteDialogProps {
  items: Item[];

  onClose?(response?: any): any;

  onSuccess?(response?: any): any;
}

function DeleteDialog(props: DeleteDialogProps) {
  const {
    items,
    onClose,
    onSuccess
  } = props;
  const [open, setOpen] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [submissionComment, setSubmissionComment] = useState('');
  const [apiState, setApiState] = useSpreadState({
    error: false,
    submitting: false,
    global: false,
    errorResponse: null
  });
  const user = useActiveUser();
  const siteId = useActiveSiteId();

  const handleClose = () => {
    setOpen(false);

    // call externalClose fn
    onClose?.();
  };

  const handleSubmit = () => {
    const data = {
      items: selectedItems
    };

    setApiState({ submitting: true });

    deleteItems(siteId, user.username, submissionComment, data).subscribe(
      (response) => {
        setOpen(false);
        setApiState({ error: false, submitting: false });
        onSuccess?.(response);
        onClose?.(response);
      },
      (response) => {
        if (response) {
          setApiState({ error: true, errorResponse: (response.response) ? response.response : response });
        }
      }
    );

  };

  function handleErrorBack() {
    setApiState({ error: false, global: false });
  }

  return (
    <DeleteDialogUI
      items={items}
      setSelectedItems={setSelectedItems}
      submissionComment={submissionComment}
      setSubmissionComment={setSubmissionComment}
      open={open}
      apiState={apiState}
      handleClose={handleClose}
      handleSubmit={handleSubmit}
      handleErrorBack={handleErrorBack}
      siteId={siteId}
      onClose={onClose}
    />
  )
}

export default DeleteDialog;
