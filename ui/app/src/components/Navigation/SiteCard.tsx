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

import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVertRounded';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Link from '@material-ui/core/Link';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles((theme) =>
  createStyles({
    card: {
      paddingTop: theme.spacing(2.5),
      paddingBottom: theme.spacing(2.5),
      borderRadius: 5,
      backgroundColor: theme.palette.background.paper
    },
    siteName: {
      fontWeight: 600
    }
  })
);

interface TitleCardProps {
  title: string;
  value?: string;
  options?: boolean;
  classes?: any;
  cardActions?: any;
  disabled?: boolean;
  selected?: boolean;
  onCardClick(id: string): any;
}

export default function SiteCard(props: TitleCardProps) {
  const { title, value, options, onCardClick, cardActions = [], selected = false } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const classes = useStyles();

  const handleClose = (event, action?) => {
    event.stopPropagation();
    setAnchorEl(null);
    action?.onClick?.(value, event);
  };

  const handleOptions = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Box
        // @ts-ignore
        button
        selected={selected}
        boxShadow={1}
        component={ListItem}
        onClick={() => onCardClick(value)}
        className={clsx(classes.card, props.classes?.root)}
        title={title}
      >
        <ListItemText primary={title} primaryTypographyProps={{ className: classes.siteName, noWrap: true }} />
        {options && (
          <ListItemSecondaryAction>
            <IconButton aria-label="settings" onClick={(e) => handleOptions(e)}>
              <MoreVertIcon />
            </IconButton>
          </ListItemSecondaryAction>
        )}
      </Box>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {cardActions.map((action, i) => (
          <MenuItem
            key={i}
            component={Link}
            href={typeof action.href === 'function' ? action.href(value) : action.href}
            onClick={(e) => handleClose(e, action)}
          >
            {action.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
