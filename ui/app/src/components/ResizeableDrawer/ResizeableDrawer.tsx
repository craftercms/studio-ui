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

import { DrawerProps } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import React, { useCallback, useRef, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import palette from '../../styles/palette';
import { CSSObject as CSSProperties } from 'tss-react';

export type ResizeableDrawerClassKey =
  | 'root'
  | 'drawerBody'
  | 'drawerPaper'
  | 'drawerPaperLeft'
  | 'drawerPaperRight'
  | 'drawerPaperBelowToolbar'
  | 'resizeHandle'
  | 'resizeHandleActive'
  | 'resizeHandleLeft'
  | 'resizeHandleRight'
  | 'resizingOverlay';

export type ResizeableDrawerStyles = Partial<Record<ResizeableDrawerClassKey, CSSProperties>>;

interface ResizeableDrawerProps extends DrawerProps {
  open: boolean;
  width: number;
  maxWidth?: number;
  belowToolbar?: boolean;
  classes?: DrawerProps['classes'] & Partial<Record<ResizeableDrawerClassKey, string>>;
  styles?: ResizeableDrawerStyles;
  onWidthChange?(width: number): void;
  onResizeStart?(): void;
  onResizeStop?(): void;
}

const useStyles = makeStyles<ResizeableDrawerStyles, ResizeableDrawerClassKey>()(
  (
    theme,
    {
      root,
      drawerBody,
      drawerPaper,
      drawerPaperBelowToolbar,
      drawerPaperLeft,
      drawerPaperRight,
      resizeHandle,
      resizeHandleLeft,
      resizeHandleRight,
      resizeHandleActive,
      resizingOverlay
    } = {} as any
  ) => ({
    root: {
      flexShrink: 0,
      ...root
    },
    drawerBody: {
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      ...drawerBody
    },
    drawerPaper: {
      bottom: 0,
      overflow: 'hidden',
      maxWidth: '95% !important',
      backgroundColor: theme.palette.background.default,
      ...drawerPaper
    },
    drawerPaperBelowToolbar: {
      top: 65,
      height: 'auto',
      zIndex: theme.zIndex.appBar - 1,
      ...drawerPaperBelowToolbar
    },
    drawerPaperLeft: {
      borderRight: 'none',
      ...drawerPaperLeft
    },
    drawerPaperRight: {
      borderLeft: 'none',
      ...drawerPaperRight
    },
    resizeHandle: {
      width: '1px',
      cursor: 'ew-resize',
      padding: '4px 0 0',
      position: 'absolute',
      top: 0,
      bottom: 0,
      zIndex: 100,
      backgroundColor: theme.palette.divider,
      transition: 'width 200ms',
      '&:hover': {
        width: '4px',
        visibility: 'visible',
        backgroundColor: palette.blue.tint
      },
      ...resizeHandle
    },
    resizeHandleLeft: {
      left: 0,
      ...resizeHandleLeft
    },
    resizeHandleRight: {
      right: 0,
      ...resizeHandleRight
    },
    resizeHandleActive: {
      width: '4px',
      visibility: 'visible',
      backgroundColor: palette.blue.tint,
      ...resizeHandleActive
    },
    resizingOverlay: {
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        ...resizingOverlay
      }
    }
  })
);

export function ResizeableDrawer(props: ResizeableDrawerProps) {
  const { classes, cx } = useStyles(props.styles);
  const [resizeActive, setResizeActive] = useState(false);

  const drawerRef = useRef<HTMLDivElement>();

  const {
    open,
    children,
    width,
    maxWidth = 500,
    onWidthChange,
    onResizeStart,
    onResizeStop,
    className,
    classes: propsClasses = {},
    PaperProps,
    anchor = 'left',
    belowToolbar = false,
    ...rest
  } = props;

  const {
    root,
    drawerBody,
    drawerPaper,
    drawerPaperBelowToolbar,
    resizeHandle,
    resizeHandleActive,
    resizeHandleLeft,
    resizeHandleRight,
    ...drawerClasses
  } = propsClasses;

  const handleMouseMove = useCallback(
    (e) => {
      if (onWidthChange) {
        e.preventDefault();
        const newWidth =
          (anchor === 'left'
            ? e.clientX - drawerRef.current.getBoundingClientRect().left
            : window.innerWidth - (e.clientX - drawerRef.current.getBoundingClientRect().left)) + 5;
        onWidthChange(newWidth <= maxWidth ? newWidth : maxWidth);
      }
    },
    [anchor, onWidthChange, maxWidth]
  );

  const handleMouseDown = onWidthChange
    ? () => {
        setResizeActive(true);
        onResizeStart?.();
        const handleMouseUp = () => {
          setResizeActive(false);
          onResizeStop?.();
          document.removeEventListener('mouseup', handleMouseUp, true);
          document.removeEventListener('mousemove', handleMouseMove, true);
        };
        document.addEventListener('mouseup', handleMouseUp, true);
        document.addEventListener('mousemove', handleMouseMove, true);
      }
    : null;

  return (
    <Drawer
      open={open}
      ref={drawerRef}
      anchor={anchor}
      variant="persistent"
      className={cx(classes.root, className)}
      classes={{
        ...drawerClasses,
        paper: cx(
          classes.drawerPaper,
          belowToolbar && classes.drawerPaperBelowToolbar,
          drawerPaper,
          belowToolbar && drawerPaperBelowToolbar,
          onWidthChange && (anchor === 'left' ? classes.drawerPaperLeft : classes.drawerPaperRight),
          resizeActive && classes.resizingOverlay
        )
      }}
      PaperProps={{ ...PaperProps, style: { width } }}
      {...rest}
    >
      {onWidthChange && (
        <div
          onMouseDown={handleMouseDown}
          className={cx(
            classes.resizeHandle,
            resizeActive && classes.resizeHandleActive,
            anchor === 'left' ? classes.resizeHandleRight : classes.resizeHandleLeft
          )}
        />
      )}
      <section className={cx(classes.drawerBody, drawerBody)}>{children}</section>
    </Drawer>
  );
}

export default ResizeableDrawer;
