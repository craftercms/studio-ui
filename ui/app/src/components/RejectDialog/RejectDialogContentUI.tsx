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

import { RejectDialogContentUIProps } from './utils';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import { FormattedMessage } from 'react-intl';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import React from 'react';
import ListItemButton from '@mui/material/ListItemButton';

export function RejectDialogContentUI(props: RejectDialogContentUIProps) {
  const { items: rejectItems, checkedItems, onUpdateChecked, classes } = props;
  return (
    <List
      subheader={
        <ListSubheader component="div" className={classes.listSubHeader}>
          <label className={classes.subHeaderItem}>
            <FormattedMessage id="words.item" defaultMessage="Item" />
          </label>
          <label>
            <FormattedMessage id="rejectDialog.submittedBy" defaultMessage="Submitted By" />
          </label>
        </ListSubheader>
      }
      className={classes.itemsList}
    >
      {rejectItems.map((item) => {
        const labelId = `checkbox-list-label-${item.path}`;

        return (
          <ListItemButton key={item.path} onClick={() => onUpdateChecked(item.path)}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={checkedItems.includes(item.path)}
                tabIndex={-1}
                disableRipple
                inputProps={{ 'aria-labelledby': labelId }}
                color="primary"
              />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              secondary={item.path}
              id={labelId}
              primaryTypographyProps={{
                classes: { root: classes.ellipsis }
              }}
              secondaryTypographyProps={{
                classes: { root: classes.ellipsis }
              }}
            />
            <ListItemText disableTypography={true} className={classes.submittedBy}>
              <Typography>{item.modifier?.username}</Typography>
            </ListItemText>
          </ListItemButton>
        );
      })}
    </List>
  );
}
