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
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import palette from '../../styles/palette';

const useStyles = makeStyles((theme) => ({
  drawer: {
    flexShrink: 0
  },
  drawerPaper: {
    top: 64,
    bottom: 0,
    height: 'auto',
    zIndex: theme.zIndex.appBar - 1,
    borderRight: 0
  },
  dragger: {
    width: '1px',
    cursor: 'ew-resize',
    padding: '4px 0 0',
    borderTop: '1px solid #ddd',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    transition: 'width 200ms',
    '&.hovered, &:hover': {
      width: '4px',
      visibility: 'visible',
      backgroundColor: palette.blue.tint
    }
  }
}));

interface ResizeableDrawerProps extends DrawerProps {
  open: boolean;
  width: number;
  onWidthChange(width: number): void;
}

export default function(props: ResizeableDrawerProps) {
  const classes = useStyles();
  const [hovered, setHovered] = useState(false);
  const {
    open,
    children,
    width,
    onWidthChange,
    className,
    classes: propsClasses,
    PaperProps,
    ...rest
  } = props;

  const handleMouseMove = useCallback(
    (e) => {
      e.preventDefault();
      const newWidth = e.clientX - document.body.offsetLeft;
      onWidthChange(newWidth+5);
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
      className={clsx(classes.drawer, className)}
      classes={{ ...propsClasses, paper: classes.drawerPaper }}
      PaperProps={{ ...PaperProps, style: { width } }}
      {...rest}
    >
      <div onMouseDown={handleMouseDown} className={ clsx(classes.dragger, hovered && 'hovered')} />
      {children}
    </Drawer>
  );
}
