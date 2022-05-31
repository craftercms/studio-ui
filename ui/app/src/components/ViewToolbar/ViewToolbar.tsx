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

import { makeStyles } from 'tss-react/mui';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import React, { PropsWithChildren } from 'react';
import { CSSObject as CSSProperties } from 'tss-react';

export type ViewToolbarClassKey = 'appBar' | 'toolbar';

export type ViewToolbarStyles = Partial<Record<ViewToolbarClassKey, CSSProperties>>;

type ViewToolbarProps = PropsWithChildren<{
  elevation?: number;
  styles?: ViewToolbarStyles;
  classes?: Partial<Record<ViewToolbarClassKey, string>>;
}>;

const useStyles = makeStyles<ViewToolbarStyles, ViewToolbarClassKey>()((theme, { appBar, toolbar } = {} as any) => ({
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    ...appBar
  },
  toolbar: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    placeContent: 'center space-between',
    '& > section': {
      display: 'flex',
      alignItems: 'center'
    },
    ...toolbar
  }
}));

export const ViewToolbar = React.memo<ViewToolbarProps>(function (props) {
  const { classes, cx } = useStyles(props.styles);
  const { children, elevation = 0 } = props;
  return (
    <AppBar
      color="inherit"
      position="relative"
      elevation={elevation}
      className={cx(classes.appBar, props.classes?.appBar)}
    >
      <Toolbar className={cx(classes.toolbar, props.classes?.toolbar)}>{children}</Toolbar>
    </AppBar>
  );
});

export default ViewToolbar;
