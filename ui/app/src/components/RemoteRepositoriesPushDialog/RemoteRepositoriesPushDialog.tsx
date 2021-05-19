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
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from '../Dialogs/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import DialogFooter from '../Dialogs/DialogFooter';
import { FormattedMessage } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select/Select';
import { push as pushService } from '../../services/repositories';
import { useActiveSiteId } from '../../utils/hooks';
import ApiResponse from '../../models/ApiResponse';

export interface RemoteRepositoriesPushDialogProps {
  open: boolean;
  branches: string[];
  remoteName: string;
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

export default function RemoteRepositoriesPushDialog(props: RemoteRepositoriesPushDialogProps) {
  const { open, branches, remoteName, onClose, onPushSuccess, onPushError } = props;
  const [selectedBranch, setSelectedBranch] = useState('');
  const classes = useStyles();
  const siteId = useActiveSiteId();
  const [disableBackdropClick, setDisableBackdropClick] = useState(false);

  const onChange = (e: any) => {
    setSelectedBranch(e.target.value);
    setDisableBackdropClick(true);
  };

  const push = () => {
    pushService(siteId, remoteName, selectedBranch, true).subscribe(
      () => {
        onPushSuccess?.();
      },
      ({ response }) => {
        onPushError?.(response);
      }
    );
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      disableBackdropClick={disableBackdropClick}
      disableEscapeKeyDown={disableBackdropClick}
    >
      <form>
        <DialogHeader title={<FormattedMessage id="words.push" defaultMessage="Push" />} onDismiss={onClose} />
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
          <Button variant="outlined" color="default" onClick={onClose}>
            <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
          </Button>
          <Button type="submit" variant="contained" color="primary" onClick={push} disabled={selectedBranch === ''}>
            <FormattedMessage id="words.ok" defaultMessage="Ok" />
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
