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

import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField/TextField';
import { FormattedMessage } from 'react-intl';
import Select from '@material-ui/core/Select/Select';
import MenuItem from '@material-ui/core/MenuItem';
import * as React from 'react';
import TextFieldWithMax from '../Controls/TextFieldWithMax';
import { createStyles, makeStyles } from '@material-ui/core';
import { BulkPublishFormData } from '../../models/Publishing';

const useStyles = makeStyles(() =>
  createStyles({
    formControl: {
      marginBottom: '23px'
    }
  })
);

type BulkPublishFormProps = {
  formData: BulkPublishFormData;
  setFormData(data): void;
};

export default function BulkPublishForm(props: BulkPublishFormProps) {
  const { formData, setFormData } = props;
  const classes = useStyles();

  const handleFormChange = (name: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
    setFormData({ [name]: event.target.value });
  };

  return (
    <form>
      <FormControl fullWidth className={classes.formControl}>
        <TextField
          value={formData.path}
          label={<FormattedMessage id="bulkPublish.formPathLabel" defaultMessage="Path to Publish" />}
          variant="outlined"
          fullWidth
          required
          helperText={
            <FormattedMessage id="bulkPublish.formPathExample" defaultMessage="e.g. /site/website/about/index.xml" />
          }
          onChange={handleFormChange('path')}
        />
      </FormControl>
      <FormControl fullWidth className={classes.formControl}>
        {/* TODO: pending to retrieve */}
        <Select value={formData.environment} required onChange={handleFormChange('environment')}>
          <MenuItem value={'live'}>Live</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth className={classes.formControl}>
        <TextFieldWithMax
          value={formData.comment}
          label={<FormattedMessage id="bulkPublish.submissionComment" defaultMessage="Submission Comment" />}
          fullWidth
          multiline
          onChange={handleFormChange('comment')}
        />
      </FormControl>
    </form>
  );
}
