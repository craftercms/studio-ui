import React, { useState } from 'react';
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
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

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: `${theme.spacing(2)}px 0`,
    width: '100%',
    '& legend': {
      padding: '16px 0'
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
  }
}));

function GitForm(props: any) {
  const classes = useStyles({});
  const {inputs, submitted, handleInputChange, type} = props;
  const [expanded, setExpanded] = useState({
    basic: false,
    token: false,
    key: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const labels: any = {
    push: {
      repo_url_label: 'The git repository URL to push.',
      repo_remote_branch_label: 'The site will get created pushing that branch to the repo.',
      repo_remote_name_label: 'Name the remote that will refer to the source repo to push. Typically named “upstream” or “origin”.'
    },
    clone: {
      repo_url_label: 'The git repository URL to clone from.',
      repo_remote_branch_label: 'The site will get created cloning that branch of the repo. You may switch between branches later too.',
      repo_remote_name_label: 'Name the remote that will refer to the source repo to pull from. Typically named “upstream” or “origin”.'
    }
  };

  const viewAuth = (type: any) => {
    const _expanded: any = {...expanded};
    Object.keys(expanded).map((key: any) => {
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

  function renderAuth(type: any) {
    return (
      <div className={classes.authBox}>
        {(type === 'basic' || type === 'token') && <TextField
            id="repo_username"
            name="repo_username"
            className={clsx(classes.margin, classes.textField)}
            label="Username"
            required
            value={inputs.repo_username}
            onChange={handleInputChange}
            error={(submitted && !inputs.repo_username && inputs.push_site)}
        />}
        {(type === 'basic') && <TextField
            id='repo_password'
            name='repo_password'
            className={clsx(classes.margin, classes.textField)}
            type={showPassword ? 'text' : 'password'}
            label='Password'
            required
            value={inputs.repo_password}
            onChange={handleInputChange}
            error={(submitted && !inputs.repo_password && inputs.push_site)}
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
        />}
        {(type === 'token') && <TextField
            id='repo_token'
            name='repo_token'
            className={clsx(classes.margin, classes.textField)}
            type={showPassword ? 'text' : 'password'}
            label='Token'
            required
            value={inputs.repo_token}
            error={(submitted && !inputs.repo_token && inputs.push_site)}
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
        />}
        {(type === 'key') && <FormControl fullWidth>
            <TextField
                id="repo_key"
                name="repo_key"
                label="Private Key"
                required
                multiline
                rows="3"
                className={classes.margin}
                error={(submitted && !inputs.repo_key && inputs.push_site)}
                onChange={handleInputChange}
                value={inputs.repo_key}
            />
        </FormControl>}
      </div>
    )
  }

  return (
    <Grid container spacing={1} className={classes.gitInfo}>
      <Grid item xs={12}>
        <FormControl fullWidth error={(submitted && !inputs.repo_url && inputs.push_site)}>
          <InputLabel required htmlFor="repo_url">Repo URL</InputLabel>
          <Input id="repo_url" name="repo_url" onChange={handleInputChange} value={inputs.repo_url}
                 placeholder={"e.g. https://github.com/craftercms/craftercms-react-blueprint.git"}/>
          <FormHelperText>{labels[type].repo_url_label}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Authentication</FormLabel>
          <RadioGroup aria-label="repo_authentication" name="repo_authentication"
                      value={inputs.repo_authentication} onChange={handleInputChange}>
            <FormControlLabel value="none" control={<Radio onChange={() => viewAuth('none')}/>}
                              label="Authentication not required (public URL)"/>
            <FormControlLabel value="basic" control={<Radio onChange={() => viewAuth('basic')}/>}
                              label="Username & password"/>
            <Collapse in={expanded.basic} timeout={300} unmountOnExit>
              {expanded.basic && renderAuth(inputs.repo_authentication)}
            </Collapse>
            <FormControlLabel value="token" control={<Radio onChange={() => viewAuth('token')}/>}
                              label="Token"/>
            <Collapse in={expanded.token} timeout={300} unmountOnExit>
              {expanded.token && renderAuth(inputs.repo_authentication)}
            </Collapse>
            <FormControlLabel value="key" control={<Radio onChange={() => viewAuth('key')}/>}
                              label="Private Key"/>
            <Collapse in={expanded.key} timeout={300} unmountOnExit>
              {expanded.key && renderAuth(inputs.repo_authentication)}
            </Collapse>
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel htmlFor="repo_remote_branch">Branch</InputLabel>
          <Input id="repo_remote_branch" name="repo_remote_branch" onChange={handleInputChange}
                 value={inputs.repo_remote_branch}/>
          <FormHelperText>{labels[type].repo_remote_branch_label}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth error={(submitted && !inputs.repo_remote_name && inputs.push_site)}>
          <InputLabel required htmlFor="repo_remote_name">Git Remote Name</InputLabel>
          <Input id="repo_remote_name" name="repo_remote_name" onChange={handleInputChange}
                 value={inputs.repo_remote_name}/>
          <FormHelperText>{labels[type].repo_remote_name_label}</FormHelperText>
        </FormControl>
      </Grid>
    </Grid>
  )
}

export default GitForm;
