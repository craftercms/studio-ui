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

import { EditSiteDialogUIProps } from './utils';
import { FormattedMessage, useIntl } from 'react-intl';
import DialogBody from '../DialogBody/DialogBody';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import DialogFooter from '../DialogFooter/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import React from 'react';
import { translations } from './translations';
import { useSiteDialogStyles } from './styles';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Tooltip from '@mui/material/Tooltip';

export function EditSiteDialogUI(props: EditSiteDialogUIProps) {
  const {
    siteId,
    siteName,
    siteDescription,
    siteImage,
    onSiteNameChange,
    onSiteDescriptionChange,
    submitting,
    submitDisabled,
    fallbackImageSrc,
    onKeyPress,
    onSubmit,
    onCloseButtonClick,
    onEditSiteImage
  } = props;
  const { formatMessage } = useIntl();
  const { classes } = useSiteDialogStyles();
  return (
    <>
      <DialogBody>
        <Grid container spacing={2}>
          <Grid item sm={7}>
            <Grid container spacing={1} component="form">
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  fullWidth
                  id="name"
                  name="name"
                  label={<FormattedMessage id="editSiteDialog.siteName" defaultMessage="Project Name" />}
                  onChange={(event) => onSiteNameChange(event)}
                  onKeyPress={onKeyPress}
                  value={siteName}
                  inputProps={{ maxLength: 255 }}
                  error={submitDisabled}
                  helperText={
                    // prettier-ignore
                    !siteName.trim()
                      ? formatMessage(translations.siteNameRequired)
                      : submitDisabled
                      ? formatMessage(translations.siteNameExists)
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="siteId"
                  name="id"
                  label={<FormattedMessage id="editSiteDialog.siteId" defaultMessage="Project ID" />}
                  fullWidth
                  value={siteId}
                  disabled
                  helperText={
                    <FormattedMessage id="editSiteDialog.notEditable" defaultMessage="The project id is not editable" />
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="description"
                  name="description"
                  label={<FormattedMessage id="editSiteDialog.siteDescription" defaultMessage="Project Description" />}
                  fullWidth
                  multiline
                  onChange={(event) => onSiteDescriptionChange(event.target.value)}
                  onKeyPress={(e) => {
                    // This behaviour is kind of backwards from how it's usually seen in text editors.
                    // Perhaps we should flip it to shift/ctrl + enter creating new lines and only enter submitting?
                    if (e.key !== 'Enter' || e.ctrlKey || e.shiftKey) {
                      onKeyPress?.(e);
                    }
                  }}
                  value={siteDescription ?? ''}
                  inputProps={{ maxLength: 4000 }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item sm={5}>
            <Card>
              <CardMedia
                component="img"
                image={siteImage}
                title={siteName}
                className={classes.media}
                onError={(event) => (event.target.src = fallbackImageSrc)}
              />
              <CardActions className={classes.cardActions} disableSpacing>
                <Tooltip title={<FormattedMessage id="words.edit" defaultMessage="Edit" />}>
                  <IconButton onClick={onEditSiteImage}>
                    <EditRoundedIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </DialogBody>
      <DialogFooter>
        {onCloseButtonClick && (
          <SecondaryButton onClick={onCloseButtonClick} variant="contained">
            <FormattedMessage id="editSiteDialog.cancel" defaultMessage="Cancel" />
          </SecondaryButton>
        )}
        {onSubmit && (
          <PrimaryButton
            onClick={() => onSubmit()}
            variant="contained"
            color="primary"
            loading={submitting}
            disabled={submitting || submitDisabled}
          >
            <FormattedMessage id="words.submit" defaultMessage="Submit" />
          </PrimaryButton>
        )}
      </DialogFooter>
    </>
  );
}
