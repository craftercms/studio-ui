import React, { useState } from 'react';
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Collapse from "@material-ui/core/Collapse";
import makeStyles from "@material-ui/core/styles/makeStyles";
import TextField from "@material-ui/core/TextField";
import clsx from "clsx";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { SiteState } from '../models/Site';
import { defineMessages, useIntl } from "react-intl";

const useStyles = makeStyles(theme => ({
  formControl: {
    width: '100%',
    '& legend': {
      marginBottom: '16px'
    },
    '& .MuiFormGroup-root': {
      marginLeft: '10px'
    }
  },
  gitInfo: {
    width: '100%',
    '& .MuiGrid-item':{
      padding: '12px'
    }
  },
  margin: {
    margin: theme.spacing(1),
  },
  textField: {
    width: '100%',
  },
  authBox: {
    padding: '10px',
    background: '#F2F2F2',
    borderRadius: '5px',
    marginLeft: '30px',
    display: 'flex',
    justifyContent: 'center'
  },
}));

interface GitForm {
  inputs: SiteState,
  handleInputChange(event: any): any,
  type?: string;
}

const pushMessages = defineMessages({
  push_url_label: {
    id: 'createSiteDialog.push_url_label',
    defaultMessage: 'The git repository URL to push.'
  },
  push_remote_branch_label: {
    id: 'createSiteDialog.push_remote_branch_label',
    defaultMessage: 'The site will get created pushing that branch to the repo.'
  },
  push_remote_name_label: {
    id: 'createSiteDialog.push_remote_name_label',
    defaultMessage: 'Name the remote that will refer to the source repo to push. Typically named “upstream” or “origin”.'
  },
});

const cloneMessages = defineMessages({
  clone_url_label: {
    id: 'createSiteDialog.clone_url_label',
    defaultMessage: 'The git repository URL to clone from.'
  },
  clone_remote_branch_label: {
    id: 'createSiteDialog.clone_remote_branch_label',
    defaultMessage: 'The site will get created cloning that branch of the repo. You may switch between branches later too.'
  },
  clone_remote_name_label: {
    id: 'createSiteDialog.clone_remote_name_label',
    defaultMessage: 'Name the remote that will refer to the source repo to pull from. Typically named “upstream” or “origin”.'
  },
});

const messages = defineMessages({
  branch: {
    id: 'createSiteDialog.branch',
    defaultMessage: 'Branch'
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
    defaultMessage: 'Repo URL'
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
});

function GitForm(props: GitForm) {
  const classes = useStyles({});
  const {inputs, handleInputChange, type} = props;
  const [expanded, setExpanded] = useState({
    basic: false,
    token: false,
    key: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const { formatMessage } = useIntl();

  const viewAuth = (type: string) => {
    const _expanded: any = {...expanded};
    Object.keys(expanded).map((key: string) => {
      if (key === type) {
        return _expanded[key] = !_expanded[key];
      }
      return _expanded[key] = false;
    });
    setExpanded(_expanded);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  function renderAuth(type: string) {
    return (
      <div className={classes.authBox}>
        {
          (type === 'basic' || type === 'token') &&
          <TextField
            id="repo_username"
            name="repo_username"
            className={clsx(classes.margin, classes.textField)}
            label={formatMessage(messages.userName)}
            variant="outlined"
            required
            value={inputs.repo_username}
            onChange={handleInputChange}
            error={(inputs.submitted && !inputs.repo_username && inputs.push_site)}
          />
        }
        {
          (type === 'basic') &&
          <TextField
            id="repo_password"
            name="repo_password"
            className={clsx(classes.margin, classes.textField)}
            type={showPassword ? 'text' : 'password'}
            label={formatMessage(messages.password)}
            variant="outlined"
            required
            value={inputs.repo_password}
            onChange={handleInputChange}
            error={(inputs.submitted && !inputs.repo_password && inputs.push_site)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                  >
                    {showPassword ? <VisibilityOff/> : <Visibility/>}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        }
        {
          (type === 'token') &&
          <TextField
            id="repo_token"
            name="repo_token"
            className={clsx(classes.margin, classes.textField)}
            type={showPassword ? 'text' : 'password'}
            label={formatMessage(messages.token)}
            variant="outlined"
            required
            value={inputs.repo_token}
            error={(inputs.submitted && !inputs.repo_token && inputs.push_site)}
            onChange={handleInputChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                  >
                    {showPassword ? <VisibilityOff/> : <Visibility/>}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        }
        {
          (type === 'key') &&
          <TextField
              id="repo_key"
              name="repo_key"
              label={formatMessage(messages.privateKey)}
              variant="outlined"
              required
              fullWidth
              multiline
              className={classes.margin}
              error={(inputs.submitted && !inputs.repo_key && inputs.push_site)}
              onChange={handleInputChange}
              value={inputs.repo_key}
          />
        }
      </div>
    )
  }

  return (
    <Grid container spacing={0} className={classes.gitInfo}>
      <Grid item xs={12}>
        <TextField
          id="repo_url"
          name="repo_url"
          label={formatMessage(messages.repoUrl)}
          variant="outlined"
          required
          fullWidth
          placeholder={"e.g. https://github.com/craftercms/craftercms-react-blueprint.git"}
          onChange={handleInputChange}
          value={inputs.repo_url}
          error={(inputs.submitted && !inputs.repo_url && inputs.push_site)}
          helperText={type === 'push'? formatMessage(pushMessages.push_url_label) : formatMessage(cloneMessages.clone_url_label)}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Authentication</FormLabel>
          <RadioGroup aria-label="repo_authentication" name="repo_authentication"
                      value={inputs.repo_authentication} onChange={handleInputChange}>
            <FormControlLabel value="none" control={<Radio color="primary" onChange={() => viewAuth('none')}/>}
                              label={formatMessage(messages.authenticationNoRequired)}/>
            <FormControlLabel value="basic" control={<Radio color="primary" onChange={() => viewAuth('basic')}/>}
                              label={formatMessage(messages.usernameAndPassword)}/>
            <Collapse in={expanded.basic} timeout={300} unmountOnExit>
              {expanded.basic && renderAuth(inputs.repo_authentication)}
            </Collapse>
            <FormControlLabel value="token" control={<Radio color="primary" onChange={() => viewAuth('token')}/>}
                              label={formatMessage(messages.token)}/>
            <Collapse in={expanded.token} timeout={300} unmountOnExit>
              {expanded.token && renderAuth(inputs.repo_authentication)}
            </Collapse>
            <FormControlLabel value="key" control={<Radio color="primary" onChange={() => viewAuth('key')}/>}
                              label={formatMessage(messages.privateKey)}/>
            <Collapse in={expanded.key} timeout={300} unmountOnExit>
              {expanded.key && renderAuth(inputs.repo_authentication)}
            </Collapse>
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          id="repo_remote_branch"
          name="repo_remote_branch"
          label={formatMessage(messages.branch)}
          variant="outlined"
          fullWidth
          onChange={handleInputChange}
          value={inputs.repo_remote_branch}
          helperText={type === 'push'? formatMessage(pushMessages.push_remote_branch_label) : formatMessage(cloneMessages.clone_remote_branch_label)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          id="repo_remote_name"
          name="repo_remote_name"
          label={formatMessage(messages.remoteName)}
          variant="outlined"
          required
          fullWidth
          onChange={handleInputChange}
          value={inputs.repo_remote_name}
          error={(inputs.submitted && !inputs.repo_remote_name && inputs.push_site)}
          helperText={type === 'push'? formatMessage(pushMessages.push_remote_name_label) : formatMessage(cloneMessages.clone_remote_name_label)}
        />
      </Grid>
    </Grid>
  )
}

export default GitForm;
