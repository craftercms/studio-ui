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

import React, { useEffect, useState, PropsWithChildren } from 'react';
import { Item } from '../../../models/Item';
import DeleteDialogUI from './DeleteDialogUI';
import { deleteItems } from '../../../services/content';
import { useActiveSiteId, useActiveUser, useSpreadState, useStateResource } from '../../../utils/hooks';
import { fetchDeleteDependencies } from '../../../services/dependencies';
import { DeleteDependencies } from '../Dependencies/DependencySelection';
import StandardAction from '../../../models/StandardAction';

interface DeleteDialogBaseProps {
  open: boolean;
  items?: Item[];
}

export type DeleteDialogProps = PropsWithChildren<
  DeleteDialogBaseProps & {
    onClose(): any;
    onSuccess?(response?: any): any;
  }
>;

export interface DeleteDialogStateProps extends DeleteDialogBaseProps {
  onClose?: StandardAction;
  onSuccess?: StandardAction;
}

function DeleteDialog(props: DeleteDialogProps) {
  const {
    open,
    items,
    onClose,
    onSuccess
  } = props;
  const [submissionComment, setSubmissionComment] = useState('');
  const [apiState, setApiState] = useSpreadState({
    error: null,
    submitting: false
  });
  const user = useActiveUser();
  const siteId = useActiveSiteId();
  //Dependency selection
  const [deleteDependencies, setDeleteDependencies] = useState<DeleteDependencies>();
  const [selectedItems, setSelectedItems] = useState([]);

  const resource = useStateResource<any, any>(
    deleteDependencies,
    {
      shouldResolve: (deleteDependencies) => Boolean(deleteDependencies),
      shouldReject: () => Boolean(apiState.error),
      shouldRenew: (source, resource) => resource.complete,
      resultSelector: () => deleteDependencies,
      errorSelector: () => apiState.error
    }
  );

  useEffect(() => {
    fetchDeleteDependencies(siteId, selectedItems).subscribe(
      (response: any) => {
        setDeleteDependencies({
          childItems: response.items.childItems,
          dependentItems: response.items.dependentItems
        });
      },
      (error) => {
        setApiState({ error });
      }
    );
  },[selectedItems]);

  const handleClose = () => {
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
        setApiState({ submitting: false });
        onSuccess?.(response);
      },
      (error) => {
        setApiState({ error });
      }
    );

  };

  const onSelectionChange = (selection: Item[]) => {
    setSelectedItems(selection);
  };

  return (
    <DeleteDialogUI
      resource={resource}
      items={items}
      selectedItems={selectedItems}
      submissionComment={submissionComment}
      setSubmissionComment={setSubmissionComment}
      open={open}
      apiState={apiState}
      handleClose={handleClose}
      handleSubmit={handleSubmit}
      onSelectionChange={onSelectionChange}
      onClose={onClose}
    />
  )
}

export default DeleteDialog;
