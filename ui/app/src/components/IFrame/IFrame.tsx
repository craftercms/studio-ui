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

import React from 'react';
import clsx from 'clsx';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(() =>
  createStyles({
    iframe: {
      width: '100%',
      maxWidth: '100%',
      border: 'none',
      height: '100%',
      transition: 'width .25s ease, height .25s ease'
    },
    iframeWithBorder: {
      borderRadius: 20,
      borderColor: '#555'
    },
    iframeWithBorderLandscape: {
      borderWidth: '10px 50px'
    },
    iframeWithBorderPortrait: {
      borderWidth: '50px 10px'
    }
  })
);

interface IFrameProps {
  url: string;
  title: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  border?: 'portrait' | 'landscape';
  onLoadComplete?(): void;
}

export function IFrame(props: IFrameProps) {
  const classes = useStyles({});
  const { url, title, width, height, border, className, onLoadComplete } = props;

  const cls = clsx(classes.iframe, {
    [className || '']: !!className,
    [classes.iframeWithBorder]: border != null,
    [classes.iframeWithBorderPortrait]: border === 'landscape',
    [classes.iframeWithBorderLandscape]: border === 'portrait'
  });

  return (
    <iframe
      style={{ width, height }}
      title={title}
      onLoad={onLoadComplete}
      src={url || 'about:blank'}
      className={cls}
    />
  );
}

export default IFrame;

