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

import React, { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import Grid from '@mui/material/Grid';
import GitForm from './GitForm';
import { LookupTable, MarketplacePlugin, SiteState } from '../../models';
import { FormattedMessage, useIntl } from 'react-intl';
import PluginFormEngine from '../PluginFormBuilder';
import { fetchAll } from '../../services/sites';
import { cleanupGitBranch, cleanupSiteId, getSiteIdFromSiteName, siteIdExist, siteNameExist } from './utils';
import BaseSiteForm from './BaseSiteForm';

const useStyles = makeStyles()(() => ({
  form: {
    maxWidth: '600px',
    margin: '0 auto'
  }
}));

interface BlueprintFormProps {
  inputs: SiteState;
  blueprint: MarketplacePlugin;
  classes?: {
    root?: string;
  };
  fieldsErrorsLookup: LookupTable<boolean>;

  setInputs(state: any): any;

  onSubmit(event: any): any;

  onCheckNameExist(siteId: string): any;
}

export function renderSiteFormHelperText(
  name: string,
  value: string = '',
  helperText: string,
  required: boolean,
  submitted: boolean,
  siteIdExist: boolean
) {
  if (value.startsWith('0') || value.startsWith('-') || value.startsWith('_')) {
    return (
      <FormattedMessage
        id="createSiteDialog.cantStart"
        defaultMessage="Project names may not start with zeros, dashes (-) or underscores (_)."
      />
    );
  }
  if (siteIdExist) {
    return <FormattedMessage id="createSiteDialog.idExist" defaultMessage="The ID already exists." />;
  } else if (required && !value && submitted) {
    return <FormattedMessage id="createSiteDialog.required" defaultMessage="{name} is required." values={{ name }} />;
  } else {
    return helperText;
  }
}

function BlueprintForm(props: BlueprintFormProps) {
  const { classes, cx } = useStyles();
  const { inputs, setInputs, onSubmit, blueprint, onCheckNameExist, classes: classesProp, fieldsErrorsLookup } = props;
  const [sites, setSites] = useState(null);
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (sites === null) {
      fetchAll({ limit: 1000, offset: 0 }).subscribe(setSites);
    }
  }, [sites]);

  const handleInputChange = (e: any, type?: string) => {
    e.persist();
    if (e.target.type === 'checkbox') {
      setInputs({ [e.target.name]: e.target.checked, submitted: false });
    } else if (e.target.name === 'siteId') {
      const invalidSiteId =
        e.target.value.startsWith('0') || e.target.value.startsWith('-') || e.target.value.startsWith('_');
      setInputs({
        [e.target.name]: cleanupSiteId(e.target.value),
        invalidSiteId: invalidSiteId
      });
    } else if (e.target.name === 'siteName') {
      const currentSiteNameParsed = getSiteIdFromSiteName(inputs.siteName);

      // if current siteId has been edited directly (different to siteName processed)
      // or if siteId is empty -> do not change it.
      if (inputs.siteId === currentSiteNameParsed || inputs.siteId === '') {
        const siteId = getSiteIdFromSiteName(e.target.value);
        const invalidSiteId = siteId.startsWith('0') || siteId.startsWith('-') || siteId.startsWith('_');
        const siteIdExist = Boolean(sites.find((site: any) => site.id === siteId));
        setInputs({
          [e.target.name]: e.target.value,
          siteId,
          invalidSiteId,
          siteIdExist
        });
      } else {
        setInputs({ [e.target.name]: e.target.value });
      }
    } else if (type === 'fields') {
      let parameters = { ...inputs.blueprintFields, [e.target.name]: e.target.value };
      setInputs({ blueprintFields: parameters });
    } else if (e.target.name === 'gitBranch') {
      setInputs({ [e.target.name]: cleanupGitBranch(e.target.value) });
    } else if (e.target.name === 'repoUrl') {
      const escapedValue = e.target.value.replace(/\s+/g, '');
      setInputs({ [e.target.name]: escapedValue });
    } else {
      setInputs({ [e.target.name]: e.target.value });
    }
  };

  const onKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onSubmit(event);
    }
  };

  function checkSites(event: any) {
    setInputs({ siteIdExist: siteIdExist(sites, event.target.value) });
  }

  function checkSiteNames(event: any) {
    setInputs({ siteNameExist: siteNameExist(sites, event.target.value) });
  }

  return (
    <form className={cx(classes.form, classesProp?.root)}>
      <Grid container spacing={3}>
        <BaseSiteForm
          inputs={inputs}
          fieldsErrorsLookup={fieldsErrorsLookup}
          checkSites={checkSites}
          checkSiteNames={checkSiteNames}
          handleInputChange={handleInputChange}
          onKeyPress={onKeyPress}
          onBlur={() => onCheckNameExist(inputs.siteId)}
        />
        {blueprint.parameters && (
          <PluginFormEngine
            parameters={blueprint.parameters}
            handleInputChange={handleInputChange}
            submitted={inputs.submitted}
            fields={inputs.blueprintFields}
            onKeyPress={onKeyPress}
          />
        )}
        {blueprint.id === 'GIT' && (
          <GitForm
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
