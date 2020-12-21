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

import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ListItem, ListItemText, Snackbar, Theme } from '@material-ui/core';
import palette from '../../styles/palette';
import { defineMessages, useIntl } from 'react-intl';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { useActiveSiteId, useEnv, usePermissions, useSelection } from '../../utils/hooks';
import { generateMultipleItemOptions, generateSingleItemOptions, itemActionDispatcher } from '../../utils/itemActions';
import { SectionItem } from '../ContextMenu';
import { useDispatch } from 'react-redux';
import StandardAction from '../../models/StandardAction';
import { DetailedItem } from '../../models/Item';

const useStyles = makeStyles((theme: Theme) => ({
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
    padding: 0,
    color: theme.palette.primary.main
  },
  resultsSelected: {
    margin: '0 16px',
    display: 'flex',
    alignItems: 'center',
    color: palette.gray.dark1
  },
  clearSelected: {
    marginLeft: '5px',
    cursor: 'pointer'
  }
}));

const messages = defineMessages({
  resultsSelected: {
    id: 'search.resultsSelected',
    defaultMessage: '{count, plural, one {{count} item selected} other {{count} items selected}}'
  },
  acceptSelection: {
    id: 'search.acceptSelection',
    defaultMessage: 'Accept Selection'
  }
});

const actions = ['edit', 'publish', 'delete', 'reject', 'schedule', 'duplicateAsset', 'dependencies', 'history'];

interface ActionsBarProps {
  open: boolean;
  selectedItems: string[];
  mode?: string;
  handleClearSelected(): void;
  onActionSuccess?: StandardAction;
  onAcceptSelection?(items: DetailedItem[]): any;
}

export default function ActionsBar(props: ActionsBarProps) {
  const { open, selectedItems, handleClearSelected, onActionSuccess, mode = 'default', onAcceptSelection } = props;
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const permissions = usePermissions();
  const items = useSelection((state) => state.content.items);
  const [selectionOptions, setSelectionOptions] = useState([]);
  const site = useActiveSiteId();
  const { authoringBase } = useEnv();
  const legacyFormSrc = `${authoringBase}/legacy/form?`;
  const clipboard = useSelection((state) => state.content.clipboard);
  const dispatch = useDispatch();

  useEffect(() => {
    if (permissions && selectedItems.length) {
      if (selectedItems.length === 1) {
        const path = selectedItems[0];
        const item = items.byPath?.[path];

        if (item) {
          const options = generateSingleItemOptions(item, permissions[path]);
          setSelectionOptions(options[0].filter((option) => actions.includes(option.id)));
        }
      } else {
        let itemsDetails = [];

        selectedItems.forEach((itemPath) => {
          const itemPermissions = permissions[itemPath];
          const item = items.byPath?.[itemPath];
          if (itemPermissions && item) {
            itemsDetails.push({
              permissions: itemPermissions,
              item
            });
          }
        });

        setSelectionOptions(generateMultipleItemOptions(itemsDetails));
      }
    }
  }, [permissions, items, selectedItems]);

  const onActionItemClicked = (option: SectionItem) => {
    if (selectedItems.length > 1) {
      const detailedItems = [];

      selectedItems.forEach((path) => {
        detailedItems.push(items.byPath?.[path]);
      });
      itemActionDispatcher(
        site,
        detailedItems,
        option,
        legacyFormSrc,
        dispatch,
        formatMessage,
        clipboard,
        onActionSuccess
      );
    } else {
      const path = selectedItems[0];
      const item = items.byPath?.[path];
      itemActionDispatcher(site, item, option, legacyFormSrc, dispatch, formatMessage, clipboard, onActionSuccess);
    }
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={open}
      classes={{
        root: classes.actionsBar
      }}
      message={
        <>
          {mode === 'default' ? (
            <List className={classes.actionsList}>
              {selectionOptions.map((option) => (
                <ListItem button key={option.id} onClick={() => onActionItemClicked(option)}>
                  <ListItemText primary={formatMessage(option.label)} />
                </ListItem>
              ))}
            </List>
          ) : (
            <List className={classes.actionsList}>
              <ListItem button onClick={() => onAcceptSelection?.(selectedItems.map((path) => items.byPath?.[path]))}>
                <ListItemText primary={formatMessage(messages.acceptSelection)} />
              </ListItem>
            </List>
          )}

          {selectedItems.length > 0 && (
            <Typography variant="body2" className={classes.resultsSelected}>
              {formatMessage(messages.resultsSelected, {
                count: selectedItems.length
              })}
              <HighlightOffIcon className={classes.clearSelected} onClick={handleClearSelected} color="primary" />
            </Typography>
          )}
        </>
      }
      key={'topcenter'}
    />
  );
}
