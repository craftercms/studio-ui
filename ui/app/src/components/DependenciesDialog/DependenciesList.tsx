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
import { DetailedItem } from '../../models/Item';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import clsx from 'clsx';
import { isImage } from '../../utils/content';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVertRounded';
import React from 'react';
import { dependenciesDialogStyles } from './DependenciesDialog';
import { assetsTypes, DependenciesListProps } from './utils';

export default function DependenciesList(props: DependenciesListProps) {
  const { resource, compactView, showTypes, handleContextMenuClick } = props;
  const classes = dependenciesDialogStyles({});
  const dependencies: DetailedItem[] = resource.read();

  return (
    <List className={classes.dependenciesList}>
      {dependencies
        .filter((dependency) => assetsTypes[showTypes].filter(dependency))
        .map((dependency, i) => (
          <ListItem
            key={dependency.path}
            divider={dependencies.length - 1 !== i}
            className={clsx(classes.dependenciesListItem, {
              [classes.dependenciesCompactListItem]: compactView
            })}
          >
            {isImage(dependency.path) && !compactView && (
              <ListItemAvatar>
                <Avatar className={classes.listItemPreview} src={dependency.path} />
              </ListItemAvatar>
            )}
            <ListItemText
              className={classes.listItemContent}
              primary={dependency.label}
              secondary={!compactView ? dependency.path : null}
            />

            <IconButton
              aria-haspopup="true"
              onClick={(e) => {
                handleContextMenuClick(e, dependency);
              }}
              className={classes.listEllipsis}
            >
              <MoreVertIcon />
            </IconButton>
          </ListItem>
        ))}
    </List>
  );
}
