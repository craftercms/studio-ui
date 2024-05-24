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
import { BrokenReferencesDialogContainerProps } from './types';
import { FormattedMessage } from 'react-intl';
import { EmptyState } from '../EmptyState';
import { useDispatch } from 'react-redux';
import { fetchBrokenReferences, showEditDialog } from '../../state/actions/dialogs';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import useEnv from '../../hooks/useEnv';
import { DialogBody } from '../DialogBody';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Button from '@mui/material/Button';
import DialogFooter from '../DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import ApiResponseErrorState from '../ApiResponseErrorState';

export function BrokenReferencesDialogContainer(props: BrokenReferencesDialogContainerProps) {
  const { references, error, onClose, onContinue } = props;
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const { authoringBase } = useEnv();

  const onContinueClick = (e) => {
    onClose(e, null);
    onContinue();
  };

  const onEditReferenceClick = (path: string) => {
    dispatch(showEditDialog({ path, authoringBase, site, onSaveSuccess: fetchBrokenReferences() }));
  };

  return error ? (
    <ApiResponseErrorState error={error} />
  ) : references.length > 0 ? (
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
          <SecondaryButton onClick={(e) => onClose(e, null)}>
            <FormattedMessage defaultMessage="Cancel" />
          </SecondaryButton>
        )}
        {onContinue && (
          <PrimaryButton onClick={onContinueClick} autoFocus>
            <FormattedMessage defaultMessage="Continue" />
          </PrimaryButton>
        )}
      </DialogFooter>
    </>
  ) : (
    <EmptyState title={<FormattedMessage defaultMessage="No broken references have been detected" />} />
  );
}

export default BrokenReferencesDialogContainer;
