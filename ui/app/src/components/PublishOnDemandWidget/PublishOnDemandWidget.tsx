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

import * as React from 'react';
import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import DialogHeader from '../DialogHeader/DialogHeader';
import DialogFooter from '../DialogFooter/DialogFooter';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import palette from '../../styles/palette';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Collapse from '@mui/material/Collapse';
import ListItemText from '@mui/material/ListItemText';
import PublishOnDemandForm from '../PublishOnDemandForm';
import { PublishFormData, PublishOnDemandMode } from '../../models/Publishing';
import { nnou } from '../../utils/object';
import Typography from '@mui/material/Typography';
import { bulkGoLive, fetchPublishingTargets, publishByCommits } from '../../services/publishing';
import { showSystemNotification } from '../../state/actions/system';
import { useDispatch } from 'react-redux';
import { closeConfirmDialog, showConfirmDialog } from '../../state/actions/dialogs';
import { batchActions, dispatchDOMEvent } from '../../state/actions/misc';
import Link from '@mui/material/Link';
import { useSpreadState } from '../../hooks/useSpreadState';
import { useSelection } from '../../hooks/useSelection';
import { isBlank } from '../../utils/string';
import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import { createCustomDocumentEventListener } from '../../utils/dom';

const useStyles = makeStyles((theme) =>
  createStyles({
    content: {
      backgroundColor: theme.palette.background.default,
      padding: '16px'
    },
    modeSelector: {
      padding: '10px 25px',
      border: `1px solid ${palette.gray.light7}`,
      borderRadius: '10px'
    },
    byPathModeSelector: {
      marginBottom: '10px'
    },
    formContainer: {
      marginTop: '20px'
    },
    noteContainer: {
      textAlign: 'center',
      marginTop: '20px'
    },
    note: {
      color: theme.palette.action.active,
      display: 'inline-block',
      maxWidth: '700px'
    },
    noteLink: {
      color: 'inherit',
      textDecoration: 'underline'
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
      'Publishing by path should be used to publish changes made in Studio via the UI. For changes made via direct git actions, please <a>publish by commit or tag</a>.'
  },
  publishGitNote: {
    id: 'publishingDashboard.gitNote',
    defaultMessage:
      'Publishing by commit or tag must be used for changes made via direct git actions against the repository or pulled from a remote repository. For changes made via Studio on the UI, use please <a>publish by path</a>.'
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

interface PublishOnDemandWidgetProps {
  siteId: string;
}

export default function PublishOnDemandWidget(props: PublishOnDemandWidgetProps) {
  const { siteId } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [mode, setMode] = useState<PublishOnDemandMode>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishingTargets, setPublishingTargets] = useState(null);
  const [publishingTargetsError, setPublishingTargetsError] = useState(null);
  const [publishGitFormData, setPublishGitFormData] = useSpreadState<PublishFormData>(initialPublishGitFormData);
  const [publishGitFormValid, setPublishGitFormValid] = useState(false);
  const [publishStudioFormData, setPublishStudioFormData] =
    useSpreadState<PublishFormData>(initialPublishStudioFormData);
  const [publishStudioFormValid, setPublishStudioFormValid] = useState(false);
  const { bulkPublishCommentRequired, publishByCommitCommentRequired } = useSelection(
    (state) => state.uiConfig.publishing
  );

  const setDefaultPublishingTarget = (targets, clearData?) => {
    if (targets.length) {
      const stagingEnv = targets.find((target) => target.name === 'staging');
      const environment = stagingEnv?.name ?? targets[0].name;
      setPublishGitFormData({
        ...(clearData && initialPublishGitFormData),
        environment
      });
      setPublishStudioFormData({
        ...(clearData && initialPublishStudioFormData),
        environment
      });
    }
  };

  useEffect(() => {
    fetchPublishingTargets(siteId).subscribe({
      next({ publishingTargets: targets }) {
        setPublishingTargets(targets);
        // Set pre-selected environment.
        setDefaultPublishingTarget(targets);
      },
      error(error) {
        setPublishingTargetsError(error);
      }
    });
    // We only want to re-fetch the publishingTargets when the site changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId]);

  const onSubmitPublishBy = () => {
    setIsSubmitting(true);
    const { commitIds, environment, comment } = publishGitFormData;
    const ids = commitIds.replace(/\s/g, '').split(',');
    publishByCommits(siteId, ids, environment, comment).subscribe({
      next() {
        setIsSubmitting(false);
        dispatch(
          showSystemNotification({
            message: formatMessage(messages.publishSuccess)
          })
        );
        setPublishGitFormData(initialPublishGitFormData);
        setMode(null);
      },
      error({ response }) {
        setIsSubmitting(false);
        dispatch(
          showSystemNotification({
            message: response.message,
            options: { variant: 'error' }
          })
        );
      }
    });
  };

  const onSubmitBulkPublish = () => {
    const eventId = 'bulkPublishWidgetSubmit';
    const studioNote = formatMessage(messages.publishStudioNote).replace(/<\/?.*?>/g, '');
    dispatch(
      showConfirmDialog({
        body: `${formatMessage(messages.publishStudioWarning)} ${studioNote}`,
        onCancel: batchActions([closeConfirmDialog(), dispatchDOMEvent({ id: eventId, button: 'cancel' })]),
        onOk: batchActions([closeConfirmDialog(), dispatchDOMEvent({ id: eventId, button: 'ok' })])
      })
    );
    createCustomDocumentEventListener<{ button: 'ok' | 'cancel' }>(eventId, ({ button }) => {
      if (button === 'ok') {
        setIsSubmitting(true);
        const { path, environment, comment } = publishStudioFormData;
        bulkGoLive(siteId, path, environment, comment).subscribe({
          next() {
            setIsSubmitting(false);
            setPublishStudioFormData(initialPublishStudioFormData);
            setMode(null);
            dispatch(
              showSystemNotification({
                message: formatMessage(messages.bulkPublishStarted)
              })
            );
          },
          error({ response }) {
            setIsSubmitting(false);
            showSystemNotification({
              message: response.message,
              options: { variant: 'error' }
            });
          }
        });
      }
    });
  };

  const onCancel = () => {
    setMode(null);
    setDefaultPublishingTarget(publishingTargets, true);
  };

  useEffect(() => {
    if (mode === 'studio') {
      setPublishStudioFormValid(
        publishStudioFormData.path.replace(/\s/g, '') !== '' &&
          publishStudioFormData.environment !== '' &&
          (!bulkPublishCommentRequired || !isBlank(publishStudioFormData.comment))
      );
    } else {
      setPublishGitFormValid(
        publishGitFormData.commitIds.replace(/\s/g, '') !== '' &&
          publishGitFormData.environment !== '' &&
          (!publishByCommitCommentRequired || !isBlank(publishGitFormData.comment))
      );
    }
  }, [publishStudioFormData, publishGitFormData, mode, bulkPublishCommentRequired, publishByCommitCommentRequired]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode((event.target as HTMLInputElement).value as PublishOnDemandMode);
  };

  const toggleMode = (e) => {
    e.preventDefault();
    setMode(mode === 'studio' ? 'git' : 'studio');
  };

  const onSubmitForm = () => {
    if (mode === 'studio') {
      onSubmitBulkPublish();
    } else {
      onSubmitPublishBy();
    }
  };

  return (
    <Paper elevation={2}>
      <DialogHeader title={<FormattedMessage id="publishOnDemand.title" defaultMessage="Publish on Demand" />} />
      <div className={classes.content}>
        <Paper elevation={0} className={classes.modeSelector}>
          <form>
            <RadioGroup value={mode} onChange={handleChange}>
              <FormControlLabel
                disabled={isSubmitting}
                value="studio"
                control={<Radio />}
                label={
                  <ListItemText
                    primary={
                      <FormattedMessage
                        id="publishOnDemand.pathModeDescription"
                        defaultMessage="Publish changes made in Studio via the UI"
                      />
                    }
                    secondary="By path"
                  />
                }
                className={classes.byPathModeSelector}
              />
              <FormControlLabel
                disabled={isSubmitting}
                value="git"
                control={<Radio />}
                label={
                  <ListItemText
                    primary={
                      <FormattedMessage
                        id="publishOnDemand.tagsModeDescription"
                        defaultMessage="Publish changes made via direct git actions against the repository or pulled from a remote repository"
                      />
                    }
                    secondary="By tags or commit ids"
                  />
                }
              />
            </RadioGroup>
          </form>
        </Paper>
        <Collapse in={nnou(mode)} timeout={300} unmountOnExit className={classes.formContainer}>
          <PublishOnDemandForm
            disabled={isSubmitting}
            formData={mode === 'studio' ? publishStudioFormData : publishGitFormData}
            setFormData={mode === 'studio' ? setPublishStudioFormData : setPublishGitFormData}
            mode={mode}
            publishingTargets={publishingTargets}
            publishingTargetsError={publishingTargetsError}
            bulkPublishCommentRequired={bulkPublishCommentRequired}
            publishByCommitCommentRequired={publishByCommitCommentRequired}
          />
          <div className={classes.noteContainer}>
            <Typography variant="caption" className={classes.note}>
              {formatMessage(mode === 'studio' ? messages.publishStudioNote : messages.publishGitNote, {
                a: (msg) => (
                  <Link key="Link" href="#" onClick={toggleMode} className={classes.noteLink}>
                    {msg}
                  </Link>
                )
              })}
            </Typography>
          </div>
        </Collapse>
      </div>
      {mode && (
        <DialogFooter>
          <SecondaryButton onClick={onCancel} disabled={isSubmitting}>
            <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
          </SecondaryButton>
          <PrimaryButton
            loading={isSubmitting}
            disabled={!(mode === 'studio' ? publishStudioFormValid : publishGitFormValid)}
            onClick={onSubmitForm}
          >
            <FormattedMessage id="words.publish" defaultMessage="Publish" />
          </PrimaryButton>
        </DialogFooter>
      )}
    </Paper>
  );
}
