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

import { RejectDialogUIProps } from './utils';
import { FormattedMessage } from 'react-intl';
import DialogBody from '../DialogBody/DialogBody';
import Grid from '@mui/material/Grid2';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextFieldWithMax from '../TextFieldWithMax/TextFieldWithMax';
import DialogFooter from '../DialogFooter/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import React from 'react';
import { RejectDialogContentUI } from './RejectDialogContentUI';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { nnou } from '../../utils/object';
import { LoadingState } from '../LoadingState';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { EmptyState } from '../EmptyState';
import { useStyles } from './styles';

export function RejectDialogUI(props: RejectDialogUIProps) {
  const {
    items,
    cannedMessages,
    published,
    checkedItems,
    rejectionReason,
    rejectionComment,
    error,
    onRejectionReasonChange,
    onCommentChange,
    onUpdateChecked,
    onCloseButtonClick,
    onReject,
    isSubmitting,
    isSubmitDisabled
  } = props;
  const { classes } = useStyles();

  return (
    <>
      <DialogBody id="confirmDialogBody">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 7 }}>
            {error ? (
              <ApiResponseErrorState error={error} />
            ) : !Boolean(items && nnou(published) && cannedMessages) ? (
              <LoadingState />
            ) : items.length > 0 ? (
              published ? (
                <RejectDialogContentUI
                  items={items}
                  checkedItems={checkedItems}
                  onUpdateChecked={onUpdateChecked}
                  classes={classes}
                />
              ) : (
                <Alert severity="warning">
                  <FormattedMessage
                    id="rejectDialog.firstPublish"
                    defaultMessage="The entire project publish will be rejected since this is the first publish request"
                  />
                </Alert>
              )
            ) : (
              <EmptyState
                title={
                  <FormattedMessage id="rejectDialog.noItemsSelected" defaultMessage="There are no files to reject" />
                }
              />
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 5 }}>
            <form>
              <FormControl fullWidth variant="outlined">
                <InputLabel shrink>
                  <FormattedMessage
                    id="rejectDialog.predefinedRejectionComments"
                    defaultMessage="Predefined Rejection Comments"
                  />
                </InputLabel>
                <Select
                  fullWidth
                  label={
                    <FormattedMessage
                      id="rejectDialog.predefinedRejectionComments"
                      defaultMessage="Predefined Rejection Comments"
                    />
                  }
                  autoFocus
                  value={rejectionReason}
                  onChange={(e) => onRejectionReasonChange(e.target.value as string)}
                >
                  <MenuItem value="typeCustomReason">
                    <FormattedMessage id="rejectDialog.typeMyOwnComment" defaultMessage="Type my own comment" />
                  </MenuItem>
                  {cannedMessages?.map((message) => (
                    <MenuItem value={message.key} key={message.key}>
                      <Typography>{message.title}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextFieldWithMax
                required
                className={classes.submissionTextField}
                label={<FormattedMessage id="rejectDialog.rejectCommentLabel" defaultMessage="Rejection Comment" />}
                fullWidth
                multiline
                rows={8}
                value={rejectionComment}
                onChange={(e) => onCommentChange(e.target.value as string)}
              />
            </form>
          </Grid>
        </Grid>
      </DialogBody>
      <DialogFooter>
        {onCloseButtonClick && (
          <SecondaryButton onClick={onCloseButtonClick} disabled={isSubmitting}>
            <FormattedMessage id="rejectDialog.cancel" defaultMessage="Cancel" />
          </SecondaryButton>
        )}
        {onReject && (
          <PrimaryButton onClick={onReject} loading={isSubmitting} disabled={isSubmitDisabled}>
            <FormattedMessage id="rejectDialog.continue" defaultMessage="Reject" />
          </PrimaryButton>
        )}
      </DialogFooter>
    </>
  );
}
