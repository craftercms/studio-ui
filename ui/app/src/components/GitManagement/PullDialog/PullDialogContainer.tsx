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
import FormLabel from '@mui/material/FormLabel';
import { Typography } from '@mui/material';
import Link from '@mui/material/Link';
import ApiResponse from '../../../models/ApiResponse';
import { fetchSite } from '../../../services/sites';

const useStyles = makeStyles()((theme) => ({
  formControl: {
    marginBottom: '15px'
  },
  pullBranchLabel: {
    padding: '14px 16px',
    border: `1px solid ${theme.palette.grey['400']}`,
    borderRadius: 4,
    color: theme.palette.text.primary
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

  const [selectedMergeStrategy, setSelectedMergeStrategy] = useState('');
  const { classes } = useStyles();
  const { uuid, id: siteId } = useActiveSite();
  const { username } = useActiveUser();
  const [sandboxBranch, setSandboxBranch] = useState('');
  const [sandboxBranchError, setSandboxBranchError] = useState<ApiResponse>(null);

  const onFormInputChange = (e: any) => {
    if (e.target.name === 'mergeStrategy') {
      setSelectedMergeStrategy(e.target.value);
    }
  };

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!isBlank(sandboxBranch)) {
      onPullStart?.();
      pull({
        siteId,
        remoteName,
        remoteBranch: sandboxBranch,
        mergeStrategy: selectedMergeStrategy
      }).subscribe({
        next(result) {
          onPullSuccess?.(result);
        },
        error({ response }) {
          onPullError?.(response.response);
        }
      });
    }
  };

  const fetchSandboxBranch = useCallback(() => {
    fetchSite(siteId).subscribe({
      next: ({ sandboxBranch }) => {
        setSandboxBranchError(null);
        setSandboxBranch(sandboxBranch);
      },
      error: (error) => {
        setSandboxBranchError(error);
      }
    });
  }, [siteId]);

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
    fetchSandboxBranch();
  }, [fetchSandboxBranch]);

  return (
    <form onSubmit={onSubmit}>
      <DialogBody>
        <FormControl variant="outlined" fullWidth className={classes.formControl} disabled={disabled || isSubmitting}>
          <FormLabel className={classes.pullBranchLabel}>
            {!sandboxBranchError ? (
              <>
                <Typography color="textSecondary" variant="body1" className={classes.pullBranchLabelHeading}>
                  <FormattedMessage id="words.branch" defaultMessage="Branch" />
                </Typography>
                {sandboxBranch}
              </>
            ) : (
              <Typography variant="body1" className={classes.pullBranchLabelError}>
                <FormattedMessage
                  id="repositories.sandboxBranchError"
                  defaultMessage="Unable to retrieve project’s branch • {retry}"
                  values={{
                    retry: (
                      <Link sx={{ cursor: 'pointer' }} onClick={fetchSandboxBranch}>
                        <FormattedMessage id="words.retry" defaultMessage="Retry" />
                      </Link>
                    )
                  }}
                />
              </Typography>
            )}
          </FormLabel>
        </FormControl>
        <FormControl variant="outlined" fullWidth disabled={disabled || isSubmitting}>
          <InputLabel id="mergeStrategyLabel">
            <FormattedMessage id="repositories.mergeStrategyLabel" defaultMessage="Merge Strategy" />
          </InputLabel>
          <Select
            labelId="mergeStrategyLabel"
            name="mergeStrategy"
            value={selectedMergeStrategy}
            onChange={onFormInputChange}
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
              id="repositories.pullInfo"
              defaultMessage="You may only pull from the branch the site was created from; any feature branch work should be merged
          upstream."
            />
          </Typography>
        </Alert>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onCloseButtonClick} disabled={disabled || isSubmitting}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={disabled || isBlank(sandboxBranch)} loading={isSubmitting}>
          <FormattedMessage id="words.ok" defaultMessage="Ok" />
        </PrimaryButton>
      </DialogFooter>
    </form>
  );
}

export default PullDialogContainer;
