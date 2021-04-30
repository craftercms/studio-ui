/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import * as React from 'react';
import { createStyles, makeStyles } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import { FormattedMessage } from 'react-intl';
import TextField from '@material-ui/core/TextField/TextField';
import Select from '@material-ui/core/Select/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextFieldWithMax from '../Controls/TextFieldWithMax';
import Grid from '@material-ui/core/Grid';
import { PublishFormData, PublishOnDemandMode } from '../../models/Publishing';

const useStyles = makeStyles(() =>
  createStyles({
    formHelperText: {
      marginLeft: '5px'
    }
  })
);

interface PublishOnDemandFormProps {
  mode: PublishOnDemandMode;
  formData: PublishFormData;
  setFormData(data): void;
}

export default function PublishOnDemandForm(props: PublishOnDemandFormProps) {
  const { formData, setFormData, mode } = props;
  const classes = useStyles();

  const handleFormChange = (name: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
    setFormData({ [name]: event.target.value });
  };

  return (
    <form>
      <Grid container spacing={3}>
        <Grid item md={8}>
          <FormControl fullWidth>
            <TextField
              value={mode === 'studio' ? formData.path : formData.commitIds}
              label={
                mode === 'studio' ? (
                  <FormattedMessage id="bulkPublish.formPathLabel" defaultMessage="Path to Publish" />
                ) : (
                  <FormattedMessage id="bulkPublish.formPathLabel" defaultMessage="Commit or tag IDs" />
                )
              }
              variant="outlined"
              fullWidth
              required
              helperText={
                mode === 'studio' ? (
                  <FormattedMessage
                    id="bulkPublish.formPathExample"
                    defaultMessage="e.g. /site/website/about/index.xml"
                  />
                ) : (
                  <FormattedMessage
                    id="bulkPublish.formPathExample"
                    defaultMessage="You may enter multiple separate by comma"
                  />
                )
              }
              FormHelperTextProps={{
                className: classes.formHelperText
              }}
              onChange={handleFormChange(mode === 'studio' ? 'path' : 'commitIds')}
            />
          </FormControl>
        </Grid>
        <Grid item md={4}>
          <FormControl fullWidth>
            {/* TODO: pending to retrieve */}
            <Select value={formData.environment} required onChange={handleFormChange('environment')}>
              <MenuItem value={'live'}>Live</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <TextFieldWithMax
              value={formData.comment}
              label={<FormattedMessage id="bulkPublish.submissionComment" defaultMessage="Submission Comment" />}
              fullWidth
              multiline
              onChange={handleFormChange('comment')}
            />
          </FormControl>
        </Grid>
      </Grid>
    </form>
  );
}
