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

import { FormattedMessage, useIntl } from 'react-intl';
import DialogHeader from '../Dialogs/DialogHeader';
import { translations } from './translations';
import DialogBody from '../Dialogs/DialogBody';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import React from 'react';
import { Resource } from '../../models/Resource';
import { DeleteDependencies } from '../../modules/Content/Dependencies/DependencySelection';
import { DetailedItem } from '../../models/Item';
import DeleteDialogUIBody from './DeleteDialogUIBody';
import { InputProps as StandardInputProps } from '@material-ui/core/Input/Input';
import { SelectionListProps } from '../../modules/Content/Dependencies/SelectionList';
import LookupTable from '../../models/LookupTable';
import ApiResponse from '../../models/ApiResponse';

interface DeleteDialogUIProps {
  resource: Resource<DeleteDependencies>;
  items: DetailedItem[];
  selectedItems: LookupTable<boolean>;
  comment: string;
  onCommentChange: StandardInputProps['onChange'];
  apiState: { error: ApiResponse; submitting: boolean };
  isCommentRequired: boolean;
  onSubmit: any;
  submitDisabled: boolean;
  onItemClicked: SelectionListProps['onItemClicked'];
  onSelectAllClicked: SelectionListProps['onSelectAllClicked'];
  onSelectAllDependantClicked: SelectionListProps['onSelectAllClicked'];
  onDismiss(): void;
}

export function DeleteDialogUI(props: DeleteDialogUIProps) {
  const {
    resource,
    items,
    selectedItems,
    comment,
    onCommentChange,
    apiState,
    onSubmit,
    onDismiss,
    isCommentRequired,
    submitDisabled,
    onItemClicked,
    onSelectAllClicked,
    onSelectAllDependantClicked
  } = props;
  const { formatMessage } = useIntl();
  return (
    <>
      <DialogHeader
        title={formatMessage(translations.headerTitle)}
        subtitle={formatMessage(translations.headerSubTitle)}
        onDismiss={onDismiss}
        disableDismiss={apiState.submitting}
      />
      <DialogBody minHeight>
        <SuspenseWithEmptyState resource={resource}>
          <DeleteDialogUIBody
            disabled={apiState.submitting}
            onItemClicked={onItemClicked}
            onSelectAllClicked={onSelectAllClicked}
            onSelectAllDependantClicked={onSelectAllDependantClicked}
            resource={resource}
            selectedItems={selectedItems}
            items={items}
            comment={comment}
            onCommentChange={onCommentChange}
            isCommentRequired={isCommentRequired}
          />
        </SuspenseWithEmptyState>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onDismiss} disabled={apiState.submitting}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton onClick={onSubmit} disabled={submitDisabled} loading={apiState.submitting}>
          <FormattedMessage id="words.delete" defaultMessage="Delete" />
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}
