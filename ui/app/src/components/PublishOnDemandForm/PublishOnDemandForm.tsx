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

import * as React from 'react';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import FormControl from '@mui/material/FormControl';
import { FormattedMessage } from 'react-intl';
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextFieldWithMax from '../TextFieldWithMax/TextFieldWithMax';
import Grid from '@mui/material/Grid';
import { PublishFormData, PublishingTarget, PublishOnDemandMode } from '../../models/Publishing';
import ApiResponse from '../../models/ApiResponse';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';

const useStyles = makeStyles((theme) =>
  createStyles({
    formHelperText: {
      marginLeft: '5px'
    },
    environmentLoaderContainer: {
      display: 'inline-flex'
    },
    environmentLoader: {
      border: `1px solid ${theme.palette.divider}`,
      padding: '15px',
      borderRadius: theme.shape.borderRadius,
      width: '100%'
    }
  })
);

interface PublishOnDemandFormProps {
  mode: PublishOnDemandMode;
  formData: PublishFormData;
  setFormData(data): void;
  publishingTargets: PublishingTarget[];
  publishingTargetsError: ApiResponse;
  bulkPublishCommentRequired: boolean;
  publishByCommitCommentRequired: boolean;
  disabled: boolean;
}

export default function PublishOnDemandForm(props: PublishOnDemandFormProps) {
  const {
    mode,
    formData,
    disabled,
    setFormData,
    publishingTargets,
    publishingTargetsError,
    bulkPublishCommentRequired,
    publishByCommitCommentRequired
  } = props;
  const classes = useStyles();
  const handleFormChange = (name: string) => (event: React.ChangeEvent<{ value: unknown }> | SelectChangeEvent) => {
    setFormData({ [name]: `/${event.target.value}`.replace(/\/{2,}/g, '/') });
  };
  return (
    <form>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <FormControl fullWidth>
            <TextField
              disabled={disabled}
              value={mode === 'studio' ? formData.path : formData.commitIds}
              label={
                mode === 'studio' ? (
                  <FormattedMessage id="publishOnDemand.formPathLabel" defaultMessage="Path to Publish" />
                ) : (
                  <FormattedMessage id="publishOnDemand.formPathLabelPreview" defaultMessage="Commit or tag IDs" />
                )
              }
              fullWidth
              required
              helperText={
                mode === 'studio' ? (
                  <FormattedMessage
                    id="publishOnDemand.formPathExample"
                    defaultMessage="e.g. /site/website/about/index.xml"
                  />
                ) : (
                  <FormattedMessage
                    id="publishOnDemand.formPathExamplePreview"
                    defaultMessage="You may enter multiple separate by comma"
                  />
                )
              }
              FormHelperTextProps={{ className: classes.formHelperText }}
              onChange={handleFormChange(mode === 'studio' ? 'path' : 'commitIds')}
              onBlur={
                mode === 'studio'
                  ? () => {
                      setFormData({ path: formData.path.replace(/(.+)(\/$)/, '$1') });
                    }
                  : void 0
              }
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          {publishingTargets ? (
            <FormControl fullWidth variant="outlined" required>
              <InputLabel id="publishingTargetLabel" disabled={disabled}>
                <FormattedMessage id="publishOnDemand.publishingTarget" defaultMessage="Publishing Target" />
              </InputLabel>
              <Select
                disabled={disabled}
                labelId="publishingTargetLabel"
                label={<FormattedMessage id="publishOnDemand.publishingTarget" defaultMessage="Publishing Target" />}
                value={formData.environment}
                required
                onChange={handleFormChange('environment')}
              >
                {publishingTargets.map((target) => (
                  <MenuItem key={target.name} value={target.name}>
                    {target.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth>
              <div className={classes.environmentLoaderContainer}>
                <Typography
                  variant="body1"
                  component="span"
                  className={classes.environmentLoader}
                  color={publishingTargetsError ? 'error' : 'initial'}
                >
                  {publishingTargetsError ? (
                    <FormattedMessage id="words.error" defaultMessage="Error" />
                  ) : (
                    <>
                      <FormattedMessage id="words.loading" defaultMessage="Loading" />
                      ...
                    </>
                  )}
                </Typography>
              </div>
            </FormControl>
          )}
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <TextFieldWithMax
              disabled={disabled}
              value={formData.comment}
              label={<FormattedMessage id="publishOnDemand.submissionComment" defaultMessage="Submission Comment" />}
              fullWidth
              multiline
              onChange={handleFormChange('comment')}
              required={mode === 'studio' ? bulkPublishCommentRequired : publishByCommitCommentRequired}
            />
          </FormControl>
        </Grid>
      </Grid>
    </form>
  );
}
