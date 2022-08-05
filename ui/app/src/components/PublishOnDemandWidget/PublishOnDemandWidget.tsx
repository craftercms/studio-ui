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
import { makeStyles } from 'tss-react/mui';
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
import { bulkGoLive, fetchPublishingTargets, publishAll, publishByCommits } from '../../services/publishing';
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
import { onSubmittingAndOrPendingChangeProps } from '../../hooks/useEnhancedDialogState';
import useUpdateRefs from '../../hooks/useUpdateRefs';

const useStyles = makeStyles()((theme) => ({
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
}));

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
  publishSuccess: {
    id: 'publishingDashboard.publishSuccess',
    defaultMessage: 'Published successfully.'
  },
  bulkPublishStarted: {
    id: 'publishingDashboard.bulkPublishStarted',
    defaultMessage: 'Bulk Publish process has been started.'
  },
  invalidForm: {
    id: 'publishingDashboard.invalidForm',
    defaultMessage: 'You cannot publish until form requirements are satisfied.'
  }
});

const initialPublishStudioFormData = {
  path: '',
  publishingTarget: '',
  comment: ''
};
const initialPublishGitFormData = {
  commitIds: '',
  publishingTarget: '',
  comment: ''
};

const initialPublishEverythingFormData = {
  publishingTarget: '',
  comment: ''
};

interface PublishOnDemandWidgetProps {
  siteId: string;
  onSubmittingAndOrPendingChange?(value: onSubmittingAndOrPendingChangeProps): void;
}

export function PublishOnDemandWidget(props: PublishOnDemandWidgetProps) {
  const { siteId, onSubmittingAndOrPendingChange } = props;
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [mode, setMode] = useState<PublishOnDemandMode>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialPublishingTarget, setInitialPublishingTarget] = useState(null);
  const [publishingTargets, setPublishingTargets] = useState(null);
  const [publishingTargetsError, setPublishingTargetsError] = useState(null);
  const { bulkPublishCommentRequired, publishByCommitCommentRequired, publishEverythingCommentRequired } = useSelection(
    (state) => state.uiConfig.publishing
  );
  const [publishGitFormData, setPublishGitFormData] = useSpreadState<PublishFormData>(initialPublishGitFormData);
  const publishGitFormValid =
    !isBlank(publishGitFormData.publishingTarget) &&
    (!publishByCommitCommentRequired || !isBlank(publishGitFormData.comment)) &&
    publishGitFormData.commitIds.replace(/\s/g, '') !== '';
  const [publishStudioFormData, setPublishStudioFormData] =
    useSpreadState<PublishFormData>(initialPublishStudioFormData);
  const publishStudioFormValid =
    !isBlank(publishStudioFormData.publishingTarget) &&
    (!bulkPublishCommentRequired || !isBlank(publishStudioFormData.comment)) &&
    publishStudioFormData.path.replace(/\s/g, '') !== '';
  const [publishEverythingFormData, setPublishEverythingFormData] = useSpreadState<PublishFormData>(
    initialPublishEverythingFormData
  );
  const publishEverythingFormValid =
    publishEverythingFormData.publishingTarget !== '' &&
    (!publishEverythingCommentRequired || !isBlank(publishEverythingFormData.comment));
  const fnRefs = useUpdateRefs({ onSubmittingAndOrPendingChange });
  const currentFormData =
    mode === 'studio' ? publishStudioFormData : mode === 'git' ? publishGitFormData : publishEverythingFormData;
  const currentSetFormData =
    mode === 'studio'
      ? setPublishStudioFormData
      : mode === 'git'
      ? setPublishGitFormData
      : setPublishEverythingFormData;
  const currentFormValid =
    mode === 'studio' ? publishStudioFormValid : mode === 'git' ? publishGitFormValid : publishEverythingFormValid;
  const hasChanges =
    mode === 'studio'
      ? publishStudioFormData.path !== initialPublishStudioFormData.path ||
        publishStudioFormData.comment !== initialPublishStudioFormData.comment ||
        publishStudioFormData.publishingTarget !== initialPublishingTarget
      : mode === 'git'
      ? publishGitFormData.commitIds !== initialPublishGitFormData.commitIds ||
        publishGitFormData.comment !== initialPublishGitFormData.comment ||
        publishGitFormData.publishingTarget !== initialPublishingTarget
      : publishEverythingFormData.comment !== initialPublishEverythingFormData.comment ||
        publishEverythingFormData.publishingTarget !== initialPublishingTarget;

  const setDefaultPublishingTarget = (targets, clearData?) => {
    if (targets.length) {
      const stagingEnv = targets.find((target) => target.name === 'staging');
      const publishingTarget = stagingEnv?.name ?? targets[0].name;
      setInitialPublishingTarget(publishingTarget);
      setPublishGitFormData({
        ...(clearData && initialPublishGitFormData),
        publishingTarget
      });
      setPublishStudioFormData({
        ...(clearData && initialPublishStudioFormData),
        publishingTarget
      });
      setPublishEverythingFormData({
        ...(clearData && initialPublishEverythingFormData),
        publishingTarget
      });
    }
  };

  useEffect(() => {
    fnRefs.current.onSubmittingAndOrPendingChange?.({
      hasPendingChanges: hasChanges,
      isSubmitting
    });
  }, [isSubmitting, hasChanges, fnRefs]);

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
    const { commitIds, publishingTarget, comment } = publishGitFormData;
    const ids = commitIds.replace(/\s/g, '').split(',');
    publishByCommits(siteId, ids, publishingTarget, comment).subscribe({
      next() {
        setIsSubmitting(false);
        dispatch(
          showSystemNotification({
            message: formatMessage(messages.publishSuccess)
          })
        );
        setPublishGitFormData({ ...initialPublishGitFormData, publishingTarget });
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
        const { path, publishingTarget, comment } = publishStudioFormData;
        bulkGoLive(siteId, path, publishingTarget, comment).subscribe({
          next() {
            setIsSubmitting(false);
            setPublishStudioFormData({ ...initialPublishStudioFormData, publishingTarget });
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

  const onSubmitPublishEverything = () => {
    setIsSubmitting(true);
    const { publishingTarget, comment } = publishEverythingFormData;
    publishAll(siteId, publishingTarget, comment).subscribe({
      next() {
        setIsSubmitting(false);
        dispatch(
          showSystemNotification({
            message: formatMessage(messages.publishSuccess)
          })
        );
        setPublishEverythingFormData({ ...initialPublishEverythingFormData, publishingTarget });
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

  const onCancel = () => {
    setMode(null);
    setDefaultPublishingTarget(publishingTargets, true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode((event.target as HTMLInputElement).value as PublishOnDemandMode);
  };

  const toggleMode = (e) => {
    e.preventDefault();
    setMode(mode === 'studio' ? 'git' : 'studio');
  };

  const onSubmitForm = () => {
    if (currentFormValid) {
      switch (mode) {
        case 'studio':
          onSubmitBulkPublish();
          break;
        case 'git':
          onSubmitPublishBy();
          break;
        case 'all':
          onSubmitPublishEverything();
          break;
      }
    } else {
      dispatch(
        showSystemNotification({
          message: formatMessage(messages.invalidForm)
        })
      );
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
              <FormControlLabel
                disabled={isSubmitting}
                value="all"
                control={<Radio />}
                label={
                  <ListItemText
                    primary={
                      <FormattedMessage
                        id="publishOnDemand.publishAllDescription"
                        defaultMessage="Publish everything"
                      />
                    }
                    secondary="Publish all changes on the repo to the publishing target you choose"
                  />
                }
              />
            </RadioGroup>
          </form>
        </Paper>
        <Collapse in={nnou(mode)} timeout={300} unmountOnExit className={classes.formContainer}>
          <PublishOnDemandForm
            disabled={isSubmitting}
            formData={currentFormData}
            setFormData={currentSetFormData}
            mode={mode}
            publishingTargets={publishingTargets}
            publishingTargetsError={publishingTargetsError}
            bulkPublishCommentRequired={bulkPublishCommentRequired}
            publishByCommitCommentRequired={publishByCommitCommentRequired}
          />
          {mode !== 'all' && (
            <div className={classes.noteContainer}>
              <Typography variant="caption" className={classes.note}>
                {mode === 'studio' ? (
                  <FormattedMessage
                    id="publishingDashboard.studioNote"
                    defaultMessage="Publishing by path should be used to publish changes made in Studio via the UI. For changes made via direct git actions, please <a>publish by commit or tag</a>."
                    values={{
                      a: (msg) => (
                        <Link key="Link" href="#" onClick={toggleMode} className={classes.noteLink}>
                          {msg}
                        </Link>
                      )
                    }}
                  />
                ) : (
                  <FormattedMessage
                    id="publishingDashboard.gitNote"
                    defaultMessage="Publishing by commit or tag must be used for changes made via direct git actions against the repository or pulled from a remote repository. For changes made via Studio on the UI, use please <a>publish by path</a>."
                    values={{
                      a: (msg) => (
                        <Link key="Link" href="#" onClick={toggleMode} className={classes.noteLink}>
                          {msg}
                        </Link>
                      )
                    }}
                  />
                )}
              </Typography>
            </div>
          )}
        </Collapse>
      </div>
      {mode && (
        <DialogFooter>
          <SecondaryButton onClick={onCancel} disabled={isSubmitting}>
            <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
          </SecondaryButton>
          <PrimaryButton loading={isSubmitting} disabled={!currentFormValid} onClick={onSubmitForm}>
            <FormattedMessage id="words.publish" defaultMessage="Publish" />
          </PrimaryButton>
        </DialogFooter>
      )}
    </Paper>
  );
}

export default PublishOnDemandWidget;
