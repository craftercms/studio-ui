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
import { Blueprint } from "../models/Blueprint";
import { SiteState } from '../models/Site';

const useStyles = makeStyles(theme => ({
  form: {
    maxWidth: '600px',
    margin: 'auto',
    paddingBottom: '20px'
  }
}));

interface BluePrintForm {
  inputs: SiteState,

  setInputs(state: SiteState): any,

  onSubmit(event: any): any,

  swipeableViews: any,
  blueprint: Blueprint,

  onCheckNameExist(event: any): any
}

function BluePrintForm(props: BluePrintForm) {
  const classes = useStyles({});
  const {inputs, setInputs, onSubmit, swipeableViews, blueprint, onCheckNameExist} = props;

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
      setInputs({...inputs, [e.target.name]: e.target.checked});
    } else if (e.target.name === 'siteId') {
      setInputs({...inputs, [e.target.name]: e.target.value.replace(/\s+/g, "")});
    } else {
      setInputs({...inputs, [e.target.name]: e.target.value});
    }
  };

  return (
    <form className={classes.form} onSubmit={e => onSubmit(e)}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <FormControl fullWidth error={((inputs.submitted && !inputs.siteId) || inputs.siteIdExist)}>
            <InputLabel required htmlFor="siteId">Site ID</InputLabel>
            <Input id="siteId" name="siteId" onBlur={e => {
              onCheckNameExist(e)
            }} onChange={e => {
              handleInputChange(e)
            }} value={inputs.siteId}/>
            <FormHelperText>Max length: 50 characters, consisting of: lowercase letters, numbers, dash (-) and
              underscore (_)</FormHelperText>
            {inputs.siteIdExist && <FormHelperText>The name already exist.</FormHelperText>}
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
          <GitForm inputs={inputs} type="push" handleInputChange={handleInputChange}/>
          }
        </Collapse>
        {blueprint.id === 'GIT' &&
        <GitForm type="clone" inputs={inputs} handleInputChange={handleInputChange}/>}
      </Grid>
    </form>
  )
}

export default BluePrintForm;
