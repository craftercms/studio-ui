/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useEffect, useState } from 'react';
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Collapse from '@material-ui/core/Collapse';
import GitForm from "./GitForm";
import { Blueprint } from "../models/Blueprint";
import { SiteState } from '../models/Site';
import { defineMessages, useIntl } from "react-intl";
import FormBuilder from "./FormBuilder";
import { fetchSites } from '../services/sites';
import Switch from "@material-ui/core/Switch";

const useStyles = makeStyles(() => ({
  form: {
    maxWidth: '600px',
    margin: 'auto',
  }
}));

interface BlueprintForm {
  inputs: SiteState;
  setInputs(state: SiteState): any;
  onSubmit(event: any): any;
  swipeableViews: any;
  blueprint: Blueprint;
  onCheckNameExist(event: any): any;
}

const messages = defineMessages({
  siteId: {
    id: 'createSiteDialog.siteId',
    defaultMessage: 'Site ID'
  },
  description: {
    id: 'createSiteDialog.description',
    defaultMessage: 'Description'
  },
  siteFormat: {
    id: 'createSiteDialog.siteFormat',
    defaultMessage: 'Max length: 50 characters, consisting of: lowercase letters, numbers, dash (-) and underscore (_).'
  },
  nameExist: {
    id: 'createSiteDialog.nameExist',
    defaultMessage: 'The name already exist.'
  },
  pushSiteToRemote: {
    id: 'createSiteDialog.pushSiteToRemote',
    defaultMessage: 'Push the site to a remote Git repository after creation'
  },
  descriptionMaxLength: {
    id: 'createSiteDialog.descriptionMaxLength',
    defaultMessage: 'Max length: {maxLength} characters.'
  },
  required: {
    id: 'createSiteDialog.required',
    defaultMessage: '{name} is required.'
  },
  cantStart: {
    id: 'createSiteDialog.cantStart',
    defaultMessage: 'Site names may not start with zeros, dashes (-) or underscores (_).'
  },
  sandboxBranch: {
    id: 'createSiteDialog.sandboxBranch',
    defaultMessage: 'Sandbox Branch'
  },
  createAsOrphan: {
    id: 'createSiteDialog.createAsOrphan',
    defaultMessage: 'Create the site from a remote repository as orphan (no git history)'
  },

});

function BlueprintForm(props: BlueprintForm) {
  const classes = useStyles({});
  const {inputs, setInputs, onSubmit, blueprint, onCheckNameExist} = props;
  const [sites, setSites] = useState(null);
  const [expanded, setExpanded] = useState({
    basic: false,
    token: false,
    key: false,
  });
  const { formatMessage } = useIntl();
  const maxLength = 4000;

  useEffect(
    () => {
      if(sites === null) {
        fetchSites()
          .subscribe(
            ({response}) => {
              setSites(response.sites);
            }
          );
      }
    },
    // eslint-disable-next-line
    []
  );

  const handleInputChange = (e: any, type?:string) => {
    e.persist();
    if (e.target.type === 'checkbox') {
      setInputs({...inputs, [e.target.name]: e.target.checked, submitted: false});
    } else if (e.target.name === 'siteId') {
      const invalidSiteId = (e.target.value.startsWith('0') || e.target.value.startsWith('-') || e.target.value.startsWith('_'));
      setInputs({
        ...inputs,
        [e.target.name]: e.target.value.replace(/[^a-zA-Z0-9-_]/g, "").toLowerCase(),
        invalidSiteId: invalidSiteId
      });
    } else if (type === 'blueprintFields') {
      let parameters = {...inputs.blueprintFields, [e.target.name]: e.target.value };
      setInputs({...inputs, blueprintFields: parameters});
    } else {
      setInputs({...inputs, [e.target.name]: e.target.value});
    }
  };

  const onKeyPress = (event: React.KeyboardEvent) => {
    if (event.charCode === 13) {
      onSubmit(event);
    }
  };

  function checkSites(event:any) {
    if(sites.find((site:any) => site.siteId === event.target.value)){
      setInputs({...inputs, siteIdExist: true});
    } else {
      setInputs({...inputs, siteIdExist: false});
    }
  }

  function renderHelperText(name:string, value:string = '', helperText:string, required:boolean, submitted:boolean, siteIdExist: boolean) {
    if(value.startsWith('0') || value.startsWith('-') || value.startsWith('_')){
      return formatMessage(messages.cantStart)
    }
    if(siteIdExist){
      return formatMessage(messages.nameExist)
    } else if(required && !value && submitted) {
      return formatMessage(messages.required, {name: name})
    } else {
      return helperText;
    }
  }

  return (
    <form className={classes.form}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            id="siteId"
            name="siteId"
            label={formatMessage(messages.siteId)}
            required
            autoFocus={true}
            fullWidth
            onBlur={onCheckNameExist}
            onKeyPress={onKeyPress}
            onKeyUp={event => checkSites(event)}
            onChange={(event) => handleInputChange(event)}
            value={inputs.siteId}
            inputProps={{maxLength: 50}}
            error={((inputs.submitted && !inputs.siteId) || inputs.siteIdExist || inputs.invalidSiteId)}
            helperText={
              renderHelperText(
                formatMessage(messages.siteId),
                inputs.siteId,
                formatMessage(messages.siteFormat),
                true,
                inputs.submitted,
                inputs.siteIdExist)
            }
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="sandboxBranch"
            name="sandboxBranch"
            label={formatMessage(messages.sandboxBranch)}
            fullWidth
            onKeyPress={onKeyPress}
            onChange={(event) => handleInputChange(event)}
            InputLabelProps={{shrink: true}}
            placeholder={"master"}
            value={inputs.sandboxBranch}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="description"
            fullWidth
            name="description"
            label={formatMessage(messages.description)}
            multiline
            onChange={(event) => handleInputChange(event)}
            value={inputs.description}
            inputProps={{maxLength: maxLength}}
            helperText={formatMessage(messages.descriptionMaxLength, { maxLength: maxLength})}
          />
        </Grid>
        {
          (blueprint.id === 'GIT') &&
          <Grid item xs={12}>
              <FormControlLabel
                  control={
                    <Switch
                      name="createAsOrphan"
                      checked={inputs.createAsOrphan}
                      onChange={(event) => handleInputChange(event)}
                      color="primary"
                    />
                  }
                  label={formatMessage(messages.createAsOrphan)}
              />
          </Grid>
        }
        {
          blueprint.parameters &&
          <FormBuilder parameters={blueprint.parameters} handleInputChange={handleInputChange} inputs={inputs} onKeyPress={onKeyPress}/>
        }
        {
          (blueprint.id !== 'GIT' && blueprint.source !== 'GIT') &&
          <Grid item xs={12}>
              <FormControlLabel
                  control={
                    <Switch
                      name="pushSite"
                      checked={inputs.pushSite}
                      onChange={(event) => handleInputChange(event)}
                      color="primary"
                    />
                  }
                  label={formatMessage(messages.pushSiteToRemote)}
              />
          </Grid>
        }
        <Collapse in={inputs.pushSite} timeout={300}>
          {
            (inputs.pushSite && blueprint.source !== 'GIT') &&
            <GitForm inputs={inputs} expanded={expanded} setExpanded={setExpanded} type="push" handleInputChange={handleInputChange} onKeyPress={onKeyPress}/>
          }
        </Collapse>
        {
          (blueprint.id === 'GIT') &&
          <GitForm type="clone" inputs={inputs} expanded={expanded} setExpanded={setExpanded} handleInputChange={handleInputChange} onKeyPress={onKeyPress}/>
        }
      </Grid>
    </form>
  )
}

export default BlueprintForm;
