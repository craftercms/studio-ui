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
import { FormattedMessage } from 'react-intl';
import DialogFooter from '../DialogFooter/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import React from 'react';
import { PublishDialogUIProps } from './utils';
import PublishDialogContentUI from './PublishDialogContentUI';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { LoadingState } from '../LoadingState';
import { EmptyState } from '../EmptyState';

export function PublishDialogUI(props: PublishDialogUIProps) {
  // region const { ... } = props
  const {
    items,
    publishingTargets,
    isFetching,
    error,
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
    isRequestPublish,
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
        {error ? (
          <ApiResponseErrorState error={error} />
        ) : isFetching ? (
          <LoadingState />
        ) : items && publishingTargets ? (
          items.length ? (
            <PublishDialogContentUI
              items={items}
              publishingTargets={publishingTargets}
              published={published}
              selectedItems={selectedItems}
              onItemClicked={onItemClicked}
              dependencies={dependencies}
              onSelectAll={onSelectAll}
              onSelectAllSoftDependencies={onSelectAllSoftDependencies}
              state={state}
              isRequestPublish={isRequestPublish}
              showRequestApproval={showRequestApproval}
              publishingTargetsStatus={publishingTargetsStatus}
              onPublishingChannelsFailRetry={onPublishingChannelsFailRetry}
              mixedPublishingDates={mixedPublishingDates}
              mixedPublishingTargets={mixedPublishingTargets}
              submissionCommentRequired={submissionCommentRequired}
              onPublishingArgumentChange={onPublishingArgumentChange}
              isSubmitting={isSubmitting}
            />
          ) : (
            <EmptyState
              title={
                <FormattedMessage id="publishDialog.noItemsSelected" defaultMessage="No items have been selected" />
              }
            />
          )
        ) : (
          <></>
        )}
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
