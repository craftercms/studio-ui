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
import { makeStyles } from 'tss-react/mui';
import FormControl from '@mui/material/FormControl';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextFieldWithMax from '../TextFieldWithMax/TextFieldWithMax';
import Grid from '@mui/material/Grid2';
import { PublishFormData, PublishingTarget, PublishOnDemandMode } from '../../models/Publishing';
import ApiResponse from '../../models/ApiResponse';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';

const useStyles = makeStyles()((theme) => ({
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
}));

const messages = defineMessages({
  staging: { id: 'words.staging', defaultMessage: 'Staging' },
  live: { id: 'words.live', defaultMessage: 'Live' }
});

interface PublishOnDemandFormProps {
  mode: PublishOnDemandMode;
  formData: PublishFormData;
  setFormData(data: Partial<{ path: string; commitIds: string; environment: string; comment: string }>): void;
  publishingTargets: PublishingTarget[];
  publishingTargetsError: ApiResponse;
  bulkPublishCommentRequired: boolean;
  publishByCommitCommentRequired: boolean;
  disabled: boolean;
}

export function PublishOnDemandForm(props: PublishOnDemandFormProps) {
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
  const { classes } = useStyles();
  const { formatMessage } = useIntl();
  const handleFormChange = (name: string) => (event: React.ChangeEvent<{ value: unknown }> | SelectChangeEvent) => {
    const value = event.target.value as string;
    setFormData({ [name]: name === 'path' ? `/${value}`.replace(/\/{2,}/g, '/') : value });
  };
  return (
    <form>
      <Grid container spacing={3}>
        {mode !== 'everything' && (
          <Grid size={{ xs: 12, md: 8 }}>
            <FormControl fullWidth>
              <TextField
                disabled={disabled}
                value={(mode === 'studio' ? formData.path : formData.commitIds) ?? ''}
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
        )}
        <Grid size={{ xs: 12, md: mode !== 'everything' ? 4 : 12 }}>
          {publishingTargets ? (
            <FormControl fullWidth variant="outlined" required disabled={disabled}>
              <InputLabel id="publishingTargetLabel">
                <FormattedMessage id="publishOnDemand.publishingTarget" defaultMessage="Publishing Target" />
              </InputLabel>
              <Select
                id="publishingTargetDropdown"
                labelId="publishingTargetLabel"
                label={<FormattedMessage id="publishOnDemand.publishingTarget" defaultMessage="Publishing Target" />}
                value={formData.publishingTarget}
                onChange={handleFormChange('publishingTarget')}
              >
                {publishingTargets.map((target) => (
                  <MenuItem key={target.name} value={target.name}>
                    {formatMessage(messages[target.name])}
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
        <Grid size={12}>
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

export default PublishOnDemandForm;
