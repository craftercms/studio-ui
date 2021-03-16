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
import React, { useCallback, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import palette from '../../styles/palette';
import { CSSProperties } from '@material-ui/styles';

export type ResizeableDrawerClassKey = 'root' | 'drawerPaper' | 'resizeHandle' | 'drawerBody';

export type ResizeableDrawerStyles = Partial<Record<ResizeableDrawerClassKey, CSSProperties>>;

interface ResizeableDrawerProps extends DrawerProps {
  open: boolean;
  width: number;
  classes?: DrawerProps['classes'] & Partial<Record<ResizeableDrawerClassKey, string>>;
  styles?: ResizeableDrawerStyles;
  onWidthChange(width: number): void;
}

const useStyles = makeStyles((theme) =>
  createStyles<ResizeableDrawerClassKey, ResizeableDrawerStyles>({
    root: (styles) => ({
      flexShrink: 0,
      ...styles.root
    }),
    drawerBody: (styles) => ({
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
    }),
    resizeHandle: (styles) => ({
      width: '1px',
      cursor: 'ew-resize',
      padding: '4px 0 0',
      position: 'absolute',
      top: 0,
      right: -1,
      bottom: 0,
      zIndex: 100,
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
      transition: 'width 200ms',
      '&.hovered, &:hover': {
        width: '4px',
        visibility: 'visible',
        backgroundColor: palette.blue.tint
      },
      ...styles.resizeHandle
    })
  })
);

export default function ResizeableDrawer(props: ResizeableDrawerProps) {
  const classes = useStyles(props.styles);
  const [hovered, setHovered] = useState(false);
  const { open, children, width, onWidthChange, className, classes: propsClasses, PaperProps, ...rest } = props;

  const handleMouseMove = useCallback(
    (e) => {
      e.preventDefault();
      const newWidth = e.clientX - document.body.offsetLeft;
      onWidthChange(newWidth + 5);
    },
    [onWidthChange]
  );

  const handleMouseDown = () => {
    setHovered(true);
    const handleMouseUp = () => {
      setHovered(false);
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('mousemove', handleMouseMove, true);
    };
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('mousemove', handleMouseMove, true);
  };

  return (
    <Drawer
      open={open}
      anchor="left"
      variant="persistent"
      className={clsx(classes.root, className)}
      classes={{ ...propsClasses, paper: clsx(classes.drawerPaper, propsClasses?.drawerPaper) }}
      PaperProps={{ ...PaperProps, style: { width } }}
      {...rest}
    >
      <div onMouseDown={handleMouseDown} className={clsx(classes.resizeHandle, hovered && 'hovered')} />
      <section className={clsx(classes.drawerBody, propsClasses?.drawerBody)}>{children}</section>
    </Drawer>
  );
}
