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

import DialogBody from '../Dialogs/DialogBody';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { FormattedMessage } from 'react-intl';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import React, { ReactNode } from 'react';
import { Resource } from '../../models/Resource';
import LookupTable from '../../models/LookupTable';
import { InternalDialogState, PublishDialogResourceBody } from './utils';
import PublishDialogContentUI from './PublishDialogContentUI';
import { FetchDependenciesResponse } from '../../services/dependencies';
import { DependencySelectionProps } from '../../modules/Content/Dependencies/DependencySelection';

export interface PublishDialogUIProps {
  resource: Resource<PublishDialogResourceBody>;
  publishingTargetsStatus: string;
  onPublishingChannelsFailRetry(): void;
  onCloseButtonClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
  handleSubmit: any;
  isSubmitting: boolean;
  submitDisabled: boolean;
  state: InternalDialogState;
  selectedItems: LookupTable<boolean>;
  onItemClicked: DependencySelectionProps['onItemClicked'];
  dependencies: FetchDependenciesResponse;
  onSelectAll(): void;
  onSelectAllSoftDependencies(): void;
  onClickShowAllDeps?: any;
  showEmailCheckbox?: boolean;
  showRequestApproval: boolean;
  classes?: any;
  submitLabel: ReactNode;
  mixedPublishingDates?: boolean;
  mixedPublishingTargets?: boolean;
  submissionCommentRequired: boolean;
  onPublishingArgumentChange(e: React.ChangeEvent<HTMLInputElement>): void;
}

export function PublishDialogUI(props: PublishDialogUIProps) {
  // region const { ... } = props
  const {
    resource,
    publishingTargetsStatus,
    onPublishingChannelsFailRetry,
    onCloseButtonClick,
    handleSubmit,
    isSubmitting,
    submitDisabled,
    state,
    selectedItems,
    onItemClicked,
    dependencies,
    onSelectAll,
    onSelectAllSoftDependencies,
    onClickShowAllDeps,
    showEmailCheckbox,
    showRequestApproval,
    classes,
    submitLabel,
    mixedPublishingDates,
    mixedPublishingTargets,
    submissionCommentRequired,
    onPublishingArgumentChange
  } = props;
  // endregion
  return (
    <>
      <DialogBody>
        <SuspenseWithEmptyState
          resource={resource}
          withEmptyStateProps={{
            emptyStateProps: {
              title: (
                <FormattedMessage id="publishDialog.noItemsSelected" defaultMessage="No items have been selected" />
              )
            },
            isEmpty: (value) => value.items.length === 0
          }}
        >
          <PublishDialogContentUI
            resource={resource}
            selectedItems={selectedItems}
            onItemClicked={onItemClicked}
            dependencies={dependencies}
            onSelectAll={onSelectAll}
            onSelectAllSoftDependencies={onSelectAllSoftDependencies}
            state={state}
            showEmailCheckbox={showEmailCheckbox}
            showRequestApproval={showRequestApproval}
            publishingTargetsStatus={publishingTargetsStatus}
            onPublishingChannelsFailRetry={onPublishingChannelsFailRetry}
            mixedPublishingDates={mixedPublishingDates}
            mixedPublishingTargets={mixedPublishingTargets}
            submissionCommentRequired={submissionCommentRequired}
            onPublishingArgumentChange={onPublishingArgumentChange}
            isSubmitting={isSubmitting}
          />
        </SuspenseWithEmptyState>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton
          color="primary"
          onClick={onClickShowAllDeps}
          className={classes.leftAlignedAction}
          disabled={isSubmitting || state.fetchingDependencies}
          loading={state.fetchingDependencies}
        >
          <FormattedMessage id="publishDialog.showAllDependencies" defaultMessage="Show All Dependencies" />
        </SecondaryButton>
        <SecondaryButton onClick={onCloseButtonClick} disabled={isSubmitting}>
          <FormattedMessage id="requestPublishDialog.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton onClick={handleSubmit} disabled={submitDisabled} loading={isSubmitting}>
          {submitLabel}
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}

export default PublishDialogUI;
