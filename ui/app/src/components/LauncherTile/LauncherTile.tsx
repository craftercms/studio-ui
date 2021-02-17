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

import Link from '@material-ui/core/Link';
import clsx from 'clsx';
import Avatar from '@material-ui/core/Avatar';
import SystemIcon, { SystemIconDescriptor } from '../SystemIcon';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';

export interface LauncherTileProps {
  icon: SystemIconDescriptor;
  title: string;
  link?: string;
  target?: string;
  disabled?: any;
  onClick?(id?: string, type?: string): any;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    tile: {
      width: '120px',
      height: '100px',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      cursor: 'pointer',
      textAlign: 'center',
      borderRadius: theme.shape.borderRadius,
      transition: 'background 250ms ease, box-shadow 500ms ease',
      margin: 5,
      overflow: 'hidden',
      '&:hover, &:focus': {
        background: theme.palette.action.hover,
        boxShadow: theme.shadows[2],
        textDecoration: 'none'
      },
      '&.disabled': {
        opacity: theme.palette.action.disabledOpacity,
        background: theme.palette.action.disabled,
        pointerEvents: 'none'
      }
    },
    title: {
      lineHeight: 1
    },
    iconAvatar: {
      backgroundColor: 'transparent',
      color: theme.palette.text.secondary,
      margin: 5
    }
  })
);

function LauncherTile(props: LauncherTileProps) {
  const { title, icon, link, target, onClick, disabled = false } = props;
  const classes = useStyles();
  return (
    <Link
      className={clsx(classes.tile, disabled && 'disabled')}
      href={disabled ? null : link}
      onClick={() => (!disabled && onClick ? onClick() : null)}
      target={target ? target : '_self'}
    >
      <Avatar variant="rounded" className={classes.iconAvatar} color="inherit">
        <SystemIcon icon={icon} />
      </Avatar>
      <Typography color="textPrimary" className={classes.title}>
        {title}
      </Typography>
    </Link>
  );
}

export default LauncherTile;
