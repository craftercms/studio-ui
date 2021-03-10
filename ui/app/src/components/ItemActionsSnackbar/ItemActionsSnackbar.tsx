/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import React, { ReactNode } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ListItem, ListItemText, Snackbar } from '@material-ui/core';
import palette from '../../styles/palette';
import { defineMessages, useIntl } from 'react-intl';
import List from '@material-ui/core/List';
import Skeleton from '@material-ui/lab/Skeleton';
import { rand } from '../PathNavigator/utils';
import Button from '@material-ui/core/Button';
import { ContextMenuOption } from '../ContextMenu';

export interface ItemActionsSnackbarProps {
  open: boolean;
  options: Array<ContextMenuOption>;
  onActionClicked(id: string): void;
  append?: ReactNode;
  prepend?: ReactNode;
}

const useStyles = makeStyles((theme) => ({
  actionsBar: {
    zIndex: theme.zIndex.modal,
    '& .MuiSnackbarContent-root': {
      backgroundColor: palette.blue.highlightHex,
      color: palette.black,
      borderRadius: '6px',
      padding: '0 10px',
      minWidth: 'unset'
    },
    '& .MuiSnackbarContent-message': {
      display: 'flex',
      padding: 0
    }
  },
  actionsList: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0
  }
}));

const messages = defineMessages({
  acceptSelection: {
    id: 'search.acceptSelection',
    defaultMessage: 'Accept Selection'
  },
  noOptionsAvailable: {
    id: 'siteSearch.noOptionsAvailable',
    defaultMessage: 'No options available'
  }
});

function ItemActionsSnackbar(props: ItemActionsSnackbarProps) {
  const { open, options, onActionClicked, append, prepend } = props;
  const classes = useStyles();
  const { formatMessage } = useIntl();
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={open}
      classes={{
        root: classes.actionsBar
      }}
      message={
        <>
          {prepend}
          <List className={classes.actionsList}>
            {options ? (
              options.length ? (
                options.map((option) => (
                  <Button
                    size="small"
                    variant="text"
                    color="primary"
                    key={option.id}
                    onClick={() => onActionClicked(option.id)}
                  >
                    <ListItemText primary={option.label} />
                  </Button>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary={formatMessage(messages.noOptionsAvailable)} />
                </ListItem>
              )
            ) : (
              new Array(5).fill(null).map((_, index) => (
                <ListItem key={index}>
                  <ListItemText primary={<Skeleton animation="pulse" height="10px" width={`${rand(40, 60)}px`} />} />
                </ListItem>
              ))
            )}
            {append}
          </List>
        </>
      }
    />
  );
}

export default ItemActionsSnackbar;
