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
import { Item } from '../../../models/Item';
import DeleteDialogUI from './DeleteDialogUI';

const dialogInitialState: any = {
  submissionComment: '',
  selectedItems: null
};

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

  return (
    <DeleteDialogUI
      items={items}
      open={true}
      onClose={onClose}
    />
  )
}

export default DeleteDialog;
