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

const useStyles = makeStyles((theme: Theme) => ({
  actionsBar: {
    '& .MuiSnackbarContent-root': {
      backgroundColor: '#e6f2ff', // TODO: move to palette
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
    color: palette.blue.main
  },
  resultsSelected: {
    margin: '0 16px',
    display: 'flex',
    alignItems: 'center'
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
  }
});

const actions = ['edit', 'publish', 'delete', 'reject', 'schedule', 'duplicateAsset', 'dependencies', 'history'];

interface ActionsBarProps {
  open: boolean;
  selectedItems: string[];
  handleClearSelected(): void;
}

export default function ActionsBar(props: ActionsBarProps) {
  const { open, selectedItems, handleClearSelected } = props;
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
    if (permissions && selectedItems.length === 1) {
      const path = selectedItems[0];
      const item = items.byPath?.[path];

      if (item) {
        const options = generateSingleItemOptions(item, permissions[path]);
        setSelectionOptions(options[0].filter((option) => actions.includes(option.id)));
      }
    }
    if (permissions && selectedItems.length > 1) {
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
  }, [permissions, items, selectedItems]);

  // TODO: this only works with 1 item selected - implement for multiple
  const onActionItemClicked = (option: SectionItem) => {
    const path = selectedItems[0];
    const item = items.byPath?.[path];
    itemActionDispatcher(site, item, option, legacyFormSrc, dispatch, formatMessage, clipboard);
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
          <List className={classes.actionsList}>
            {selectionOptions.map((option) => (
              <ListItem button key={option.id} onClick={() => onActionItemClicked(option)}>
                <ListItemText primary={formatMessage(option.label)} />
              </ListItem>
            ))}
          </List>

          {selectedItems.length > 0 && (
            <Typography variant="body2" className={classes.resultsSelected} color={'textSecondary'}>
              {formatMessage(messages.resultsSelected, {
                count: selectedItems.length
              })}
              <HighlightOffIcon className={classes.clearSelected} onClick={handleClearSelected} />
            </Typography>
          )}
        </>
      }
      key={'topcenter'}
    />
  );
}
