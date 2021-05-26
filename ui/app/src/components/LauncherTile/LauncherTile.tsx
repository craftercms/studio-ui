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
import { CSSProperties } from '@material-ui/styles';

export type LauncherTileClassKey = 'tile' | 'tileActive' | 'title' | 'iconAvatar';

type LauncherTileStyles = Partial<Record<LauncherTileClassKey, CSSProperties>>;

export interface LauncherTileProps {
  icon: SystemIconDescriptor;
  title: string;
  link?: string;
  target?: string;
  disabled?: any;
  active?: boolean;
  classes?: Partial<Record<LauncherTileClassKey, string>>;
  styles?: LauncherTileStyles;
  onClick?(e: React.MouseEvent<HTMLAnchorElement | HTMLSpanElement>): any;
}

const useStyles = makeStyles((theme) =>
  createStyles<LauncherTileClassKey, LauncherTileStyles>({
    tile: (styles) => ({
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
      },
      ...styles.tile
    }),
    title: (styles) => ({
      lineHeight: 1,
      ...styles.title
    }),
    iconAvatar: (styles) => ({
      backgroundColor: 'transparent',
      color: theme.palette.text.secondary,
      margin: 5,
      ...styles.iconAvatar
    }),
    tileActive: (styles) => ({
      '&, &:hover, &:focus': {
        boxShadow: 'none',
        cursor: 'default',
        background: theme.palette.action.selected
      },
      ...styles.tileActive
    })
  })
);

function LauncherTile(props: LauncherTileProps) {
  const { title, icon, link, target, onClick, disabled = false, active } = props;
  const classes = useStyles(props.styles);
  return (
    <Link
      className={clsx(classes.tile, props.classes?.tile, disabled && 'disabled', active && classes.tileActive)}
      href={disabled ? null : link}
      onClick={(e) => (!disabled && onClick ? onClick(e) : null)}
      target={target ? target : '_self'}
    >
      <Avatar variant="rounded" className={clsx(classes.iconAvatar, props.classes?.iconAvatar)}>
        <SystemIcon icon={icon} />
      </Avatar>
      <Typography color="textPrimary" className={clsx(classes.title, props.classes?.title)}>
        {title}
      </Typography>
    </Link>
  );
}

export default LauncherTile;
