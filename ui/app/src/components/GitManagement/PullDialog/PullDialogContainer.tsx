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
import DialogBody from '../../DialogBody/DialogBody';
import DialogFooter from '../../DialogFooter/DialogFooter';
import { FormattedMessage } from 'react-intl';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { makeStyles } from 'tss-react/mui';
import { pull } from '../../../services/repositories';
import SecondaryButton from '../../SecondaryButton';
import PrimaryButton from '../../PrimaryButton';
import { isBlank } from '../../../utils/string';
import { PullFromRemoteDialogContainerProps } from './utils';
import {
  getStoredPullMergeStrategy,
  removeStoredPullMergeStrategy,
  setStoredPullMergeStrategy
} from '../../../utils/state';
import useActiveSite from '../../../hooks/useActiveSite';
import useActiveUser from '../../../hooks/useActiveUser';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { fetchLegacySite } from '../../../services/sites';
import useSpreadState from '../../../hooks/useSpreadState';
import Skeleton from '@mui/material/Skeleton';
import useSelection from '../../../hooks/useSelection';

const useStyles = makeStyles()((theme) => ({
  formControl: {
    marginBottom: '15px'
  },
  pullBranchLabel: {
    padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4,
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center'
  },
  pullBranchLabelWithError: {
    justifyContent: 'space-between'
  },
  pullBranchLabelHeading: {
    display: 'inline-block',
    fontWeight: theme.typography.fontWeightMedium,
    marginRight: theme.spacing(1)
  },
  pullBranchLabelError: {
    color: theme.palette.error.main
  },
  pullInfo: {
    alignItems: 'center',
    marginTop: theme.spacing(2)
  }
}));

export function PullDialogContainer(props: PullFromRemoteDialogContainerProps) {
  // region const { ... } = props
  const {
    remoteName,
    mergeStrategies,
    onClose,
    onPullSuccess,
    onPullError,
    onPullStart,
    disabled = false,
    isSubmitting = false
  } = props;
  // endregion
  const [selectedMergeStrategy, setSelectedMergeStrategy] = useState('');
  const { classes, cx } = useStyles();
  const { uuid, id: siteId } = useActiveSite();
  const { username } = useActiveUser();
  const remoteGitBranch = useSelection((state) => state.uiConfig.remoteGitBranch);
  const [sandboxState, setSandboxState] = useSpreadState({
    branch: remoteGitBranch,
    error: null,
    loading: false
  });

  const onMergeStrategyChange = (e: any) => {
    setSelectedMergeStrategy(e.target.value);
  };

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!isBlank(sandboxState.branch)) {
      onPullStart?.();
      pull({
        siteId,
        remoteName,
        remoteBranch: sandboxState.branch,
        mergeStrategy: selectedMergeStrategy
      }).subscribe({
        next(result) {
          onPullSuccess?.(result);
        },
        error(response) {
          onPullError?.(response?.response?.response);
        }
      });
    }
  };

  const fetchSandboxBranch = useCallback(() => {
    setSandboxState({ loading: true, error: null });
    fetchLegacySite(siteId).subscribe({
      next: ({ sandboxBranch }) => {
        setSandboxState({
          branch: sandboxBranch,
          error: null,
          loading: false
        });
      },
      error: (error) => {
        setSandboxState({
          error: error,
          loading: false
        });
      }
    });
  }, [siteId, setSandboxState]);

  useEffect(() => {
    if (!selectedMergeStrategy && mergeStrategies?.length) {
      const storedPullMergeStrategy = getStoredPullMergeStrategy(uuid, username);
      if (storedPullMergeStrategy) {
        let strategy = mergeStrategies.find((ms) => ms.key === storedPullMergeStrategy);
        if (strategy) {
          setSelectedMergeStrategy(storedPullMergeStrategy);
        } else {
          removeStoredPullMergeStrategy(uuid, username);
        }
      } else {
        setSelectedMergeStrategy(mergeStrategies[0].key);
      }
    }
  }, [mergeStrategies, selectedMergeStrategy, uuid, username]);

  useEffect(() => {
    if (selectedMergeStrategy) {
      setStoredPullMergeStrategy(uuid, username, selectedMergeStrategy);
    }
  }, [selectedMergeStrategy, uuid, username]);

  useEffect(() => {
    if (remoteGitBranch === null) fetchSandboxBranch();
    else setSandboxState({ branch: remoteGitBranch });
  }, [fetchSandboxBranch, remoteGitBranch, setSandboxState]);

  return (
    <form onSubmit={onSubmit}>
      <DialogBody>
        <Box
          className={cx(
            classes.pullBranchLabel,
            classes.formControl,
            sandboxState.error && classes.pullBranchLabelWithError
          )}
        >
          {sandboxState.error ? (
            <>
              <Typography className={classes.pullBranchLabelError}>
                <FormattedMessage
                  id="repositories.sandboxBranchRetrievalError"
                  defaultMessage="Unable to retrieve project’s branch"
                />
              </Typography>
              <Button onClick={fetchSandboxBranch} size="small">
                <FormattedMessage id="words.retry" defaultMessage="Retry" />
              </Button>
            </>
          ) : (
            <>
              <Typography color="textSecondary" className={classes.pullBranchLabelHeading}>
                <FormattedMessage id="words.branch" defaultMessage="Branch" />
              </Typography>
              {sandboxState.loading ? (
                <Skeleton variant="text" width="30%" animation="wave" sx={{ display: 'inline-flex' }} />
              ) : (
                sandboxState.branch
              )}
            </>
          )}
        </Box>
        <FormControl variant="outlined" fullWidth disabled={disabled || isSubmitting}>
          <InputLabel id="mergeStrategyLabel">
            <FormattedMessage id="repositories.mergeStrategyLabel" defaultMessage="Merge Strategy" />
          </InputLabel>
          <Select
            labelId="mergeStrategyLabel"
            name="mergeStrategy"
            value={selectedMergeStrategy}
            onChange={onMergeStrategyChange}
            label={<FormattedMessage id="repositories.mergeStrategyLabel" defaultMessage="Merge Strategy" />}
            fullWidth
          >
            {mergeStrategies.map((strategy) => (
              <MenuItem key={strategy.key} value={strategy.key}>
                {strategy.value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Alert severity="info" variant="outlined" className={classes.pullInfo}>
          <Typography>
            <FormattedMessage
              id="repositories.pullFromCreatedBranchOnlyHint"
              defaultMessage="You may only pull from the branch the site was created from; any feature branch work should be merged upstream."
            />
          </Typography>
        </Alert>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onCloseButtonClick} disabled={disabled || isSubmitting}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={disabled || isBlank(sandboxState.branch)} loading={isSubmitting}>
          <FormattedMessage id="words.pull" defaultMessage="Pull" />
        </PrimaryButton>
      </DialogFooter>
    </form>
  );
}

export default PullDialogContainer;
