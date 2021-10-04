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
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { push } from '../../services/repositories';
import ApiResponse from '../../models/ApiResponse';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { isBlank } from '../../utils/string';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';

export interface PushToRemoteDialogContainerProps {
  open: boolean;
  branches: string[];
  remoteName: string;
  setDisableQuickDismiss?(disable: boolean): void;
  onClose(): void;
  onPushSuccess?(): void;
  onPushError?(response: ApiResponse): void;
}

const useStyles = makeStyles(() =>
  createStyles({
    formControl: {
      marginBottom: '15px'
    }
  })
);

export default function PushToRemoteDialogContainer(props: PushToRemoteDialogContainerProps) {
  const { branches, remoteName, onClose, onPushSuccess, onPushError, setDisableQuickDismiss } = props;
  const [selectedBranch, setSelectedBranch] = useState('');
  const classes = useStyles();
  const siteId = useActiveSiteId();

  const onChange = (e: any) => {
    setSelectedBranch(e.target.value);
    setDisableQuickDismiss(true);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!isBlank(selectedBranch)) {
      push(siteId, remoteName, selectedBranch, true).subscribe(
        () => {
          onPushSuccess?.();
        },
        ({ response }) => {
          onPushError?.(response.response);
        }
      );
      onClose();
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <DialogHeader title={<FormattedMessage id="words.push" defaultMessage="Push" />} onCloseButtonClick={onClose} />
      <DialogBody>
        <FormControl variant="outlined" fullWidth className={classes.formControl}>
          <InputLabel id="remoteBranchToPushLabel">
            <FormattedMessage id="repositories.remoteBranchToPush" defaultMessage="Remote Branch to Push" />
          </InputLabel>
          <Select
            labelId="remoteBranchToPullLabel"
            name="branch"
            value={selectedBranch}
            onChange={onChange}
            label={<FormattedMessage id="repositories.remoteBranchToPush" defaultMessage="Remote Branch to Push" />}
            fullWidth
          >
            {branches.map((branch) => (
              <MenuItem key={branch} value={branch}>
                {branch}
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
