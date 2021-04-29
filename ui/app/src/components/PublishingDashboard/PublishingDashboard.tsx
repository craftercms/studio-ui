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

import * as React from 'react';
import { useActiveSiteId, useSelection, useSpreadState } from '../../utils/hooks';
import PublishingStatusWidget from '../PublishingStatusWidget';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { bulkGoLive, clearLock, publishByCommits, start, stop } from '../../services/publishing';
import { fetchPublishingStatus } from '../../state/actions/publishingStatus';
import { useDispatch } from 'react-redux';
import PublishWidget from '../PublishWidget';
import Grid from '@material-ui/core/Grid';
import { defineMessages, useIntl } from 'react-intl';
import { BulkPublishFormData, PublishByFormData } from '../../models/Publishing';
import PublishingQueueWidget from '../PublishingQueueWidget';
import { useEffect, useState } from 'react';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      padding: '50px'
    }
  })
);

const messages = defineMessages({
  bulkPublishTitle: {
    id: 'bulkPublish.title',
    defaultMessage: 'Bulk Publish'
  },
  publishByTitle: {
    id: 'publishBy.title',
    defaultMessage: 'Publish By...'
  },
  bulkPublishNote: {
    id: 'bulkPublish.note',
    defaultMessage:
      'Bulk publish should be used to publish changes made in Studio via the UI. For changes made via direct git actions, use the "Publish by..." feature.'
  },
  publishByNote: {
    id: 'publishBy.note',
    defaultMessage:
      '"Publish by..." feature must be used for changes made via direct git actions against the repository or pulled from a remote repository. For changes made via Studio on the UI, use "Bulk Publish".'
  }
});

const initialBulkPublishFormData = {
  path: '',
  environment: '',
  comment: ''
};

const initialPublishByFormData = {
  commitIds: '',
  environment: '',
  comment: ''
};

export default function PublishingDashboard() {
  const state = useSelection((state) => state.dialogs.publishingStatus);
  const classes = useStyles();
  const site = useActiveSiteId();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [bulkPublishFormData, setBulkPublishFormData] = useSpreadState<BulkPublishFormData>(initialBulkPublishFormData);
  const [publishByFormData, setPublishByFormData] = useSpreadState<PublishByFormData>(initialPublishByFormData);
  const [bulkPublishFormValid, setBulkPublishFormValid] = useState(false);
  const [publishByFormValid, setPublishByFormValid] = useState(false);

  useEffect(() => {
    setBulkPublishFormValid(
      bulkPublishFormData.path.replace(/\s/g, '') !== '' && bulkPublishFormData.environment !== ''
    );
  }, [bulkPublishFormData]);

  useEffect(() => {
    setPublishByFormValid(
      publishByFormData.commitIds.replace(/\s/g, '') !== '' && publishByFormData.environment !== ''
    );
  }, [publishByFormData]);

  const onStartStop = () => {
    const action = state.status === 'ready' ? stop : start;

    action(site).subscribe(() => {
      dispatch(fetchPublishingStatus());
    });
  };

  const onRefresh = () => {
    dispatch(fetchPublishingStatus());
  };

  const onUnlock = () => {
    clearLock(site).subscribe(() => {
      dispatch(fetchPublishingStatus());
    });
  };

  // TODO: legacy shows a confirmation dialog, should it be shown in here?
  const bulkPublish = () => {
    const { path, environment, comment } = bulkPublishFormData;
    bulkGoLive(site, path, environment, comment).subscribe(() => {
      setBulkPublishFormData(initialBulkPublishFormData);
    });
  };

  const publishBy = () => {
    const { commitIds, environment, comment } = publishByFormData;
    const ids = commitIds.replace(/\s/g, '').split(',');

    publishByCommits(site, ids, environment, comment).subscribe(() => {
      // TODO: show snackbar
      setPublishByFormData(initialPublishByFormData);
    });
  };

  return (
    <section className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <PublishingStatusWidget state={state} onStartStop={onStartStop} onRefresh={onRefresh} onUnlock={onUnlock} />
        </Grid>
        <Grid item md={6}>
          <PublishWidget
            title={formatMessage(messages.bulkPublishTitle)}
            note={formatMessage(messages.bulkPublishNote)}
            type="bulkPublish"
            bulkPublishFormData={bulkPublishFormData}
            setBulkPublishFormData={setBulkPublishFormData}
            formValid={bulkPublishFormValid}
            onPublish={bulkPublish}
          />
        </Grid>
        <Grid item md={6}>
          <PublishWidget
            title={formatMessage(messages.publishByTitle)}
            note={formatMessage(messages.publishByNote)}
            type="publishBy"
            publishByFormData={publishByFormData}
            setPublishByFormData={setPublishByFormData}
            formValid={publishByFormValid}
            onPublish={publishBy}
          />
        </Grid>
        <Grid item xs={12}>
          <PublishingQueueWidget siteId={site} />
        </Grid>
      </Grid>
    </section>
  );
}
