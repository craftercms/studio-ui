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

import React, { ReactNode } from 'react';
import { useEffect, useId, useState } from 'react';
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
import { nnou, nou } from '../../utils/object';
import Typography from '@mui/material/Typography';
import { bulkGoLive, fetchPublishingTargets, publishAll, publishByCommits } from '../../services/publishing';
import { showSystemNotification } from '../../state/actions/system';
import { useDispatch } from 'react-redux';
import {
  closeConfirmDialog,
  closePublishDialog,
  showConfirmDialog,
  showPublishDialog
} from '../../state/actions/dialogs';
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
import { hasInitialPublish as hasInitialPublishService } from '../../services/sites';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Box from '@mui/material/Box';
import useDetailedItem from '../../hooks/useDetailedItem';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import usePermissionsBySite from '../../hooks/usePermissionsBySite';
import { StandardAction } from '../../models';

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
  },
  initialPublishContainer: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    rowGap: theme.spacing(2),
    padding: theme.spacing(5)
  },
  initialPublishDescription: {
    maxWidth: '470px',
    textAlign: 'center'
  },
  initialPublishIcon: {
    color: theme.palette.text.secondary,
    fontSize: '1.75rem'
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
  mode?: 'everything' | 'studio' | 'git';
  showHeader?: boolean;
  onSubmittingAndOrPendingChange?(value: onSubmittingAndOrPendingChangeProps): void;
  onCancel?: StandardAction;
  onSuccess?: StandardAction;
}

export function PublishOnDemandWidget(props: PublishOnDemandWidgetProps) {
  const {
    siteId,
    onSubmittingAndOrPendingChange,
    mode,
    showHeader = true,
    onCancel: onCancelProp,
    onSuccess: onSuccessProp
  } = props;
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [selectedMode, setSelectedMode] = useState<PublishOnDemandMode>(mode ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const permissionsBySite = usePermissionsBySite();
  const hasPublishPermission = permissionsBySite[siteId]?.includes('publish');
  const [hasInitialPublish, setHasInitialPublish] = useState(false);
  const initialPublishItem = useDetailedItem('/site/website/index.xml');
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
  // region currentFormData
  const currentFormData =
    selectedMode === 'studio'
      ? publishStudioFormData
      : selectedMode === 'git'
      ? publishGitFormData
      : publishEverythingFormData;
  // endregion
  // region currentSetFormData
  const currentSetFormData =
    selectedMode === 'studio'
      ? setPublishStudioFormData
      : selectedMode === 'git'
      ? setPublishGitFormData
      : setPublishEverythingFormData;
  // endregion
  // region currentFormValid
  const currentFormValid =
    selectedMode === 'studio'
      ? publishStudioFormValid
      : selectedMode === 'git'
      ? publishGitFormValid
      : publishEverythingFormValid;
  // endregion
  // region hasChanges
  const hasChanges =
    selectedMode === 'studio'
      ? publishStudioFormData.path !== initialPublishStudioFormData.path ||
        publishStudioFormData.comment !== initialPublishStudioFormData.comment ||
        publishStudioFormData.publishingTarget !== initialPublishingTarget
      : selectedMode === 'git'
      ? publishGitFormData.commitIds !== initialPublishGitFormData.commitIds ||
        publishGitFormData.comment !== initialPublishGitFormData.comment ||
        publishGitFormData.publishingTarget !== initialPublishingTarget
      : publishEverythingFormData.comment !== initialPublishEverythingFormData.comment ||
        publishEverythingFormData.publishingTarget !== initialPublishingTarget;
  // endregion
  const bottomElId = useId();

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
    hasInitialPublishService(siteId).subscribe({
      next(response) {
        setHasInitialPublish(response);
      },
      error(error) {
        dispatch(showErrorDialog(error));
      }
    });
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
        nou(mode) && setSelectedMode(null);

        if (onSuccessProp) {
          dispatch(onSuccessProp);
        }
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
    const studioNote = formatMessage(messages.publishStudioNote, { a: (msg) => msg[0] });
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
            nou(mode) && setSelectedMode(null);
            dispatch(
              showSystemNotification({
                message: formatMessage(messages.bulkPublishStarted)
              })
            );
            if (onSuccessProp) {
              dispatch(onSuccessProp);
            }
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
        nou(mode) && setSelectedMode(null);
        if (onSuccessProp) {
          dispatch(onSuccessProp);
        }
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
    nou(mode) && setSelectedMode(null);
    setDefaultPublishingTarget(publishingTargets, true);
    if (onCancelProp) {
      dispatch(onCancelProp);
    }
  };

  const scrollToBottom = () => document.getElementById(bottomElId).scrollIntoView({ behavior: 'smooth', block: 'end' });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = (event.target as HTMLInputElement).value as PublishOnDemandMode;
    setSelectedMode(newMode);
    setTimeout(scrollToBottom);
  };

  const toggleMode = (e) => {
    e.preventDefault();
    setSelectedMode(selectedMode === 'studio' ? 'git' : 'studio');
  };

  const onSubmitForm = () => {
    if (currentFormValid) {
      switch (selectedMode) {
        case 'studio':
          onSubmitBulkPublish();
          break;
        case 'git':
          onSubmitPublishBy();
          break;
        case 'everything':
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

  const customEventId = 'dialogDismissConfirm';
  const onInitialPublish = () => {
    dispatch(
      showPublishDialog({
        items: [initialPublishItem],
        onSuccess: batchActions([closePublishDialog(), dispatchDOMEvent({ id: customEventId, type: 'publish' })]),
        onClosed: dispatchDOMEvent({ id: customEventId, type: 'cancel' })
      })
    );

    createCustomDocumentEventListener(customEventId, ({ type }) => {
      type === 'publish' && setHasInitialPublish(true);
    });
  };

  return (
    <Paper elevation={2}>
      {showHeader && (
        <DialogHeader title={<FormattedMessage id="publishOnDemand.title" defaultMessage="Publish on Demand" />} />
      )}
      <div className={classes.content}>
        {hasInitialPublish ? (
          <>
            <Paper elevation={0} className={classes.modeSelector}>
              <form>
                <RadioGroup value={selectedMode ?? ''} onChange={handleChange}>
                  {(nou(mode) || mode === 'studio') && (
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
                  )}
                  {(nou(mode) || mode === 'git') && (
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
                  )}
                  {(nou(mode) || mode === 'everything') && (
                    <FormControlLabel
                      disabled={isSubmitting}
                      value="everything"
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
                  )}
                </RadioGroup>
              </form>
            </Paper>
            <Collapse
              in={nnou(selectedMode)}
              timeout={300}
              unmountOnExit
              className={classes.formContainer}
              onEntered={scrollToBottom}
            >
              <PublishOnDemandForm
                disabled={isSubmitting}
                formData={currentFormData}
                setFormData={currentSetFormData}
                mode={selectedMode}
                publishingTargets={publishingTargets}
                publishingTargetsError={publishingTargetsError}
                bulkPublishCommentRequired={bulkPublishCommentRequired}
                publishByCommitCommentRequired={publishByCommitCommentRequired}
              />
              {selectedMode !== 'everything' && (
                <div className={classes.noteContainer}>
                  <Typography variant="caption" className={classes.note}>
                    {selectedMode === 'studio' ? (
                      <FormattedMessage
                        id="publishingDashboard.studioNote"
                        defaultMessage="Publishing by path should be used to publish changes made in Studio via the UI. For changes made via direct git actions, please <a>publish by commit or tag</a>."
                        values={{
                          a: (msg: ReactNode[]) => (
                            <Link key="Link" href="#" onClick={toggleMode} className={classes.noteLink}>
                              {msg[0]}
                            </Link>
                          )
                        }}
                      />
                    ) : (
                      <FormattedMessage
                        id="publishingDashboard.gitNote"
                        defaultMessage="Publishing by commit or tag must be used for changes made via direct git actions against the repository or pulled from a remote repository. For changes made via Studio on the UI, use please <a>publish by path</a>."
                        values={{
                          a: (msg: ReactNode[]) => (
                            <Link key="Link" href="#" onClick={toggleMode} className={classes.noteLink}>
                              {msg[0]}
                            </Link>
                          )
                        }}
                      />
                    )}
                  </Typography>
                </div>
              )}
            </Collapse>
          </>
        ) : (
          <Box className={classes.initialPublishContainer}>
            <InfoOutlinedIcon className={classes.initialPublishIcon} />
            <Typography variant="body1" className={classes.initialPublishDescription}>
              <FormattedMessage
                id="publishOnDemand.noInitialPublish"
                defaultMessage="The project needs to undergo its initial publish before other publishing options become available"
              />
            </Typography>
            {hasPublishPermission && (
              <PrimaryButton onClick={onInitialPublish}>
                <FormattedMessage id="publishOnDemand.publishEntireProject" defaultMessage="Publish Entire Project" />
              </PrimaryButton>
            )}
          </Box>
        )}
      </div>
      {selectedMode && (
        <DialogFooter>
          <SecondaryButton onClick={onCancel} disabled={isSubmitting}>
            <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
          </SecondaryButton>
          <PrimaryButton loading={isSubmitting} disabled={!currentFormValid} onClick={onSubmitForm}>
            <FormattedMessage id="words.publish" defaultMessage="Publish" />
          </PrimaryButton>
        </DialogFooter>
      )}
      <div id={bottomElId} />
    </Paper>
  );
}

export default PublishOnDemandWidget;
