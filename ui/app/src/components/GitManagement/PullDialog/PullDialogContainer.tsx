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

import React, { useEffect, useState } from 'react';
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
  getStoredPullBranch,
  getStoredPullMergeStrategy,
  removeStoredPullBranch,
  removeStoredPullMergeStrategy,
  setStoredPullBranch,
  setStoredPullMergeStrategy
} from '../../../utils/state';
import useActiveSite from '../../../hooks/useActiveSite';
import useActiveUser from '../../../hooks/useActiveUser';

const useStyles = makeStyles()(() => ({
  formControl: {
    marginBottom: '15px'
  }
}));

export function PullDialogContainer(props: PullFromRemoteDialogContainerProps) {
  const {
    branches,
    remoteName,
    mergeStrategies,
    onClose,
    onPullSuccess,
    onPullError,
    onPullStart,
    disabled = false,
    isSubmitting = false
  } = props;

  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedMergeStrategy, setSelectedMergeStrategy] = useState('');
  const { classes } = useStyles();
  const { uuid, id: siteId } = useActiveSite();
  const { username } = useActiveUser();

  const onFormInputChange = (e: any) => {
    if (e.target.name === 'branch') {
      setSelectedBranch(e.target.value);
    } else if (e.target.name === 'mergeStrategy') {
      setSelectedMergeStrategy(e.target.value);
    }
  };

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!isBlank(selectedBranch)) {
      onPullStart?.();
      pull({
        siteId,
        remoteName,
        remoteBranch: selectedBranch,
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

  useEffect(() => {
    if (!selectedBranch && branches?.length) {
      const storedPullBranch = getStoredPullBranch(uuid, username);
      if (storedPullBranch) {
        if (branches.includes(storedPullBranch)) {
          setSelectedBranch(storedPullBranch);
        } else {
          removeStoredPullBranch(uuid, username);
        }
      } else {
        setSelectedBranch(branches[0]);
      }
    }
  }, [branches, selectedBranch, uuid, username]);

  useEffect(() => {
    if (selectedBranch) {
      setStoredPullBranch(uuid, username, selectedBranch);
    }
  }, [selectedBranch, uuid, username]);

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

  return (
    <form onSubmit={onSubmit}>
      <DialogBody>
        <FormControl variant="outlined" fullWidth className={classes.formControl} disabled={disabled || isSubmitting}>
          <InputLabel id="remoteBranchToPullLabel">
            <FormattedMessage id="repositories.remoteBranchToPull" defaultMessage="Remote Branch to Pull" />
          </InputLabel>
          <Select
            labelId="remoteBranchToPullLabel"
            name="branch"
            value={selectedBranch}
            onChange={onFormInputChange}
            label={<FormattedMessage id="repositories.remoteBranchToPull" defaultMessage="Remote Branch to Pull" />}
            fullWidth
          >
            {branches.map((branch) => (
              <MenuItem key={branch} value={branch}>
                {branch}
              </MenuItem>
            ))}
          </Select>
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
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onCloseButtonClick} disabled={disabled || isSubmitting}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={disabled || isBlank(selectedBranch)} loading={isSubmitting}>
          <FormattedMessage id="words.ok" defaultMessage="Ok" />
        </PrimaryButton>
      </DialogFooter>
    </form>
  );
}

export default PullDialogContainer;
