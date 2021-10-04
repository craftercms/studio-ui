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

import Grid from '@mui/material/Grid';
import DependencySelection from '../../modules/Content/Dependencies/DependencySelection';
import PublishDialogForm from './PublishDialogForm';
import React from 'react';
import { PublishDialogUIProps } from './utils';

export type PublishDialogContentUIProps = Pick<
  PublishDialogUIProps,
  | 'resource'
  | 'selectedItems'
  | 'onItemClicked'
  | 'dependencies'
  | 'onSelectAll'
  | 'onSelectAllSoftDependencies'
  | 'state'
  | 'showEmailCheckbox'
  | 'showRequestApproval'
  | 'publishingTargetsStatus'
  | 'onPublishingChannelsFailRetry'
  | 'mixedPublishingDates'
  | 'mixedPublishingTargets'
  | 'submissionCommentRequired'
  | 'onPublishingArgumentChange'
  | 'isSubmitting'
>;

export function PublishDialogContentUI(props: PublishDialogContentUIProps) {
  // region { ... } = props
  const {
    resource,
    selectedItems,
    onItemClicked,
    dependencies,
    onSelectAll,
    onSelectAllSoftDependencies,
    state,
    showEmailCheckbox,
    showRequestApproval,
    publishingTargetsStatus,
    onPublishingChannelsFailRetry,
    mixedPublishingDates,
    mixedPublishingTargets,
    submissionCommentRequired,
    onPublishingArgumentChange,
    isSubmitting
  } = props;
  // endregion
  const { items, publishingTargets } = resource.read();
  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={7} md={7} lg={7} xl={7}>
          <DependencySelection
            items={items}
            selectedItems={selectedItems}
            onItemClicked={onItemClicked}
            dependencies={dependencies}
            onSelectAllClicked={onSelectAll}
            onSelectAllSoftClicked={onSelectAllSoftDependencies}
            disabled={isSubmitting}
          />
        </Grid>
        <Grid item xs={12} sm={5} md={5} lg={5} xl={5}>
          <PublishDialogForm
            state={state}
            showEmailCheckbox={showEmailCheckbox}
            showRequestApproval={showRequestApproval}
            publishingChannels={publishingTargets}
            publishingTargetsStatus={publishingTargetsStatus}
            onPublishingChannelsFailRetry={onPublishingChannelsFailRetry}
            disabled={isSubmitting}
            mixedPublishingDates={mixedPublishingDates}
            mixedPublishingTargets={mixedPublishingTargets}
            submissionCommentRequired={submissionCommentRequired}
            onChange={onPublishingArgumentChange}
          />
        </Grid>
      </Grid>
    </>
  );
}

export default PublishDialogContentUI;
