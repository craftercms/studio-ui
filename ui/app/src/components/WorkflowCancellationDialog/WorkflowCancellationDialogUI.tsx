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

import { FormattedMessage } from 'react-intl';
import DialogBody from '../DialogBody/DialogBody';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DialogFooter from '../DialogFooter/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import React from 'react';
import { WorkflowCancellationDialogUIProps } from './utils';

export function WorkflowCancellationDialogUI(props: WorkflowCancellationDialogUIProps) {
  const { items, onCloseButtonClick, onContinue, classes } = props;
  return (
    <>
      <DialogBody>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <List className={classes.filesList}>
              {items.map((item) => (
                <ListItem key={item.path}>
                  <ListItemText primary={item.label} secondary={item.path} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </DialogBody>
      <DialogFooter>
        {onCloseButtonClick && (
          <SecondaryButton onClick={onCloseButtonClick}>
            <FormattedMessage id="workflowCancellation.cancel" defaultMessage="Cancel" />
          </SecondaryButton>
        )}
        {onContinue && (
          <PrimaryButton onClick={onContinue} autoFocus>
            <FormattedMessage id="workflowCancellation.continue" defaultMessage="Continue" />
          </PrimaryButton>
        )}
      </DialogFooter>
    </>
  );
}
