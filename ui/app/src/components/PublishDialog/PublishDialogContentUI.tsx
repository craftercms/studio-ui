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

import Grid from '@mui/material/Grid2';
import DependencySelection from '../DependencySelection/DependencySelection';
import PublishDialogForm from './PublishDialogForm';
import React from 'react';
import { PublishDialogUIProps } from './utils';
import Alert from '@mui/material/Alert';
import { FormattedMessage } from 'react-intl';
import { Typography } from '@mui/material';

export type PublishDialogContentUIProps = Pick<
  PublishDialogUIProps,
  | 'items'
  | 'publishingTargets'
  | 'published'
  | 'selectedItems'
  | 'onItemClicked'
  | 'dependencies'
  | 'onSelectAll'
  | 'onSelectAllSoftDependencies'
  | 'state'
  | 'isRequestPublish'
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
    items,
    publishingTargets,
    published,
    selectedItems,
    onItemClicked,
    dependencies,
    onSelectAll,
    onSelectAllSoftDependencies,
    state,
    isRequestPublish,
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
  return (
    <>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 7 }}>
          {published ? (
            <>
              {isRequestPublish && (
                <Alert severity="info" sx={{ mb: '10px' }}>
                  <Typography>
                    <FormattedMessage
                      id="publishDialog.requestPublishHint"
                      defaultMessage="Items will be submitted for review and published upon approval"
                    />
                  </Typography>
                </Alert>
              )}
              <DependencySelection
                items={items}
                selectedItems={selectedItems}
                onItemClicked={onItemClicked}
                dependencies={dependencies}
                onSelectAllClicked={onSelectAll}
                onSelectAllSoftClicked={onSelectAllSoftDependencies}
                disabled={isSubmitting}
              />
            </>
          ) : (
            <Alert severity="warning">
              <FormattedMessage
                id="publishDialog.firstPublish"
                defaultMessage="The entire project will be published since this is the first publish request"
              />
            </Alert>
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 5 }}>
          <PublishDialogForm
            state={state}
            published={published}
            isRequestPublish={isRequestPublish}
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
