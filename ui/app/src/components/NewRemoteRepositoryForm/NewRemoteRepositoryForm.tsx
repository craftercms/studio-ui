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

import React from 'react';
import { makeStyles } from 'tss-react/mui';
import GitAuthForm from '../GitAuthForm';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import { FormattedMessage } from 'react-intl';
import { SiteState } from '../../models/Site';

const useStyles = makeStyles()(() => ({
  gitInfo: {
    width: '100%',
    '& .MuiGrid-item': {
      padding: '12px'
    }
  }
}));

export interface NewRemoteRepositoryFormProps {
  inputs: Partial<SiteState>;
  setInputs(inputs): void;
}

export function NewRemoteRepositoryForm(props: NewRemoteRepositoryFormProps) {
  const { classes } = useStyles();
  const { inputs, setInputs } = props;

  const handleInputChange = (e: any) => {
    setInputs({ [e.target.name]: e.target.value });
  };

  return (
    <Grid container spacing={3} className={classes.gitInfo}>
      <Grid size={12}>
        <TextField
          id="remoteName"
          name="remoteName"
          label={<FormattedMessage id="repositories.remoteName" defaultMessage="Remote Git Repository Name" />}
          slotProps={{
            inputLabel: { shrink: true }
          }}
          required
          placeholder="origin"
          autoFocus
          fullWidth
          onChange={handleInputChange}
          value={inputs.remoteName}
          error={inputs.submitted && !inputs.remoteName}
          helperText={
            <FormattedMessage
              id="repositories.repoRemoteNameHelper"
              defaultMessage="Name the remote that will refer to the source repo to pull from."
            />
          }
        />
      </Grid>
      <Grid size={12}>
        <TextField
          id="remoteUrl"
          name="remoteUrl"
          label={<FormattedMessage id="repositories.remoteUrl" defaultMessage="Remote Repository URL" />}
          slotProps={{
            inputLabel: { shrink: true }
          }}
          required
          fullWidth
          placeholder={'e.g. https://github.com/craftercms/craftercms-react-blueprint.git'}
          onChange={handleInputChange}
          value={inputs.remoteUrl}
          error={inputs.submitted && !inputs.remoteUrl}
          helperText={
            <FormattedMessage
              id="repositories.repoRemoteUrlHelper"
              defaultMessage="The git repository URL to create from."
            />
          }
        />
      </Grid>
      <Grid size={12}>
        <GitAuthForm inputs={inputs} setInputs={setInputs} handleInputChange={handleInputChange} />
      </Grid>
    </Grid>
  );
}

export default NewRemoteRepositoryForm;
