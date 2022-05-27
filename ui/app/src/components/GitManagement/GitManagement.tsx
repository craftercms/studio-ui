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

import React, { useCallback, useEffect, useState } from 'react';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage, useIntl } from 'react-intl';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import { Repository, RepositoryStatus } from '../../models/Repository';
import ApiResponse from '../../models/ApiResponse';
import { fetchRepositories as fetchRepositoriesService, fetchStatus } from '../../services/repositories';
import RepoGrid from './RepoGrid';
import RepoStatus from './RepoStatus/RepoStatus';
import NewRemoteRepositoryDialog from '../NewRemoteRepositoryDialog';
import { showSystemNotification } from '../../state/actions/system';
import { useDispatch } from 'react-redux';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import useStyles from './styles';
import translations from './translations';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import Paper from '@mui/material/Paper';
import { useEnhancedDialogState } from '../../hooks/useEnhancedDialogState';
import { useWithPendingChangesCloseRequest } from '../../hooks/useWithPendingChangesCloseRequest';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import WarningRounded from '@mui/icons-material/WarningRounded';
import useSpreadState from '../../hooks/useSpreadState';
import { UNDEFINED } from '../../utils/constants';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import Tooltip from '@mui/material/Tooltip';
import { fetchSite } from '../../services/sites';

export interface GitManagementProps {
  embedded?: boolean;
  showAppsButton?: boolean;
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `gitReposTabpanel_${index}`
  };
}

// TODO:
//  - Accommodate area to display repo fetch errors
//  - Accommodate area to display status fetch errors
//  - Use/discard `loading` props
export function GitManagement(props: GitManagementProps) {
  const { embedded, showAppsButton = !embedded } = props;
  const classes = useStyles();
  const siteId = useActiveSiteId();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [activeTab, setActiveTab] = useState(0);
  const [sandboxBranch, setSandboxBranch] = useState('');

  const [{ repositories }, setRepoState] = useSpreadState({
    repositories: null as Array<Repository>,
    loadingRepos: false,
    reposFetchError: null as ApiResponse
  });

  const [{ loadingStatus, repoStatus, clean, hasConflicts, hasUncommitted, statusMessageKey }, setRepoStatusState] =
    useSpreadState({
      clean: true,
      loadingStatus: false,
      hasConflicts: false,
      hasUncommitted: false,
      statusFetchError: null as ApiResponse,
      repoStatus: null as RepositoryStatus,
      statusMessageKey: null as string
    });

  const fetchRepositories = useCallback(() => {
    setRepoState({ loadingRepos: true, reposFetchError: null });
    fetchRepositoriesService(siteId).subscribe({
      next: (repositories) => {
        setRepoState({ repositories, loadingRepos: false });
      },
      error: ({ response }) => {
        setRepoState({ loadingRepos: false, reposFetchError: response });
      }
    });
  }, [setRepoState, siteId]);

  const fetchRepoStatusReceiver = useCallback(
    (repoStatus: RepositoryStatus) => {
      let statusMessageKey = null;
      if (repoStatus.clean) {
        statusMessageKey = 'noConflicts';
      } else if (repoStatus.conflicting.length > 0) {
        statusMessageKey = 'conflictsExist';
      } else if (repoStatus.uncommittedChanges.length > 0 && repoStatus.conflicting.length < 1) {
        statusMessageKey = 'pendingCommit';
      } else if (repoStatus.uncommittedChanges.length < 1 && repoStatus.conflicting.length < 1) {
        statusMessageKey = 'unstagedFiles';
      }
      setRepoStatusState({
        loadingStatus: false,
        repoStatus,
        statusMessageKey,
        clean: repoStatus.clean,
        hasConflicts: Boolean(repoStatus.conflicting.length),
        hasUncommitted: Boolean(repoStatus.uncommittedChanges.length)
      });
    },
    [setRepoStatusState]
  );
  const fetchRepoStatus = useCallback(() => {
    setRepoStatusState({ loadingStatus: true, statusFetchError: null });
    fetchStatus(siteId).subscribe({
      next: fetchRepoStatusReceiver,
      error(response) {
        setRepoStatusState({ loadingStatus: false, statusFetchError: response });
        dispatch(
          showSystemNotification({
            message: response.response.message,
            options: { variant: 'error' }
          })
        );
      }
    });
  }, [dispatch, fetchRepoStatusReceiver, setRepoStatusState, siteId]);

  const onRepoCreatedSuccess = () => {
    fetchRepositories();
    newRemoteRepositoryDialogState.onClose();
    dispatch(
      showSystemNotification({
        message: formatMessage(translations.remoteCreateSuccessMessage)
      })
    );
  };

  const onRepoCreateError = ({ response }) => {
    dispatch(
      showSystemNotification({
        message: response.response.message,
        options: { variant: 'error' }
      })
    );
  };

  const onTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  useEffect(() => {
    fetchRepoStatus();
  }, [fetchRepoStatus]);

  useEffect(() => {
    fetchSite(siteId).subscribe({
      next: ({ sandboxBranch }) => {
        setSandboxBranch(sandboxBranch);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }, [siteId]);

  const newRemoteRepositoryDialogState = useEnhancedDialogState();
  const newRemoteRepositoryDialogStatePendingChangesCloseRequest = useWithPendingChangesCloseRequest(
    newRemoteRepositoryDialogState.onClose
  );

  return (
    <Paper elevation={0}>
      <GlobalAppToolbar
        title={!embedded && <FormattedMessage id="words.git" defaultMessage="Git" />}
        leftContent={
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            color="primary"
            onClick={() => newRemoteRepositoryDialogState.onOpen()}
          >
            <FormattedMessage id="repositories.newRepository" defaultMessage="New Remote" />
          </Button>
        }
        rightContent={
          <Tooltip title={<FormattedMessage id="words.refresh" defaultMessage="Refresh" />}>
            <IconButton
              onClick={() => {
                fetchRepositories();
                fetchRepoStatus();
              }}
            >
              <RefreshRounded />
            </IconButton>
          </Tooltip>
        }
        showHamburgerMenuButton={!embedded}
        showAppsButton={showAppsButton}
      />
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={onTabChange}>
          <Tab
            label={<FormattedMessage id="remoteRepositories.title" defaultMessage="Remote Repositories" />}
            {...a11yProps(0)}
          />
          <Tab
            sx={{
              flexDirection: 'row',
              color: hasConflicts ? 'error.main' : hasUncommitted ? 'warning.main' : UNDEFINED
            }}
            label={
              <>
                <FormattedMessage id="repository.repositoryStatusLabel" defaultMessage="Repository Status" />
                {(hasConflicts || hasUncommitted) && (
                  <WarningRounded sx={{ ml: 1 }} color={hasConflicts ? 'error' : 'warning'} />
                )}
              </>
            }
            {...a11yProps(1)}
          />
        </Tabs>
      </Box>
      <section>
        {activeTab === 0 && (
          <Box padding={2}>
            <Alert severity={loadingStatus ? 'info' : clean ? 'success' : 'warning'}>
              {formatMessage(translations[loadingStatus ? 'fetchingStatus' : statusMessageKey ?? 'fetchingStatus'])}
            </Alert>
            <RepoGrid
              sandboxBranch={sandboxBranch}
              repositories={repositories}
              fetchStatus={fetchRepoStatus}
              fetchRepositories={fetchRepositories}
              disableActions={!repoStatus || repoStatus.conflicting.length > 0}
            />
            <Typography variant="caption" className={classes.statusNote}>
              <FormattedMessage
                id="repository.statusNote"
                defaultMessage="Do not use Studio as a git merge and conflict resolution platform. All merge conflicts should be resolved upstream before getting pulled into Studio."
              />
            </Typography>
          </Box>
        )}
        {activeTab === 1 && (
          <RepoStatus
            status={repoStatus}
            onCommitSuccess={fetchRepoStatusReceiver}
            onConflictResolved={fetchRepoStatusReceiver}
            onFailedPullCancelled={fetchRepoStatusReceiver}
          />
        )}
        <NewRemoteRepositoryDialog
          open={newRemoteRepositoryDialogState.open}
          isMinimized={newRemoteRepositoryDialogState.isMinimized}
          isSubmitting={newRemoteRepositoryDialogState.isSubmitting}
          hasPendingChanges={newRemoteRepositoryDialogState.hasPendingChanges}
          onSubmittingAndOrPendingChange={newRemoteRepositoryDialogState.onSubmittingAndOrPendingChange}
          onWithPendingChangesCloseRequest={newRemoteRepositoryDialogStatePendingChangesCloseRequest}
          onClose={newRemoteRepositoryDialogState.onClose}
          onCreateSuccess={onRepoCreatedSuccess}
          onCreateError={onRepoCreateError}
        />
      </section>
    </Paper>
  );
}

export default GitManagement;
