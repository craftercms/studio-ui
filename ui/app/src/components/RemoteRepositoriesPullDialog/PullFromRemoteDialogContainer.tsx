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

import React, { useState } from 'react';
import DialogHeader from '../DialogHeader/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import DialogFooter from '../Dialogs/DialogFooter';
import { FormattedMessage } from 'react-intl';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { MergeStrategy } from '../../models/Repository';
import { pull } from '../../services/repositories';
import ApiResponse from '../../models/ApiResponse';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { isBlank } from '../../utils/string';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';

export interface PullFromRemoteDialogContainerProps {
  open: boolean;
  branches: string[];
  remoteName: string;
  mergeStrategies: MergeStrategy[];
  setDisableQuickDismiss?(disable: boolean): void;
  onClose(): void;
  onPullSuccess?(): void;
  onPullError?(response: ApiResponse): void;
}

const useStyles = makeStyles(() =>
  createStyles({
    formControl: {
      marginBottom: '15px'
    }
  })
);

export default function PullFromRemoteDialogContainer(props: PullFromRemoteDialogContainerProps) {
  const { branches, remoteName, mergeStrategies, onClose, onPullSuccess, onPullError, setDisableQuickDismiss } = props;
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedMergeStrategy, setSelectedMergeStrategy] = useState(mergeStrategies[0].key);
  const classes = useStyles();
  const siteId = useActiveSiteId();

  const onChange = (e: any) => {
    e.persist();
    if (e.target.name === 'branch') {
      setSelectedBranch(e.target.value);
      setDisableQuickDismiss(true);
    } else if (e.target.name === 'mergeStrategy') {
      setSelectedMergeStrategy(e.target.value);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!isBlank(selectedBranch)) {
      pull({
        siteId,
        remoteName,
        remoteBranch: selectedBranch,
        mergeStrategy: selectedMergeStrategy
      }).subscribe(
        () => {
          onPullSuccess?.();
        },
        ({ response }) => {
          onPullError?.(response.response);
        }
      );
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <DialogHeader title={<FormattedMessage id="words.pull" defaultMessage="Pull" />} onCloseButtonClick={onClose} />
      <DialogBody>
        <FormControl variant="outlined" fullWidth className={classes.formControl}>
          <InputLabel id="remoteBranchToPullLabel">
            <FormattedMessage id="repositories.remoteBranchToPull" defaultMessage="Remote Branch to Pull" />
          </InputLabel>
          <Select
            labelId="remoteBranchToPullLabel"
            name="branch"
            value={selectedBranch}
            onChange={onChange}
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
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="mergeStrategyLabel">
            <FormattedMessage id="repositories.mergeStrategyLabel" defaultMessage="Merge Strategy" />
          </InputLabel>
          <Select
            labelId="mergeStrategyLabel"
            name="mergeStrategy"
            value={selectedMergeStrategy}
            onChange={onChange}
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
        <SecondaryButton onClick={onClose}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={isBlank(selectedBranch)}>
          <FormattedMessage id="words.ok" defaultMessage="Ok" />
        </PrimaryButton>
      </DialogFooter>
    </form>
  );
}
