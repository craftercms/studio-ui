/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import React from 'react';
import { BrokenReferencesDialogUIProps } from './utils';
import { DialogBody } from '../DialogBody';
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Button from '@mui/material/Button';
import { FormattedMessage } from 'react-intl';
import DialogFooter from '../DialogFooter';
import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';

export function BrokenReferencesDialogUI(props: BrokenReferencesDialogUIProps) {
  const { references, onEditReferenceClick, onContinue, onClose } = props;

  return (
    <>
      <DialogBody>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <List
              sx={{
                border: (theme) => `1px solid ${theme.palette.divider}`,
                background: (theme) => theme.palette.background.paper
              }}
            >
              {references.map((reference, index) => (
                <ListItem key={reference.path} divider={references.length - 1 !== index}>
                  <ListItemText
                    primary={reference.label}
                    secondary={reference.path}
                    primaryTypographyProps={{
                      title: reference.path,
                      sx: {
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis'
                      }
                    }}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      color="primary"
                      onClick={() => {
                        onEditReferenceClick?.(reference.path);
                      }}
                      size="small"
                      sx={{
                        marginLeft: 'auto',
                        fontWeight: 'bold',
                        verticalAlign: 'baseline'
                      }}
                    >
                      <FormattedMessage defaultMessage="Edit" />
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </DialogBody>
      <DialogFooter>
        {onClose && (
          <SecondaryButton onClick={onClose}>
            <FormattedMessage defaultMessage="Cancel" />
          </SecondaryButton>
        )}
        {onContinue && (
          <PrimaryButton onClick={onContinue} autoFocus>
            <FormattedMessage defaultMessage="Continue" />
          </PrimaryButton>
        )}
      </DialogFooter>
    </>
  );
}

export default BrokenReferencesDialogUI;
