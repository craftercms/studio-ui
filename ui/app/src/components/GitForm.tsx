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
import { Labels, SiteState } from '../models/Site';

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
    width: '100%'
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

const labels: Labels = {
  push: {
    repo_url_label: 'The git repository URL to push.',
    repo_remote_branch_label: 'The site will get created pushing that branch to the repo.',
    repo_remote_name_label: 'Name the remote that will refer to the source repo to push. Typically named “upstream” or “origin”.'
  },
  clone: {
    repo_url_label: 'The git repository URL to clone from.',
    repo_remote_branch_label: 'The site will get created cloning that branch of the repo. You may switch between branches later too.',
    repo_remote_name_label: 'Name the remote that will refer to the source repo to pull from. Typically named “upstream” or “origin”.'
  },
  branch: 'Branch',
  userName: 'Username',
  password: 'Password',
  token: 'Token',
  privateKey: 'Private key',
  repoUrl: 'Repo URL',
  authentication: 'Authentication',
  authenticationNoRequired: 'Authentication not required (public URL)',
  usernameAndPassword: 'Username & password',
  remoteName: 'Git Remote Name'
};

function GitForm(props: GitForm) {
  const classes = useStyles({});
  const {inputs, handleInputChange, type} = props;
  const [expanded, setExpanded] = useState({
    basic: false,
    token: false,
    key: false,
  });
  const [showPassword, setShowPassword] = useState(false);

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
            label={labels.userName}
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
            label={labels.password}
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
            label={labels.token}
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
              label={labels.privateKey}
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
    <Grid container spacing={3} className={classes.gitInfo}>
      <Grid item xs={12}>
        <TextField
          id="repo_url"
          name="repo_url"
          label={labels.repoUrl}
          variant="outlined"
          required
          fullWidth
          placeholder={"e.g. https://github.com/craftercms/craftercms-react-blueprint.git"}
          onChange={handleInputChange}
          value={inputs.repo_url}
          error={(inputs.submitted && !inputs.repo_url && inputs.push_site)}
          helperText={labels[type].repo_url_label}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Authentication</FormLabel>
          <RadioGroup aria-label="repo_authentication" name="repo_authentication"
                      value={inputs.repo_authentication} onChange={handleInputChange}>
            <FormControlLabel value="none" control={<Radio color="primary" onChange={() => viewAuth('none')}/>}
                              label={labels.authenticationNoRequired}/>
            <FormControlLabel value="basic" control={<Radio color="primary" onChange={() => viewAuth('basic')}/>}
                              label={labels.usernameAndPassword}/>
            <Collapse in={expanded.basic} timeout={300} unmountOnExit>
              {expanded.basic && renderAuth(inputs.repo_authentication)}
            </Collapse>
            <FormControlLabel value="token" control={<Radio color="primary" onChange={() => viewAuth('token')}/>}
                              label={labels.token}/>
            <Collapse in={expanded.token} timeout={300} unmountOnExit>
              {expanded.token && renderAuth(inputs.repo_authentication)}
            </Collapse>
            <FormControlLabel value="key" control={<Radio color="primary" onChange={() => viewAuth('key')}/>}
                              label={labels.privateKey}/>
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
          label={labels.branch}
          variant="outlined"
          required
          fullWidth
          onChange={handleInputChange}
          value={inputs.repo_remote_branch}
          helperText={labels[type].repo_remote_branch_label}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          id="repo_remote_name"
          name="repo_remote_name"
          label={labels.remoteName}
          variant="outlined"
          required
          fullWidth
          onChange={handleInputChange}
          value={inputs.repo_remote_name}
          helperText={labels[type].repo_remote_name_label}
        />
      </Grid>
    </Grid>
  )
}

export default GitForm;
