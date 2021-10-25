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

import { RejectDialogUIProps } from './utils';
import { FormattedMessage } from 'react-intl';
import DialogBody from '../Dialogs/DialogBody';
import Grid from '@mui/material/Grid';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextFieldWithMax from '../Controls/TextFieldWithMax';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import React from 'react';
import { RejectDialogContentUI } from './RejectDialogContentUI';
import Typography from '@mui/material/Typography';
import { CannedMessage } from '../../services/configuration';

export function RejectDialogUI(props: RejectDialogUIProps) {
  const {
    resource,
    checkedItems,
    rejectionReason,
    rejectionComment,
    onRejectionReasonChange,
    onCommentChange,
    onUpdateChecked,
    onCloseButtonClick,
    onReject,
    classes,
    isSubmitting,
    isSubmitDisabled
  } = props;
  const { items, cannedMessages } = resource.read();
  return (
    <>
      <DialogBody id="confirmDialogBody">
        <Grid container spacing={3} className={classes.contentRoot}>
          <Grid item xs={12} sm={7} md={7} lg={7} xl={7}>
            <SuspenseWithEmptyState
              resource={resource}
              withEmptyStateProps={{
                emptyStateProps: {
                  title: (
                    <FormattedMessage id="publishDialog.noItemsSelected" defaultMessage="There are no affected files" />
                  )
                },
                isEmpty: ({ items }) => items.length === 0
              }}
            >
              <RejectDialogContentUI
                items={items}
                checkedItems={checkedItems}
                onUpdateChecked={onUpdateChecked}
                classes={classes}
              />
            </SuspenseWithEmptyState>
          </Grid>

          <Grid item xs={12} sm={5} md={5} lg={5} xl={5}>
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
                  {Object.entries(cannedMessages).map(([key, value]: [key: string, value: CannedMessage]) => (
                    <MenuItem value={key} key={key}>
                      <Typography>{value.title}</Typography>
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
