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

import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Collapse from '@material-ui/core/Collapse';
import GitForm from './GitForm';
import { Blueprint } from '../../../../models/Blueprint';
import { SiteState } from '../../../../models/Site';
import { defineMessages, useIntl } from 'react-intl';
import FormBuilder from './FormBuilder';
import { fetchSites } from '../../../../services/sites';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  form: {
    maxWidth: '600px',
    margin: '0 auto'
  },
  helpText: {
    transition: `color .5s`
  },
  muted: {
    color: theme.palette.text.secondary
  }
}));

interface BlueprintFormProps {
  inputs: SiteState;
  blueprint: Blueprint;
  classes?: {
    root?: string;
  };

  setInputs(state: any): any;

  onSubmit(event: any): any;

  onCheckNameExist(siteId: string): any;
}

const messages = defineMessages({
  siteId: {
    id: 'createSiteDialog.siteId',
    defaultMessage: 'Site ID'
  },
  siteName: {
    id: 'createSiteDialog.siteName',
    defaultMessage: 'Site Name'
  },
  description: {
    id: 'createSiteDialog.description',
    defaultMessage: 'Description'
  },
  siteFormat: {
    id: 'createSiteDialog.siteFormat',
    defaultMessage: 'Max length: 50 characters, consisting of: lowercase letters, numbers & dash (-).'
  },
  idExist: {
    id: 'createSiteDialog.idExist',
    defaultMessage: 'The ID already exists.'
  },
  nameExist: {
    id: 'createSiteDialog.nameExist',
    defaultMessage: 'The name already exists.'
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
  createAsOrphanHelpText: {
    id: 'createSiteDialog.createAsOrphanHelpText',
    defaultMessage:
      'Creating the site as an orphan will dissociate the site from the source git repository and remove all history.'
  }
});

function BlueprintForm(props: BlueprintFormProps) {
  const classes = useStyles({});
  const { inputs, setInputs, onSubmit, blueprint, onCheckNameExist, classes: classesProp } = props;
  const [sites, setSites] = useState(null);
  const { formatMessage } = useIntl();
  const maxLength = 4000;
  const siteNameMaxLength = 255;
  const siteIdMaxLength = 50;

  useEffect(() => {
    if (sites === null) {
      fetchSites().subscribe(setSites);
    }
  }, [sites]);

  const handleInputChange = (e: any, type?: string) => {
    e.persist();
    if (e.target.type === 'checkbox') {
      setInputs({ [e.target.name]: e.target.checked, submitted: false });
    } else if (e.target.name === 'siteId') {
      const invalidSiteId =
        e.target.value.startsWith('0') || e.target.value.startsWith('-') || e.target.value.startsWith('_');
      const siteId = e.target.value
        .replace(/[^a-zA-Z0-9-_]/g, '')
        .replace(/_/g, '-')
        .toLowerCase();
      setInputs({
        [e.target.name]: siteId,
        invalidSiteId: invalidSiteId
      });
    } else if (e.target.name === 'siteName') {
      const currentSiteNameParsed = getSiteId(inputs.siteName);

      // if current siteId has been edited directly (different to siteName processed)
      // or if siteId is empty -> do not change it.
      if (inputs.siteId === currentSiteNameParsed || inputs.siteId === '') {
        const siteId = getSiteId(e.target.value);
        const invalidSiteId = siteId.startsWith('0') || siteId.startsWith('-') || siteId.startsWith('_');
        setInputs({
          [e.target.name]: e.target.value,
          siteId,
          invalidSiteId
        });
      } else {
        setInputs({ [e.target.name]: e.target.value });
      }
    } else if (type === 'blueprintFields') {
      let parameters = { ...inputs.blueprintFields, [e.target.name]: e.target.value };
      setInputs({ blueprintFields: parameters });
    } else {
      setInputs({ [e.target.name]: e.target.value });
    }
  };

  const onKeyPress = (event: React.KeyboardEvent) => {
    if (event.charCode === 13) {
      onSubmit(event);
    }
  };

  function checkSites(event: any) {
    if (sites && sites.find((site: any) => site.id === event.target.value)) {
      setInputs({ siteIdExist: true });
    } else {
      setInputs({ siteIdExist: false });
    }
  }

  function checkSiteNames(event: any) {
    if (sites && sites.find((site: any) => site.name === event.target.value)) {
      setInputs({ siteNameExist: true });
    } else {
      setInputs({ siteNameExist: false });
    }
  }

  function renderHelperText(
    name: string,
    value: string = '',
    helperText: string,
    required: boolean,
    submitted: boolean,
    siteIdExist: boolean
  ) {
    if (value.startsWith('0') || value.startsWith('-') || value.startsWith('_')) {
      return formatMessage(messages.cantStart);
    }
    if (siteIdExist) {
      return formatMessage(messages.idExist);
    } else if (required && !value && submitted) {
      return formatMessage(messages.required, { name: name });
    } else {
      return helperText;
    }
  }

  function getSiteId(siteName: string): string {
    let siteId = siteName
      .replace(/[^a-zA-Z0-9_\s]/g, '')
      .replace(/[_\s]/g, '-')
      .toLowerCase();
    if (siteId.startsWith('0') || siteId.startsWith('-') || siteId.startsWith('_')) {
      siteId = siteId.replace(/0|-|_/, '');
    }

    // Site id max length differs from the site name max length, so the id needs to be trimmed to
    // its max length
    return siteId.substring(0, siteIdMaxLength);
  }

  return (
    <form className={clsx(classes.form, classesProp?.root)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            id="siteName"
            name="siteName"
            label={formatMessage(messages.siteName)}
            required
            autoFocus
            fullWidth
            onBlur={(event) => checkSiteNames(event)}
            onKeyPress={onKeyPress}
            onKeyUp={(event) => checkSiteNames(event)}
            onChange={(event) => handleInputChange(event)}
            value={inputs.siteName}
            inputProps={{ maxLength: siteNameMaxLength }}
            error={(inputs.submitted && !inputs.siteName) || inputs.siteNameExist}
            helperText={
              inputs.submitted && !inputs.siteName
                ? formatMessage(messages.required, { name: formatMessage(messages.siteName) })
                : inputs.siteNameExist
                ? formatMessage(messages.nameExist)
                : ''
            }
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="siteId"
            name="siteId"
            label={formatMessage(messages.siteId)}
            required
            fullWidth
            onBlur={() => onCheckNameExist(inputs.siteId)}
            onKeyPress={onKeyPress}
            onKeyUp={(event) => checkSites(event)}
            onChange={(event) => handleInputChange(event)}
            value={inputs.siteId}
            inputProps={{ maxLength: siteIdMaxLength }}
            error={(inputs.submitted && !inputs.siteId) || inputs.siteIdExist || inputs.invalidSiteId}
            helperText={renderHelperText(
              formatMessage(messages.siteId),
              inputs.siteId,
              formatMessage(messages.siteFormat),
              true,
              inputs.submitted,
              inputs.siteIdExist
            )}
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
            InputLabelProps={{ shrink: true }}
            placeholder={'master'}
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
            inputProps={{ maxLength: maxLength }}
            helperText={formatMessage(messages.descriptionMaxLength, { maxLength: maxLength })}
          />
        </Grid>
        {blueprint.id === 'GIT' && (
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
            <Typography
              variant="subtitle2"
              component="small"
              className={`${classes.helpText} ${inputs.createAsOrphan ? '' : classes.muted}`}
            >
              {formatMessage(messages.createAsOrphanHelpText)}
            </Typography>
          </Grid>
        )}
        {blueprint.parameters && (
          <FormBuilder
            parameters={blueprint.parameters}
            handleInputChange={handleInputChange}
            inputs={inputs}
            onKeyPress={onKeyPress}
          />
        )}
        {blueprint.id !== 'GIT' && blueprint.source !== 'GIT' && (
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
        )}
        <Collapse in={inputs.pushSite} timeout={300}>
          {inputs.pushSite && blueprint.source !== 'GIT' && (
            <GitForm
              inputs={inputs}
              setInputs={setInputs}
              type="push"
              handleInputChange={handleInputChange}
              onKeyPress={onKeyPress}
            />
          )}
        </Collapse>
        {blueprint.id === 'GIT' && (
          <GitForm
            type="clone"
            inputs={inputs}
            setInputs={setInputs}
            handleInputChange={handleInputChange}
            onKeyPress={onKeyPress}
          />
        )}
      </Grid>
    </form>
  );
}

export default BlueprintForm;
