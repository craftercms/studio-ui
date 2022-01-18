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

import React from 'react';
import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import TextField from '@mui/material/TextField';
import { SiteState } from '../../models/Site';
import { defineMessages, useIntl } from 'react-intl';
import GitAuthForm from '../GitAuthForm';

const useStyles = makeStyles((theme) => ({
  formControl: {
    width: '100%',
    '& .MuiFormGroup-root': {
      marginLeft: '10px'
    }
  },
  gitInfo: {
    width: '100%',
    '& .MuiGrid-item': {
      padding: '12px'
    }
  }
}));

interface GitFormProps {
  inputs: SiteState;

  handleInputChange(event: React.ChangeEvent): any;

  onKeyPress(event: any): any;

  setInputs(state: any): any;
}

const cloneMessages = defineMessages({
  clone_url_label: {
    id: 'createSiteDialog.clone_url_label',
    defaultMessage: 'The git repository URL to clone from.'
  },
  clone_remoteBranch_label: {
    id: 'createSiteDialog.clone_remoteBranch_label',
    defaultMessage:
      'The site will get created cloning that branch of the repo. You may switch between branches later too.'
  },
  clone_remoteName_label: {
    id: 'createSiteDialog.clone_remoteName_label',
    defaultMessage:
      'Name the remote that will refer to the source repo to pull from. Typically named “upstream” or “origin”.'
  }
});

const messages = defineMessages({
  branch: {
    id: 'createSiteDialog.branch',
    defaultMessage: 'Git Branch'
  },
  userName: {
    id: 'common.userName',
    defaultMessage: 'Username'
  },
  password: {
    id: 'common.password',
    defaultMessage: 'Password'
  },
  token: {
    id: 'common.token',
    defaultMessage: 'Token'
  },
  privateKey: {
    id: 'common.privateKey',
    defaultMessage: 'Private Key'
  },
  repoUrl: {
    id: 'createSiteDialog.repoUrl',
    defaultMessage: 'Git Repo URL'
  },
  authenticationNoRequired: {
    id: 'createSiteDialog.authenticationNoRequired',
    defaultMessage: 'Authentication not required (public URL)'
  },
  usernameAndPassword: {
    id: 'common.usernameAndPassword',
    defaultMessage: 'Username & Password'
  },
  remoteName: {
    id: 'common.remoteName',
    defaultMessage: 'Git Remote Name'
  },
  required: {
    id: 'createSiteDialog.required',
    defaultMessage: '{name} is required.'
  }
});

function GitForm(props: GitFormProps) {
  const classes = useStyles({});
  const { inputs, setInputs, handleInputChange, onKeyPress } = props;
  const { formatMessage } = useIntl();

  function renderHelperText(
    name: string,
    value: string = '',
    helperText: string,
    required: boolean,
    submitted: boolean
  ) {
    if (required && !value && submitted) {
      return formatMessage(messages.required, { name: name });
    } else {
      return helperText;
    }
  }

  return (
    <Grid container spacing={0} className={classes.gitInfo}>
      <Grid item xs={12}>
        <TextField
          id="repoUrl"
          name="repoUrl"
          label={formatMessage(messages.repoUrl)}
          InputLabelProps={{ shrink: true }}
          required
          fullWidth
          placeholder={'e.g. https://github.com/craftercms/craftercms-react-blueprint.git'}
          onKeyPress={onKeyPress}
          onChange={handleInputChange}
          value={inputs.repoUrl}
          error={inputs.submitted && !inputs.repoUrl}
          helperText={renderHelperText(
            formatMessage(messages.repoUrl),
            inputs.repoUrl,
            formatMessage(cloneMessages.clone_url_label),
            true,
            inputs.submitted
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <div className={classes.formControl}>
          <GitAuthForm inputs={inputs} setInputs={setInputs} handleInputChange={handleInputChange} />
        </div>
      </Grid>
      <Grid item xs={12}>
        <TextField
          id="repoRemoteBranch"
          name="repoRemoteBranch"
          label={formatMessage(messages.branch)}
          InputLabelProps={{ shrink: true }}
          placeholder="master"
          fullWidth
          onKeyPress={onKeyPress}
          onChange={handleInputChange}
          value={inputs.repoRemoteBranch}
          helperText={formatMessage(cloneMessages.clone_remoteBranch_label)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          id="repoRemoteName"
          name="repoRemoteName"
          label={formatMessage(messages.remoteName)}
          InputLabelProps={{ shrink: true }}
          placeholder="origin"
          fullWidth
          onKeyPress={onKeyPress}
          onChange={handleInputChange}
          value={inputs.repoRemoteName}
          helperText={formatMessage(cloneMessages.clone_remoteName_label)}
        />
      </Grid>
    </Grid>
  );
}

export default GitForm;
