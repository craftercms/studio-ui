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
import Grid from '@material-ui/core/Grid';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextFieldWithMax from '../Controls/TextFieldWithMax';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import React from 'react';
import { RejectDialogContentUI } from './RejectDialogContentUI';

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
                isEmpty: (value) => value.length === 0
              }}
            >
              <RejectDialogContentUI
                resource={resource}
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
                  <MenuItem value="NotApproved">
                    <FormattedMessage id="rejectDialog.notApproved" defaultMessage="Not Approved" />
                  </MenuItem>
                  <MenuItem value="IB">
                    <FormattedMessage id="rejectDialog.incorrectBranding" defaultMessage="Incorrect Branding" />
                  </MenuItem>
                  <MenuItem value="Typos">
                    <FormattedMessage id="rejectDialog.typos" defaultMessage="Typos" />
                  </MenuItem>
                  <MenuItem value="BrokenLinks">
                    <FormattedMessage id="rejectDialog.brokenLinks" defaultMessage="Broken Links" />
                  </MenuItem>
                  <MenuItem value="NSOA">
                    <FormattedMessage id="rejectDialog.nsoa" defaultMessage="Needs Section Owner's Approval" />
                  </MenuItem>
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
