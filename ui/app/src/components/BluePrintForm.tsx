import React, { useEffect } from 'react';
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from '@material-ui/core/Grid';
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Collapse from '@material-ui/core/Collapse';
import GitForm from "./GitForm";

const useStyles = makeStyles(theme => ({
  form: {
    maxWidth: '600px',
    margin: 'auto',
    paddingBottom: '20px'
  }
}));

function BluePrintForm(props: any) {
  const classes = useStyles({});
  const {inputs, setInputs, submitted, onSubmit, swipeableViews, blueprint} = props;

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
        {blueprint.id !== 'GIT' && <Grid item xs={12}>
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
        </Grid>}

        <Collapse in={inputs.push_site} timeout={300} unmountOnExit>
          {inputs.push_site &&
          <GitForm inputs={inputs} type="push" submitted={submitted} handleInputChange={handleInputChange}/>
          }
        </Collapse>
        {blueprint.id === 'GIT' &&
        <GitForm type="clone" inputs={inputs} submitted={submitted} handleInputChange={handleInputChange}/>}
      </Grid>
    </form>
  )
}

export default BluePrintForm;
