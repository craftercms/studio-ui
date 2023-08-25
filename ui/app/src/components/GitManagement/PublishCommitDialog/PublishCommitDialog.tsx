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

import React, { useEffect } from 'react';
import DialogBody from '../../DialogBody/DialogBody';
import { EnhancedDialog, EnhancedDialogProps } from '../../EnhancedDialog';
import PublishOnDemandForm from '../../PublishOnDemandForm';
import SecondaryButton from '../../SecondaryButton';
import { FormattedMessage } from 'react-intl';
import PrimaryButton from '../../PrimaryButton';
import DialogFooter from '../../DialogFooter';
import { PublishFormData, PublishingTarget } from '../../../models';
import { fetchPublishingTargets, publishByCommits } from '../../../services/publishing';
import useSpreadState from '../../../hooks/useSpreadState';
import useSelection from '../../../hooks/useSelection';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import { showSystemNotification } from '../../../state/actions/system';
import { useDispatch } from 'react-redux';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { isBlank } from '../../../utils/string';

export interface PublishCommitDialogProps extends EnhancedDialogProps {
  commitId: string;
}

interface PublishCommitDialogState extends PublishFormData {
  isSubmitting: boolean;
  publishSuccessful: boolean;
  loadingPublishingTargets: boolean;
  publishingTargets: PublishingTarget[];
}

export function PublishCommitDialog(props: PublishCommitDialogProps) {
  const { commitId, ...dialogProps } = props;
  const site = useActiveSiteId();
  const dispatch = useDispatch();
  const initialState = {
    publishSuccessful: false,
    loadingPublishingTargets: false,
    isSubmitting: false,
    publishingTargets: null,
    path: '',
    commitIds: '',
    comment: '',
    publishingTarget: ''
  };
  const [state, setState] = useSpreadState<PublishCommitDialogState>(initialState);
  const { loadingPublishingTargets, isSubmitting, publishingTargets, publishSuccessful, ...data } = state;
  const { publishByCommitCommentRequired } = useSelection((state) => state.uiConfig.publishing);
  const isInvalid = (publishByCommitCommentRequired && isBlank(data.comment)) || isBlank(data.commitIds);
  const open = Boolean(dialogProps?.open);
  const onCancel = (e) => dialogProps.onClose(e, null);
  const onPublish = () => {
    if (!isInvalid) {
      setState({ isSubmitting: true });
      publishByCommits(
        site,
        data.commitIds.replace(/\s/g, '').split(',').filter(Boolean),
        data.publishingTarget,
        data.comment
      ).subscribe({
        next() {
          setState({ isSubmitting: false, publishSuccessful: true });
        },
        error({ response }) {
          setState({ isSubmitting: false });
          dispatch(
            showSystemNotification({
              message: response.message,
              options: { variant: 'error' }
            })
          );
        }
      });
    }
  };
  useEffect(() => {
    if (open) {
      setState({ loadingPublishingTargets: true });
      const sub = fetchPublishingTargets(site).subscribe({
        next({ publishingTargets }) {
          const newData: Partial<PublishCommitDialogState> = { publishingTargets, loadingPublishingTargets: false };
          // Set pre-selected publishing target.
          if (publishingTargets.length > 0) {
            const stagingEnv = publishingTargets.find((target) => target.name === 'staging');
            newData.publishingTarget = stagingEnv?.name ?? publishingTargets[0].name;
          }
          setState(newData);
        }
      });

      return () => {
        sub.unsubscribe();
      };
    }
  }, [setState, site, open]);
  useEffect(() => {
    setState({ commitIds: commitId });
  }, [commitId, setState]);
  return (
    <EnhancedDialog
      {...dialogProps}
      onClosed={() => {
        setState({ ...initialState, publishingTarget: state.publishingTarget, publishingTargets: publishingTargets });
      }}
      isSubmitting={isSubmitting}
      title={<FormattedMessage id="publishCommitDialog.title" defaultMessage="Publish Commit" />}
    >
      {publishSuccessful ? (
        <>
          <DialogBody>
            <Box display="flex" flexDirection="column" alignItems="center" margin={2}>
              <CheckCircleOutlineRoundedIcon sx={{ mb: 1, color: 'success.main', width: 50, height: 50 }} />
              <Typography>
                <FormattedMessage
                  id="publishCommitDialog.successMessage"
                  defaultMessage="Publish completed successfully"
                />
              </Typography>
            </Box>
          </DialogBody>
          <DialogFooter>
            <SecondaryButton onClick={onCancel}>
              <FormattedMessage id="words.done" defaultMessage="Done" />
            </SecondaryButton>
          </DialogFooter>
        </>
      ) : (
        <>
          <DialogBody>
            <PublishOnDemandForm
              mode="git"
              formData={data}
              setFormData={(newData) => setState(newData)}
              publishingTargets={state.publishingTargets}
              publishingTargetsError={null}
              bulkPublishCommentRequired={false}
              publishByCommitCommentRequired={publishByCommitCommentRequired}
              disabled={!state.publishingTargets || isSubmitting}
            />
          </DialogBody>
          <DialogFooter>
            <SecondaryButton onClick={onCancel} disabled={isSubmitting}>
              <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
            </SecondaryButton>
            <PrimaryButton onClick={onPublish} disabled={isSubmitting || loadingPublishingTargets || isInvalid}>
              <FormattedMessage id="words.publish" defaultMessage="Publish" />
            </PrimaryButton>
          </DialogFooter>
        </>
      )}
    </EnhancedDialog>
  );
}

export default PublishCommitDialog;
