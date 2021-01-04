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

import { createStyles, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import React, { PropsWithChildren } from 'react';
import { CSSProperties } from '@material-ui/styles';
import clsx from 'clsx';

type ViewToolbarClassKey = 'appBar' | 'toolbar';

type ViewToolbarStyles = Partial<Record<ViewToolbarClassKey, CSSProperties>>;

type ViewToolbarProps = PropsWithChildren<{
  elevation?: number;
  styles?: ViewToolbarStyles;
  classes?: Partial<Record<ViewToolbarClassKey, string>>;
}>;

const useStyles = makeStyles((theme) =>
  createStyles<ViewToolbarClassKey, ViewToolbarStyles>({
    appBar: (styles) => ({
      borderBottom: `1px solid ${theme.palette.divider}`,
      ...styles.appBar
    }),
    toolbar: (styles) => ({
      placeContent: 'center space-between',
      '& > section': {
        display: 'flex',
        alignItems: 'center'
      },
      ...styles.toolbar
    })
  })
);

export const ViewToolbar = React.memo<ViewToolbarProps>(function(props) {
  const classes = useStyles(props.styles);
  const { children, elevation = 0 } = props;
  return (
    <AppBar
      color="inherit"
      position="relative"
      elevation={elevation}
      className={clsx(classes.appBar, props.classes?.appBar)}
    >
      <Toolbar className={clsx(classes.toolbar, props.classes?.toolbar)}>{children}</Toolbar>
    </AppBar>
  );
});

export default ViewToolbar;
