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

import React, { useState } from 'react';
import DialogBody from '../DialogBody/DialogBody';
import DialogFooter from '../DialogFooter/DialogFooter';
import { FormattedMessage } from 'react-intl';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { push } from '../../services/repositories';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { isBlank } from '../../utils/string';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { PushToRemoteDialogContainerProps } from './utils';

const useStyles = makeStyles(() =>
  createStyles({
    formControl: {
      marginBottom: '15px'
    }
  })
);

export function PushToRemoteDialogContainer(props: PushToRemoteDialogContainerProps) {
  const { branches, remoteName, onClose, onPushSuccess, onPushError } = props;
  const [selectedBranch, setSelectedBranch] = useState(branches?.[0] ?? '');
  const classes = useStyles();
  const siteId = useActiveSiteId();

  const onChange = (e: any) => {
    setSelectedBranch(e.target.value);
  };

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

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
    }
  };

  return (
    <form onSubmit={onSubmit}>
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
        <SecondaryButton onClick={onCloseButtonClick}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={isBlank(selectedBranch)}>
          <FormattedMessage id="words.ok" defaultMessage="Ok" />
        </PrimaryButton>
      </DialogFooter>
    </form>
  );
}

export default PushToRemoteDialogContainer;
