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

import { DrawerProps } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import React, { useRef } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { CSSProperties } from '@material-ui/styles';

export type ResizeableDrawerClassKey = 'root' | 'drawerBody' | 'drawerPaper';

export type ResizeableDrawerStyles = Partial<Record<ResizeableDrawerClassKey, CSSProperties>>;

interface ResizeableDrawerProps extends DrawerProps {
  open: boolean;
  width: number;
  classes?: DrawerProps['classes'] & Partial<Record<ResizeableDrawerClassKey, string>>;
  styles?: ResizeableDrawerStyles;
}

const useStyles = makeStyles((theme) =>
  createStyles<ResizeableDrawerClassKey, ResizeableDrawerStyles>({
    root: (styles) => ({
      flexShrink: 0,
      ...styles.root
    }),
    drawerBody: (styles) => ({
      width: '100%',
      overflowY: 'auto',
      ...styles.drawerBody
    }),
    drawerPaper: (styles) => ({
      top: 64,
      bottom: 0,
      height: 'auto',
      overflow: 'hidden',
      zIndex: theme.zIndex.appBar - 1,
      ...styles.drawerPaper
    })
  })
);

export default function PersistentDrawer(props: ResizeableDrawerProps) {
  const classes = useStyles(props.styles);

  const drawerRef = useRef<HTMLElement>();

  const { open, children, width, className, classes: propsClasses = {}, PaperProps, anchor = 'left', ...rest } = props;

  const { root, drawerBody, drawerPaper, ...drawerClasses } = propsClasses;

  return (
    <Drawer
      open={open}
      ref={drawerRef}
      anchor={anchor}
      variant="persistent"
      className={clsx(classes.root, className)}
      classes={{ ...drawerClasses, paper: clsx(classes.drawerPaper, drawerPaper) }}
      PaperProps={{ ...PaperProps, style: { width } }}
      {...rest}
    >
      <section className={clsx(classes.drawerBody, drawerBody)}>{children}</section>
    </Drawer>
  );
}
