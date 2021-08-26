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

import Grid from '@material-ui/core/Grid';
import DependencySelection from '../../modules/Content/Dependencies/DependencySelection';
import PublishDialogForm from './PublishDialogForm';
import React from 'react';
import { PublishDialogUIProps } from './PublishDialogUI';

export type PublishDialogContentUIProps = Pick<
  PublishDialogUIProps,
  | 'resource'
  | 'checkedItems'
  | 'checkedSoftDep'
  | 'setCheckedSoftDep'
  | 'onClickSetChecked'
  | 'deps'
  | 'selectAllDeps'
  | 'selectAllSoft'
  | 'dialog'
  | 'setDialog'
  | 'showEmailCheckbox'
  | 'showRequestApproval'
  | 'publishingChannelsStatus'
  | 'onPublishingChannelsFailRetry'
  | 'apiState'
  | 'mixedPublishingDates'
  | 'mixedPublishingTargets'
  | 'submissionCommentRequired'
>;

export function PublishDialogContentUI(props: PublishDialogContentUIProps) {
  // region { ... } = props
  const {
    resource,
    checkedItems,
    checkedSoftDep,
    setCheckedSoftDep,
    onClickSetChecked,
    deps,
    selectAllDeps,
    selectAllSoft,
    dialog,
    setDialog,
    showEmailCheckbox,
    showRequestApproval,
    publishingChannelsStatus,
    onPublishingChannelsFailRetry,
    apiState,
    mixedPublishingDates,
    mixedPublishingTargets,
    submissionCommentRequired
  } = props;
  // endregion
  const { items, publishingChannels } = resource.read();
  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={7} md={7} lg={7} xl={7}>
          <DependencySelection
            items={items}
            checked={checkedItems}
            checkedSoftDep={checkedSoftDep}
            setCheckedSoftDep={setCheckedSoftDep}
            onClickSetChecked={onClickSetChecked}
            deps={deps}
            onSelectAllClicked={selectAllDeps}
            onSelectAllSoftClicked={selectAllSoft}
            disabled={apiState.submitting}
          />
        </Grid>
        <Grid item xs={12} sm={5} md={5} lg={5} xl={5}>
          <PublishDialogForm
            dialog={dialog}
            setInputs={setDialog}
            showEmailCheckbox={showEmailCheckbox}
            showRequestApproval={showRequestApproval}
            publishingChannels={publishingChannels}
            publishingChannelsStatus={publishingChannelsStatus}
            onPublishingChannelsFailRetry={onPublishingChannelsFailRetry}
            disabled={apiState.submitting}
            mixedPublishingDates={mixedPublishingDates}
            mixedPublishingTargets={mixedPublishingTargets}
            submissionCommentRequired={submissionCommentRequired}
          />
        </Grid>
      </Grid>
    </>
  );
}

export default PublishDialogContentUI;
