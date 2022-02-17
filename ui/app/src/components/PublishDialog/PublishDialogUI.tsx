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

import DialogBody from '../DialogBody/DialogBody';
import { SuspenseWithEmptyState } from '../Suspencified/Suspencified';
import { FormattedMessage } from 'react-intl';
import DialogFooter from '../DialogFooter/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import React from 'react';
import { PublishDialogUIProps } from './utils';
import PublishDialogContentUI from './PublishDialogContentUI';

export function PublishDialogUI(props: PublishDialogUIProps) {
  // region const { ... } = props
  const {
    resource,
    published,
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
            published={published}
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
        {published && (
          <SecondaryButton
            color="primary"
            onClick={onClickShowAllDeps}
            className={classes.leftAlignedAction}
            disabled={isSubmitting || state.fetchingDependencies}
            loading={state.fetchingDependencies}
          >
            <FormattedMessage id="publishDialog.showAllDependencies" defaultMessage="Show All Dependencies" />
          </SecondaryButton>
        )}
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
