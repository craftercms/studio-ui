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
import { Checkbox, FormControlLabel, Switch } from '@mui/material';
import { useUpdateRefs } from '../../hooks';
import FormHelperText from '@mui/material/FormHelperText';
import { useTheme } from '@mui/material/styles';

const useStyles = makeStyles(() =>
  createStyles({
    formControl: {
      marginBottom: '15px'
    }
  })
);

export function PushToRemoteDialogContainer(props: PushToRemoteDialogContainerProps) {
  const { branches, remoteName, onClose, onPushSuccess, onPushError, onSubmittingChange, isSubmitting } = props;
  const [selectedBranch, setSelectedBranch] = useState(branches?.[0] ?? '');
  const classes = useStyles();
  const siteId = useActiveSiteId();
  const [forcePush, setForcePush] = useState(false);
  const fnRefs = useUpdateRefs({ onSubmittingChange, onPushSuccess, onPushError });
  const theme = useTheme();

  const onChange = (e: any) => {
    setSelectedBranch(e.target.value);
  };

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!isBlank(selectedBranch)) {
      onSubmittingChange(true);
      push(siteId, remoteName, selectedBranch, forcePush).subscribe({
        next() {
          fnRefs.current.onPushSuccess?.();
          fnRefs.current.onSubmittingChange(false);
        },
        error({ response }) {
          onPushError?.(response.response);
          fnRefs.current.onSubmittingChange(false);
        }
      });
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <DialogBody>
        <FormControl variant="outlined" fullWidth className={classes.formControl} disabled={isSubmitting}>
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
        <FormControl component="fieldset" variant="standard">
          <FormControlLabel
            disabled={isSubmitting}
            control={<Switch checked={forcePush} onChange={(e) => setForcePush(e.target.checked)} color="primary" />}
            label={<FormattedMessage id="pushToRemoteDialog.forcePush" defaultMessage="Force push" />}
          />
          <FormHelperText
            sx={{ color: forcePush ? `error.${theme.palette.mode === 'light' ? 'dark' : 'light'}` : void 0 }}
          >
            <FormattedMessage
              id="repositories.forcePushWarning"
              defaultMessage="Force push will overwrite what's in the remote repository branch."
            />
          </FormHelperText>
        </FormControl>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onCloseButtonClick} disabled={isSubmitting}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={isBlank(selectedBranch)} loading={isSubmitting}>
          <FormattedMessage id="words.push" defaultMessage="Push" />
        </PrimaryButton>
      </DialogFooter>
    </form>
  );
}

export default PushToRemoteDialogContainer;
