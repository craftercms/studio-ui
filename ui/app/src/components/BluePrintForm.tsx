import React, { useEffect, useState } from 'react';
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from '@material-ui/core/Grid';
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import Collapse from '@material-ui/core/Collapse';
import clsx from 'clsx';
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

const useStyles = makeStyles(theme => ({
  form: {
    maxWidth: '600px',
    margin: 'auto',
    paddingBottom: '20px'
  },
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

function BluePrintForm(props: any) {
  const classes = useStyles({});
  const {inputs, setInputs, submitted, onSubmit, swipeableViews} = props;
  const [expanded, setExpanded] = useState({
    basic: false,
    token: false,
    key: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(
    () => {
      if (swipeableViews) {
        const timer = setTimeout(() => swipeableViews.current.updateHeight(), 300);
        return () => clearTimeout(timer);
      }
    },
    // eslint-disable-next-line
    [inputs.push_site, inputs.repo_authentication],
  );

  const handleInputChange = (e: any) => {
    e.persist();
    if (e.target.type === 'checkbox') {
      setInputs((inputs: any) => ({...inputs, [e.target.name]: e.target.checked}));
    } else {
      setInputs((inputs: any) => ({...inputs, [e.target.name]: e.target.value}));
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
  }

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
            value={inputs.repo_username}
            onChange={handleInputChange}
        />}
        {(type === 'basic') && <TextField
            id='repo_password'
            name='repo_password'
            className={clsx(classes.margin, classes.textField)}
            type={showPassword ? 'text' : 'password'}
            label='Password'
            value={inputs.repo_password}
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
        {(type === 'token') && <TextField
            id='repo_token'
            name='repo_token'
            className={clsx(classes.margin, classes.textField)}
            type={showPassword ? 'text' : 'password'}
            label='Token'
            value={inputs.repo_token}
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
                multiline
                rows="3"
                className={classes.margin}
                onChange={handleInputChange}
                value={inputs.repo_key}
            />
        </FormControl>}
      </div>
    )
  }

  return (
    <form className={classes.form} onSubmit={e => onSubmit(e)}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <FormControl fullWidth error={(submitted && !inputs.siteId)}>
            <InputLabel required htmlFor="siteId">Site ID</InputLabel>
            <Input id="siteId" name="siteId" onChange={handleInputChange} value={inputs.siteId}/>
            <FormHelperText>Max length: 50 characters, consisting of: lowercase letters, numbers, dash (-) and
              underscore (_)</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <TextField
              id="description"
              name="description"
              label="Description"
              multiline
              rows="4"
              margin="normal"
              onChange={handleInputChange}
              value={inputs.description}
              inputProps={{maxLength: 4000}}
              helperText="Max length: 4000 characters"
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name="push_site"
                checked={inputs.push_site}
                onChange={handleInputChange}
                color="primary"
              />
            }
            label="Push the site to a remote Git repository after creation"
          />
        </Grid>

        <Collapse in={inputs.push_site} timeout={300} unmountOnExit>
          {inputs.push_site &&
            <Grid container spacing={1} className={classes.gitInfo}>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel required htmlFor="repo_url">Repo URL</InputLabel>
                        <Input id="repo_url" name="repo_url" onChange={handleInputChange} value={inputs.repo_url}
                               placeholder={"e.g. https://github.com/craftercms/craftercms-react-blueprint.git"}/>
                        <FormHelperText>The git repository URL to push.</FormHelperText>
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
                        <InputLabel required htmlFor="repo_remote_branch">Branch</InputLabel>
                        <Input id="repo_remote_branch" name="repo_remote_branch" onChange={handleInputChange}
                               value={inputs.repo_remote_branch}/>
                        <FormHelperText>The site will get created pushing that branch to the repo.</FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel required htmlFor="repo_name">Git Repo Name</InputLabel>
                        <Input id="repo_name" name="repo_name" onChange={handleInputChange} value={inputs.repo_name}/>
                        <FormHelperText>Name the remote that will refer to the source repo to push. Typically named
                            “upstream” or “origin”.</FormHelperText>
                    </FormControl>
                </Grid>
            </Grid>}
        </Collapse>
      </Grid>
    </form>
  )
}

export default BluePrintForm;
