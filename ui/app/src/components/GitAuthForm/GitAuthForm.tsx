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
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Collapse from '@mui/material/Collapse';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { makeStyles } from 'tss-react/mui';
import { SiteState } from '../../models/Site';
import Typography from '@mui/material/Typography';

export interface GitAuthFormProps {
  inputs: Partial<SiteState>;
  setInputs(inputs): void;
  handleInputChange(event: React.ChangeEvent): any;
  onKeyPress?(event: any): any;
}

interface AuthFieldsProps {
  inputs: Partial<SiteState>;
  handleInputChange(event: React.ChangeEvent): any;
  onKeyPress?(event: any): any;
}

const useStyles = makeStyles()((theme) => ({
  authBox: {
    padding: '10px',
    background: theme.palette.background.paper,
    borderRadius: '5px',
    marginLeft: '30px',
    display: 'flex',
    justifyContent: 'center'
  },
  margin: {
    margin: theme.spacing(1)
  },
  textField: {
    width: '100%'
  }
}));

const messages = defineMessages({
  userName: {
    id: 'words.userName',
    defaultMessage: 'Username'
  },
  password: {
    id: 'words.password',
    defaultMessage: 'Password'
  },
  token: {
    id: 'words.token',
    defaultMessage: 'Token'
  },
  privateKey: {
    id: 'gitAuthForm.privateKey',
    defaultMessage: 'Private Key'
  }
});

function renderHelperText(name: string, value: string = '', helperText: string, required: boolean, submitted: boolean) {
  if (required && !value && submitted) {
    return <FormattedMessage id="gitForm.required" defaultMessage="{name} is required." values={{ name }} />;
  } else {
    return helperText;
  }
}

function AuthFields(props: AuthFieldsProps) {
  const { inputs, handleInputChange, onKeyPress } = props;
  const type = inputs.repoAuthentication;
  const [showPassword, setShowPassword] = useState(false);
  const { formatMessage } = useIntl();
  const { classes, cx } = useStyles();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={classes.authBox}>
      {(type === 'basic' || type === 'token') && (
        <TextField
          id="repoUsername"
          name="repoUsername"
          data-field-id="repoUsername"
          className={cx(classes.margin, classes.textField)}
          label={formatMessage(messages.userName)}
          required
          autoFocus
          value={inputs.repoUsername}
          onKeyPress={onKeyPress}
          onChange={handleInputChange}
          error={inputs.submitted && !inputs.repoUsername}
          helperText={renderHelperText(
            formatMessage(messages.userName),
            inputs.repoUsername,
            '',
            true,
            inputs.submitted
          )}
        />
      )}
      {type === 'basic' && (
        <TextField
          id="repoPassword"
          name="repoPassword"
          data-field-id="repoPassword"
          className={cx(classes.margin, classes.textField)}
          type={showPassword ? 'text' : 'password'}
          label={formatMessage(messages.password)}
          required
          value={inputs.repoPassword}
          onKeyPress={onKeyPress}
          onChange={handleInputChange}
          error={inputs.submitted && !inputs.repoPassword}
          helperText={renderHelperText(
            formatMessage(messages.password),
            inputs.repoPassword,
            '',
            true,
            inputs.submitted
          )}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    size="large"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }
          }}
        />
      )}
      {type === 'token' && (
        <TextField
          id="repoToken"
          name="repoToken"
          data-field-id="repoToken"
          className={cx(classes.margin, classes.textField)}
          type={showPassword ? 'text' : 'password'}
          label={formatMessage(messages.token)}
          required
          value={inputs.repoToken}
          error={inputs.submitted && !inputs.repoToken}
          helperText={renderHelperText(formatMessage(messages.token), inputs.repoToken, '', true, inputs.submitted)}
          onKeyPress={onKeyPress}
          onChange={handleInputChange}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    size="large"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }
          }}
        />
      )}
      {type === 'key' && (
        <TextField
          id="repoKey"
          name="repoKey"
          data-field-id="repoKey"
          label={formatMessage(messages.privateKey)}
          required
          fullWidth
          multiline
          className={classes.margin}
          error={inputs.submitted && !inputs.repoKey}
          helperText={renderHelperText(formatMessage(messages.privateKey), inputs.repoKey, '', true, inputs.submitted)}
          onKeyPress={onKeyPress}
          onChange={handleInputChange}
          value={inputs.repoKey}
        />
      )}
    </div>
  );
}

export function GitAuthForm(props: GitAuthFormProps) {
  const { inputs, setInputs, handleInputChange, onKeyPress } = props;

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

  return (
    <>
      <Typography variant="subtitle1" color={'textSecondary'}>
        <FormattedMessage id="words.authentication" defaultMessage="Authentication" />
      </Typography>
      <RadioGroup
        aria-label="repoAuthentication"
        name="repoAuthentication"
        value={inputs.repoAuthentication}
        onChange={handleInputChange}
        onKeyPress={onKeyPress}
      >
        <FormControlLabel
          value="none"
          control={<Radio onChange={() => viewAuth('none')} />}
          label={
            <FormattedMessage
              id="gitForm.noAuthenticationRequired"
              defaultMessage="Authentication not required (public URL)"
            />
          }
        />
        <FormControlLabel
          value="basic"
          control={<Radio onChange={() => viewAuth('basic')} />}
          label={<FormattedMessage id="gitForm.usernameAndPassword" defaultMessage="Username & Password" />}
        />
        <Collapse in={inputs.expanded.basic} timeout={300} unmountOnExit>
          <AuthFields inputs={inputs} handleInputChange={handleInputChange} />
        </Collapse>
        <FormControlLabel
          value="token"
          control={<Radio onChange={() => viewAuth('token')} />}
          label={<FormattedMessage id="gitForm.token" defaultMessage="Token" />}
        />
        <Collapse in={inputs.expanded.token} timeout={300} unmountOnExit>
          <AuthFields inputs={inputs} handleInputChange={handleInputChange} />
        </Collapse>
        <FormControlLabel
          value="key"
          control={<Radio onChange={() => viewAuth('key')} />}
          label={<FormattedMessage id="gitForm.privateKey" defaultMessage="Private Key" />}
        />
        <Collapse in={inputs.expanded.key} timeout={300} unmountOnExit>
          <AuthFields inputs={inputs} handleInputChange={handleInputChange} />
        </Collapse>
      </RadioGroup>
    </>
  );
}

export default GitAuthForm;
