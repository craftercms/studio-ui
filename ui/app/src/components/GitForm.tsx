/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
import Grid from '@material-ui/core/Grid';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import Collapse from '@material-ui/core/Collapse';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import clsx from 'clsx';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { SiteState } from '../models/Site';
import { defineMessages, useIntl } from 'react-intl';
import Typography from '@material-ui/core/Typography';

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
  },
  margin: {
    margin: theme.spacing(1)
  },
  textField: {
    width: '100%'
  },
  authBox: {
    padding: '10px',
    background: '#F2F2F2',
    borderRadius: '5px',
    marginLeft: '30px',
    display: 'flex',
    justifyContent: 'center'
  }
}));

interface GitFormProps {
  inputs: SiteState;

  handleInputChange(event: React.ChangeEvent): any;

  onKeyPress(event: any): any;

  setInputs(state: any): any;

  type?: string;
}

const pushMessages = defineMessages({
  push_url_label: {
    id: 'createSiteDialog.push_url_label',
    defaultMessage: 'The git repository URL to push.'
  },
  push_remoteBranch_label: {
    id: 'createSiteDialog.push_remoteBranch_label',
    defaultMessage: 'The site will get created pushing that branch to the repo.'
  },
  push_remoteName_label: {
    id: 'createSiteDialog.push_remoteName_label',
    defaultMessage:
      'Name the remote that will refer to the source repo to push. Typically named “upstream” or “origin”.'
  }
});

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
  authentication: {
    id: 'common.authentication',
    defaultMessage: 'Authentication'
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
  const { inputs, setInputs, handleInputChange, type, onKeyPress } = props;
  const [showPassword, setShowPassword] = useState(false);
  const { formatMessage } = useIntl();

  const viewAuth = (type: string) => {
    const _expanded: any = { ...inputs.expanded };
    Object.keys(inputs.expanded).map((key: string) => {
      if (key === type) {
        return (_expanded[key] = !_expanded[key]);
      }
      return (_expanded[key] = false);
    });
    setInputs({ ...inputs, expanded: _expanded });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  function renderHelperText(
    name: string,
    value: string = '',
    helperText: string,
    required: boolean,
    submitted: boolean,
    pushSite: boolean
  ) {
    if (required && !value && submitted && pushSite) {
      return formatMessage(messages.required, { name: name });
    } else {
      return helperText;
    }
  }

  function renderAuth(type: string, gitType: string) {
    return (
      <div className={classes.authBox}>
        {(type === 'basic' || type === 'token') && (
          <TextField
            id="repoUsername"
            name="repoUsername"
            className={clsx(classes.margin, classes.textField)}
            label={formatMessage(messages.userName)}
            required
            value={inputs.repoUsername}
            onKeyPress={onKeyPress}
            onChange={handleInputChange}
            error={inputs.submitted && !inputs.repoUsername && (gitType === 'clone' || inputs.pushSite)}
            helperText={renderHelperText(
              formatMessage(messages.userName),
              inputs.repoUsername,
              '',
              true,
              inputs.submitted,
              gitType === 'clone' ? true : inputs.pushSite
            )}
          />
        )}
        {type === 'basic' && (
          <TextField
            id="repoPassword"
            name="repoPassword"
            className={clsx(classes.margin, classes.textField)}
            type={showPassword ? 'text' : 'password'}
            label={formatMessage(messages.password)}
            required
            value={inputs.repoPassword}
            onKeyPress={onKeyPress}
            onChange={handleInputChange}
            error={inputs.submitted && !inputs.repoPassword && (gitType === 'clone' || inputs.pushSite)}
            helperText={renderHelperText(
              formatMessage(messages.password),
              inputs.repoPassword,
              '',
              true,
              inputs.submitted,
              gitType === 'clone' ? true : inputs.pushSite
            )}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" aria-label="toggle password visibility" onClick={handleClickShowPassword}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        )}
        {type === 'token' && (
          <TextField
            id="repoToken"
            name="repoToken"
            className={clsx(classes.margin, classes.textField)}
            type={showPassword ? 'text' : 'password'}
            label={formatMessage(messages.token)}
            required
            value={inputs.repoToken}
            error={inputs.submitted && !inputs.repoToken && (gitType === 'clone' || inputs.pushSite)}
            helperText={renderHelperText(
              formatMessage(messages.token),
              inputs.repoToken,
              '',
              true,
              inputs.submitted,
              gitType === 'clone' ? true : inputs.pushSite
            )}
            onKeyPress={onKeyPress}
            onChange={handleInputChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" aria-label="toggle password visibility" onClick={handleClickShowPassword}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        )}
        {type === 'key' && (
          <TextField
            id="repoKey"
            name="repoKey"
            label={formatMessage(messages.privateKey)}
            required
            fullWidth
            multiline
            className={classes.margin}
            error={inputs.submitted && !inputs.repoKey && (gitType === 'clone' || inputs.pushSite)}
            helperText={renderHelperText(
              formatMessage(messages.privateKey),
              inputs.repoKey,
              '',
              true,
              inputs.submitted,
              gitType === 'clone' ? true : inputs.pushSite
            )}
            onKeyPress={onKeyPress}
            onChange={handleInputChange}
            value={inputs.repoKey}
          />
        )}
      </div>
    );
  }

  return (
    <Grid container spacing={0} className={classes.gitInfo}>
      <Grid item xs={12}>
        <TextField
          id="repoUrl"
          name="repoUrl"
          label={formatMessage(messages.repoUrl)}
          InputLabelProps={{ shrink: true }}
          autoFocus={type === 'push'}
          required
          fullWidth
          placeholder={'e.g. https://github.com/craftercms/craftercms-react-blueprint.git'}
          onKeyPress={onKeyPress}
          onChange={handleInputChange}
          value={inputs.repoUrl}
          error={inputs.submitted && !inputs.repoUrl && (inputs.pushSite || type === 'clone')}
          helperText={
            type === 'push'
              ? renderHelperText(
                  formatMessage(messages.repoUrl),
                  inputs.repoUrl,
                  formatMessage(pushMessages.push_url_label),
                  true,
                  inputs.submitted,
                  inputs.pushSite
                )
              : renderHelperText(
                  formatMessage(messages.repoUrl),
                  inputs.repoUrl,
                  formatMessage(cloneMessages.clone_url_label),
                  true,
                  inputs.submitted,
                  true
                )
          }
        />
      </Grid>
      {!inputs.pushSite && (
        <Grid item xs={12}>
          <TextField
            id="repoRemoteBranch"
            name="gitBranch"
            label={formatMessage(messages.branch)}
            InputLabelProps={{ shrink: true }}
            placeholder="master"
            fullWidth
            onKeyPress={onKeyPress}
            onChange={handleInputChange}
            value={inputs.gitBranch}
            helperText={
              type === 'push'
                ? formatMessage(pushMessages.push_remoteBranch_label)
                : formatMessage(cloneMessages.clone_remoteBranch_label)
            }
          />
        </Grid>
      )}
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
          helperText={
            type === 'push'
              ? formatMessage(pushMessages.push_remoteName_label)
              : formatMessage(cloneMessages.clone_remoteName_label)
          }
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1" color={'textSecondary'}>
          {formatMessage(messages.authentication)}
        </Typography>
        <div className={classes.formControl}>
          <RadioGroup
            aria-label="repoAuthentication"
            name="repoAuthentication"
            value={inputs.repoAuthentication}
            onChange={handleInputChange}
            onKeyPress={onKeyPress}
          >
            <FormControlLabel
              value="none"
              control={<Radio color="primary" onChange={() => viewAuth('none')} />}
              label={formatMessage(messages.authenticationNoRequired)}
            />
            <FormControlLabel
              value="basic"
              control={<Radio color="primary" onChange={() => viewAuth('basic')} />}
              label={formatMessage(messages.usernameAndPassword)}
            />
            <Collapse in={inputs.expanded.basic} timeout={300}>
              {inputs.expanded.basic && renderAuth(inputs.repoAuthentication, type)}
            </Collapse>
            <FormControlLabel
              value="token"
              control={<Radio color="primary" onChange={() => viewAuth('token')} />}
              label={formatMessage(messages.token)}
            />
            <Collapse in={inputs.expanded.token} timeout={300} unmountOnExit>
              {inputs.expanded.token && renderAuth(inputs.repoAuthentication, type)}
            </Collapse>
            <FormControlLabel
              value="key"
              control={<Radio color="primary" onChange={() => viewAuth('key')} />}
              label={formatMessage(messages.privateKey)}
            />
            <Collapse in={inputs.expanded.key} timeout={300} unmountOnExit>
              {inputs.expanded.key && renderAuth(inputs.repoAuthentication, type)}
            </Collapse>
          </RadioGroup>
        </div>
      </Grid>
    </Grid>
  );
}

export default GitForm;
