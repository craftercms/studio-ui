import React, { useEffect } from 'react';
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Collapse from '@material-ui/core/Collapse';
import GitForm from "./GitForm";
import { Blueprint } from "../models/Blueprint";
import { SiteState } from '../models/Site';
import { defineMessages, useIntl } from "react-intl";

const useStyles = makeStyles(() => ({
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

const messages = defineMessages({
  siteId: {
    id: 'CreateSiteDialog.siteId',
    defaultMessage: 'Side ID'
  },
  description: {
    id: 'CreateSiteDialog.description',
    defaultMessage: 'Description'
  },
  siteFormat: {
    id: 'CreateSiteDialog.siteFormat',
    defaultMessage: 'Max length: 50 characters, consisting of: lowercase letters, numbers, dash (-) and underscore (_)'
  },
  nameExist: {
    id: 'CreateSiteDialog.nameExist',
    defaultMessage: 'The name already exist'
  },
  pushSiteToRemote: {
    id: 'CreateSiteDialog.pushSiteToRemote',
    defaultMessage: 'Push the site to a remote Git repository after creation'
  },
  descriptionMaxLength: {
    id: 'CreateSiteDialog.descriptionMaxLength',
    defaultMessage: 'Max length: 4000 characters'
  },
});

function BluePrintForm(props: BluePrintForm) {
  const classes = useStyles({});
  const {inputs, setInputs, onSubmit, swipeableViews, blueprint, onCheckNameExist} = props;
  const { formatMessage } = useIntl();

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
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            id="siteId"
            name="siteId"
            label={formatMessage(messages.siteId)}
            variant="outlined"
            required
            fullWidth
            onBlur={onCheckNameExist}
            onChange={handleInputChange}
            value={inputs.siteId}
            error={((inputs.submitted && !inputs.siteId) || inputs.siteIdExist)}
            helperText={!inputs.siteIdExist ? formatMessage(messages.siteFormat) : formatMessage(messages.nameExist)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="description"
            fullWidth
            name="description"
            label={formatMessage(messages.description)}
            variant="outlined"
            multiline
            onChange={handleInputChange}
            value={inputs.description}
            inputProps={{maxLength: 4000}}
            helperText={formatMessage(messages.descriptionMaxLength)}
          />
        </Grid>
        {
          (blueprint.id !== 'GIT') &&
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
                  label={formatMessage(messages.pushSiteToRemote)}
              />
          </Grid>
        }
        <Collapse in={inputs.push_site} timeout={300} unmountOnExit>
          {
            inputs.push_site &&
            <GitForm inputs={inputs} type="push" handleInputChange={handleInputChange}/>
          }
        </Collapse>
        {
          (blueprint.id === 'GIT') &&
          <GitForm type="clone" inputs={inputs} handleInputChange={handleInputChange}/>
        }
      </Grid>
    </form>
  )
}

export default BluePrintForm;
