/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import { DuplicateSiteState, LookupTable } from '../../models';
import Grid from '@mui/material/Grid';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import React, { useEffect, useState } from 'react';
import { fetchAll } from '../../services/sites';
import {
  cleanupGitBranch,
  cleanupSiteId,
  getSiteIdFromSiteName,
  siteIdExist,
  siteNameExist
} from '../CreateSiteDialog/utils';
import BaseSiteForm from '../CreateSiteDialog/BaseSiteForm';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

interface DuplicateFormProps {
  site: DuplicateSiteState;
  fieldsErrorsLookup: LookupTable<boolean>;
  sourceSiteHasBlobStores: boolean;
  setSite: (site: Partial<DuplicateSiteState>) => void;
  onSubmit: (event) => void;
}

export function DuplicateForm(props: DuplicateFormProps) {
  const { site, fieldsErrorsLookup, sourceSiteHasBlobStores, setSite, onSubmit } = props;
  const [sites, setSites] = useState(null);

  useEffect(() => {
    if (sites === null) {
      fetchAll({ limit: 1000, offset: 0 }).subscribe(setSites);
    }
  }, [sites]);

  const onKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onSubmit(event);
    }
  };

  function checkSites(event: any) {
    setSite({ siteIdExist: siteIdExist(sites, event.target.value) });
  }

  function checkSiteNames(event: any) {
    setSite({ siteNameExist: siteNameExist(sites, event.target.value) });
  }

  const handleInputChange = (e: any) => {
    e.persist?.();
    if (e.target.name === 'sourceSiteId') {
      setSite({ [e.target.name]: e.target.value, ...(sourceSiteHasBlobStores && { readOnlyBlobStores: true }) });
    } else if (e.target.name === 'siteId') {
      const invalidSiteId =
        e.target.value.startsWith('0') || e.target.value.startsWith('-') || e.target.value.startsWith('_');
      const siteId = cleanupSiteId(e.target.value);
      setSite({
        [e.target.name]: siteId,
        invalidSiteId: invalidSiteId
      });
    } else if (e.target.name === 'siteName') {
      const currentSiteNameParsed = getSiteIdFromSiteName(site.siteName);

      // if current siteId has been edited directly (different to siteName processed)
      // or if siteId is empty -> do not change it.
      if (site.siteId === currentSiteNameParsed || site.siteId === '') {
        const siteId = getSiteIdFromSiteName(e.target.value);
        const invalidSiteId = siteId.startsWith('0') || siteId.startsWith('-') || siteId.startsWith('_');
        const siteIdExist = Boolean(sites.find((site: any) => site.id === siteId));
        setSite({
          [e.target.name]: e.target.value,
          siteId,
          invalidSiteId,
          siteIdExist
        });
      } else {
        setSite({ [e.target.name]: e.target.value });
      }
    } else if (e.target.name === 'gitBranch') {
      setSite({ [e.target.name]: cleanupGitBranch(e.target.value) });
    } else if (e.target.type === 'checkbox') {
      setSite({ [e.target.name]: e.target.checked });
    } else {
      setSite({ [e.target.name]: e.target.value });
    }
  };

  return (
    <Box component="form" sx={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} data-field-id="sourceSiteId">
          <FormControl fullWidth>
            <InputLabel>
              <FormattedMessage defaultMessage="Project" />
            </InputLabel>
            <Select
              value={site.sourceSiteId}
              id="sourceSiteId"
              name="sourceSiteId"
              required
              label={<FormattedMessage defaultMessage="Project" />}
              onChange={handleInputChange}
              error={site.submitted && fieldsErrorsLookup['sourceSiteId']}
            >
              <MenuItem value="">Select project</MenuItem>
              {sites?.map((siteObj) => (
                <MenuItem key={siteObj.uuid} value={siteObj.id}>
                  {siteObj.name}
                </MenuItem>
              ))}
            </Select>
            {site.submitted && !site.sourceSiteId && (
              <FormHelperText error>
                <FormattedMessage defaultMessage="Source project is required" />
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
        <BaseSiteForm
          inputs={site}
          fieldsErrorsLookup={fieldsErrorsLookup}
          checkSites={checkSites}
          checkSiteNames={checkSiteNames}
          handleInputChange={handleInputChange}
          onKeyPress={onKeyPress}
        />
        {sourceSiteHasBlobStores && (
          <Grid item xs={12} data-field-id="readOnlyBlobStores">
            <FormControlLabel
              control={
                <Switch
                  name="readOnlyBlobStores"
                  checked={site.readOnlyBlobStores}
                  color="primary"
                  onChange={handleInputChange}
                />
              }
              label={<FormattedMessage defaultMessage="Read-only Blob Stores" />}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default DuplicateForm;
