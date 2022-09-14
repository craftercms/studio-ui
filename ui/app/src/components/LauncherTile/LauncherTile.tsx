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

import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import SystemIcon, { SystemIconDescriptor } from '../SystemIcon/SystemIcon';
import Typography from '@mui/material/Typography';
import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { CSSObject as CSSProperties } from 'tss-react';

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

const useStyles = makeStyles<LauncherTileStyles, LauncherTileClassKey>()(
  (theme, { tile, title, iconAvatar, tileActive } = {} as LauncherTileStyles) => ({
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
      },
      ...tile
    },
    title: {
      lineHeight: 1,
      ...title
    },
    iconAvatar: {
      backgroundColor: 'transparent',
      color: theme.palette.text.secondary,
      margin: 5,
      ...iconAvatar
    },
    tileActive: {
      '&, &:hover, &:focus': {
        boxShadow: 'none',
        cursor: 'default',
        background: theme.palette.action.selected
      },
      ...tileActive
    }
  })
);

function LauncherTile(props: LauncherTileProps) {
  const { title, icon, link, target, onClick, disabled = false, active } = props;
  const { classes, cx } = useStyles(props.styles);
  return (
    <Link
      className={cx(classes.tile, props.classes?.tile, disabled && 'disabled', active && classes.tileActive)}
      href={disabled ? null : link}
      onClick={(e) => (!disabled && onClick ? onClick(e) : null)}
      target={target ? target : '_self'}
    >
      <Avatar variant="rounded" className={cx(classes.iconAvatar, props.classes?.iconAvatar)}>
        <SystemIcon icon={icon} />
      </Avatar>
      <Typography color="textPrimary" className={cx(classes.title, props.classes?.title)}>
        {title}
      </Typography>
    </Link>
  );
}

export default LauncherTile;
