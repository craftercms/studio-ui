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

import DialogHeader from '../Dialogs/DialogHeader';
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

export interface PublishDialogUIProps {
  resource: Resource<PublishDialogResourceBody>;
  publishingChannelsStatus: string;
  onPublishingChannelsFailRetry: Function;
  onDismiss?(): void;
  handleSubmit: any;
  submitDisabled: boolean;
  showDepsDisabled: boolean;
  dialog: InternalDialogState;
  setDialog: any;
  title: string;
  subtitle?: string;
  checkedItems: LookupTable<boolean>;
  checkedSoftDep: LookupTable<boolean>;
  setCheckedSoftDep: Function;
  onClickSetChecked: Function;
  deps: any;
  selectAllDeps: Function;
  selectAllSoft: Function;
  onClickShowAllDeps?: any;
  showEmailCheckbox?: boolean;
  showRequestApproval: boolean;
  apiState: any;
  classes?: any;
  submitLabel: ReactNode;
  mixedPublishingDates?: boolean;
  mixedPublishingTargets?: boolean;
  submissionCommentRequired: boolean;
}

export function PublishDialogUI(props: PublishDialogUIProps) {
  // region const { ... } = props
  const {
    resource,
    publishingChannelsStatus,
    onPublishingChannelsFailRetry,
    onDismiss,
    handleSubmit,
    submitDisabled,
    showDepsDisabled,
    dialog,
    setDialog,
    title,
    subtitle,
    checkedItems,
    checkedSoftDep,
    setCheckedSoftDep,
    onClickSetChecked,
    deps,
    selectAllDeps,
    selectAllSoft,
    onClickShowAllDeps,
    showEmailCheckbox,
    showRequestApproval,
    apiState,
    classes,
    submitLabel,
    mixedPublishingDates,
    mixedPublishingTargets,
    submissionCommentRequired
  } = props;
  // endregion
  return (
    <>
      <DialogHeader title={title} subtitle={subtitle} onDismiss={onDismiss} />
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
            checkedItems={checkedItems}
            checkedSoftDep={checkedSoftDep}
            setCheckedSoftDep={setCheckedSoftDep}
            onClickSetChecked={onClickSetChecked}
            deps={deps}
            selectAllDeps={selectAllDeps}
            selectAllSoft={selectAllSoft}
            dialog={dialog}
            setDialog={setDialog}
            showEmailCheckbox={showEmailCheckbox}
            showRequestApproval={showRequestApproval}
            publishingChannelsStatus={publishingChannelsStatus}
            onPublishingChannelsFailRetry={onPublishingChannelsFailRetry}
            apiState={apiState}
            mixedPublishingDates={mixedPublishingDates}
            mixedPublishingTargets={mixedPublishingTargets}
            submissionCommentRequired={submissionCommentRequired}
          />
        </SuspenseWithEmptyState>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton
          color="primary"
          onClick={onClickShowAllDeps}
          className={classes.leftAlignedAction}
          disabled={showDepsDisabled || apiState.submitting || apiState.fetchingDependencies}
          loading={apiState.fetchingDependencies}
        >
          <FormattedMessage id="publishDialog.showAllDependencies" defaultMessage="Show All Dependencies" />
        </SecondaryButton>
        <SecondaryButton onClick={onDismiss} disabled={apiState.submitting}>
          <FormattedMessage id="requestPublishDialog.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton onClick={handleSubmit} disabled={submitDisabled} loading={apiState.submitting}>
          {submitLabel}
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}
