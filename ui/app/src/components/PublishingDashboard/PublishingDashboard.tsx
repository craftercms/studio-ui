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
import Grid from '@material-ui/core/Grid';
import { defineMessages, useIntl } from 'react-intl';
import { BulkPublishFormData, PublishByFormData } from '../../models/Publishing';
import PublishingQueueWidget from '../PublishingQueueWidget';
import { useEffect, useState } from 'react';
import PublishOnDemandWidget from '../PublishOnDemandWidget';

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

const initialPublishStudioFormData = {
  path: '',
  environment: '',
  comment: ''
};

const initialPublishGitFormData = {
  commitIds: '',
  environment: '',
  comment: ''
};

export default function PublishingDashboard() {
  const state = useSelection((state) => state.dialogs.publishingStatus);
  const classes = useStyles();
  const site = useActiveSiteId();
  const dispatch = useDispatch();
  const [publishGitFormValid, setPublishGitFormValid] = useState(false);
  const [publishOnDemandMode, setPublishOnDemandMode] = useState<PublishOnDemandMode>(null);
  const [publishStudioFormData, setPublishStudioFormData] = useSpreadState<PublishFormData>(
    initialPublishStudioFormData
  );
  const [publishStudioFormValid, setPublishStudioFormValid] = useState(false);
  const [publishGitFormData, setPublishGitFormData] = useSpreadState<PublishFormData>(initialPublishGitFormData);

  useEffect(() => {
    if (publishOnDemandMode === 'studio') {
      setPublishStudioFormValid(
        publishStudioFormData.path.replace(/\s/g, '') !== '' && publishStudioFormData.environment !== ''
      );
    } else {
      setPublishGitFormValid(
        publishGitFormData.commitIds.replace(/\s/g, '') !== '' && publishGitFormData.environment !== ''
      );
    }
  }, [publishStudioFormData, publishGitFormData, publishOnDemandMode]);

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
    const { path, environment, comment } = publishStudioFormData;
    bulkGoLive(site, path, environment, comment).subscribe(() => {
      setPublishStudioFormData(initialPublishStudioFormData);
    });
  };

  const publishBy = () => {
    const { commitIds, environment, comment } = publishGitFormData;
    const ids = commitIds.replace(/\s/g, '').split(',');

    publishByCommits(site, ids, environment, comment).subscribe(() => {
      // TODO: show snackbar
      setPublishGitFormData(initialPublishGitFormData);
    });
  };

  const onCancelPublishOnDemand = () => {
    setPublishOnDemandMode(null);
    setPublishStudioFormData(initialPublishStudioFormData);
    setPublishGitFormData(initialPublishGitFormData);
  };

  return (
    <section className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <PublishingStatusWidget state={state} onStartStop={onStartStop} onRefresh={onRefresh} onUnlock={onUnlock} />
        </Grid>
        <Grid item xs={12}>
          <PublishOnDemandWidget
            mode={publishOnDemandMode}
            setMode={setPublishOnDemandMode}
            formData={publishOnDemandMode === 'studio' ? publishStudioFormData : publishGitFormData}
            setFormData={publishOnDemandMode === 'studio' ? setPublishStudioFormData : setPublishGitFormData}
            formValid={publishOnDemandMode === 'studio' ? publishStudioFormValid : publishGitFormValid}
            onPublish={publishOnDemandMode === 'studio' ? bulkPublish : publishBy}
            onCancel={onCancelPublishOnDemand}
          />
        </Grid>
        <Grid item xs={12}>
          <PublishingQueueWidget siteId={site} />
        </Grid>
      </Grid>
    </section>
  );
}
