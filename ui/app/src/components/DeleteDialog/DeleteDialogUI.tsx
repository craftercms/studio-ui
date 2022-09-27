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

import React from 'react';
import { FormattedMessage } from 'react-intl';
import DialogBody from '../DialogBody/DialogBody';
import { SuspenseWithEmptyState } from '../Suspencified';
import DialogFooter from '../DialogFooter/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import DeleteDialogUIBody from './DeleteDialogUIBody';
import { DeleteDialogUIProps } from './utils';

export function DeleteDialogUI(props: DeleteDialogUIProps) {
  const {
    resource,
    items,
    selectedItems,
    comment,
    onCommentChange,
    isDisabled,
    isSubmitting,
    onSubmit,
    onCloseButtonClick,
    isConfirmDeleteChecked,
    isCommentRequired,
    isSubmitButtonDisabled,
    onItemClicked,
    onSelectAllClicked,
    onSelectAllDependantClicked,
    onConfirmDeleteChange,
    onEditDependantClick
  } = props;
  return (
    <>
      <DialogBody minHeight>
        <SuspenseWithEmptyState resource={resource}>
          <DeleteDialogUIBody
            isDisabled={isDisabled}
            onItemClicked={onItemClicked}
            onSelectAllClicked={onSelectAllClicked}
            onSelectAllDependantClicked={onSelectAllDependantClicked}
            resource={resource}
            selectedItems={selectedItems}
            items={items}
            comment={comment}
            onCommentChange={onCommentChange}
            isCommentRequired={isCommentRequired}
            onConfirmDeleteChange={onConfirmDeleteChange}
            isConfirmDeleteChecked={isConfirmDeleteChecked}
            onEditDependantClick={onEditDependantClick}
          />
        </SuspenseWithEmptyState>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onCloseButtonClick} disabled={isDisabled}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton onClick={onSubmit} disabled={isSubmitButtonDisabled || isDisabled} loading={isSubmitting}>
          <FormattedMessage id="words.delete" defaultMessage="Delete" />
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}

export default DeleteDialogUI;
