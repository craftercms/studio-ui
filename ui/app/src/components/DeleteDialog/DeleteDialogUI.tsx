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

import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import DialogHeader from '../DialogHeader/DialogHeader';
import { translations } from './translations';
import DialogBody from '../Dialogs/DialogBody';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import DeleteDialogUIBody, { DeleteDialogContentUIProps } from './DeleteDialogUIBody';

interface DeleteDialogUIProps extends DeleteDialogContentUIProps {
  isSubmitting: boolean;
  isSubmitButtonDisabled: boolean;
  onSubmit(): void;
  onDismiss(): void;
}

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
    onDismiss,
    isConfirmDeleteChecked,
    isCommentRequired,
    isSubmitButtonDisabled,
    onItemClicked,
    onSelectAllClicked,
    onSelectAllDependantClicked,
    onConfirmDeleteChange,
    onEditDependantClick
  } = props;
  const { formatMessage } = useIntl();
  return (
    <>
      <DialogHeader
        title={formatMessage(translations.headerTitle)}
        subtitle={formatMessage(translations.headerSubTitle)}
        onDismiss={onDismiss}
        disableDismiss={isDisabled}
      />
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
        <SecondaryButton onClick={onDismiss} disabled={isDisabled}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton onClick={onSubmit} disabled={isSubmitButtonDisabled || isDisabled} loading={isSubmitting}>
          <FormattedMessage id="words.delete" defaultMessage="Delete" />
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}
