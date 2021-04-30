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
import {
  bulkGoLive,
  clearLock,
  fetchPublishingTargets,
  publishByCommits,
  start,
  stop
} from '../../services/publishing';
import { fetchPublishingStatus } from '../../state/actions/publishingStatus';
import { useDispatch } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import { PublishOnDemandMode, PublishFormData } from '../../models/Publishing';
import PublishingQueueWidget from '../PublishingQueueWidget';
import { useEffect, useState } from 'react';
import PublishOnDemandWidget from '../PublishOnDemandWidget';
import { defineMessages, useIntl } from 'react-intl';
import { closeConfirmDialog, showConfirmDialog } from '../../state/actions/dialogs';
import { showSystemNotification } from '../../state/actions/system';
import { batchActions, dispatchDOMEvent } from '../../state/actions/misc';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      padding: '50px'
    },
    warningText: {
      display: 'block'
    }
  })
);

const messages = defineMessages({
  publishStudioWarning: {
    id: 'publishingDashboard.warning',
    defaultMessage:
      "This will force publish all items that match the pattern requested including their dependencies, and it may take a long time depending on the number of items. Please make sure that all modified items (including potentially someone's work in progress) are ready to be published before continuing."
  },
  warningLabel: {
    id: 'words.warning',
    defaultMessage: 'Warning'
  },
  publishStudioNote: {
    id: 'publishingDashboard.studioNote',
    defaultMessage:
      'Publishing by path should be used to publish changes made in Studio via the UI. For changes made via direct git actions, please publish by commit or tag.'
  },
  publishGitNote: {
    id: 'publishingDashboard.gitNote',
    defaultMessage:
      'Publishing by commit or tag must be used for changes made via direct git actions against the repository or pulled from a remote repository. For changes made via Studio on the UI, use please publish by path.'
  },
  publishSuccess: {
    id: 'publishingDashboard.publishSuccess',
    defaultMessage: 'Published successfully.'
  },
  bulkPublishStarted: {
    id: 'publishingDashboard.bulkPublishStarted',
    defaultMessage: 'Bulk Publish process has been started.'
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
  const [publishingTargets, setPublishingTargets] = useState(null);
  const [publishingTargetsError, setPublishingTargetsError] = useState(null);
  const [publishGitFormValid, setPublishGitFormValid] = useState(false);
  const [publishOnDemandMode, setPublishOnDemandMode] = useState<PublishOnDemandMode>(null);
  const [publishStudioFormData, setPublishStudioFormData] = useSpreadState<PublishFormData>(
    initialPublishStudioFormData
  );
  const [publishStudioFormValid, setPublishStudioFormValid] = useState(false);
  const [publishGitFormData, setPublishGitFormData] = useSpreadState<PublishFormData>(initialPublishGitFormData);
  const { formatMessage } = useIntl();
  const idSuccess = 'bulkPublishSuccess';
  const idCancel = 'bulkPublishCancel';

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

  useEffect(() => {
    fetchPublishingTargets(site).subscribe(
      (targets) => {
        setPublishingTargets(targets);
      },
      (error) => {
        setPublishingTargetsError(error);
      }
    );
  }, [site]);

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

  const bulkPublish = () => {
    const { path, environment, comment } = publishStudioFormData;
    bulkGoLive(site, path, environment, comment).subscribe(
      () => {
        dispatch(
          showSystemNotification({
            message: formatMessage(messages.bulkPublishStarted)
          })
        );
        setPublishStudioFormData(initialPublishStudioFormData);
      },
      ({ response }) => {
        showSystemNotification({
          message: response.message,
          options: { variant: 'error' }
        });
      }
    );
  };

  const bulkPublishConfirmation = () => {
    dispatch(
      showConfirmDialog({
        body: `${formatMessage(messages.publishStudioWarning)} ${formatMessage(messages.publishStudioNote)}`,
        onCancel: batchActions([closeConfirmDialog(), dispatchDOMEvent({ id: idCancel })]),
        onOk: batchActions([closeConfirmDialog(), dispatchDOMEvent({ id: idSuccess })])
      })
    );

    const successCallback = () => {
      bulkPublish();
      document.removeEventListener(idSuccess, successCallback, false);
      document.removeEventListener(idCancel, cancelCallback, false);
    };
    const cancelCallback = () => {
      document.removeEventListener(idCancel, cancelCallback, false);
      document.removeEventListener(idSuccess, successCallback, false);
    };

    document.addEventListener(idSuccess, successCallback, false);
    document.addEventListener(idCancel, cancelCallback, false);
  };

  const publishBy = () => {
    const { commitIds, environment, comment } = publishGitFormData;
    const ids = commitIds.replace(/\s/g, '').split(',');

    publishByCommits(site, ids, environment, comment).subscribe(
      () => {
        dispatch(
          showSystemNotification({
            message: formatMessage(messages.publishSuccess)
          })
        );
        setPublishGitFormData(initialPublishGitFormData);
      },
      ({ response }) => {
        dispatch(
          showSystemNotification({
            message: response.message,
            options: { variant: 'error' }
          })
        );
      }
    );
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
            publishingTargets={publishingTargets}
            publishingTargetsError={publishingTargetsError}
            onPublish={publishOnDemandMode === 'studio' ? bulkPublishConfirmation : publishBy}
            note={formatMessage(
              publishOnDemandMode === 'studio' ? messages.publishStudioNote : messages.publishGitNote
            )}
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
