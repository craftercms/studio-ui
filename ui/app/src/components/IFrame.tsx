/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from "react";
import clsx from "clsx";
import { createStyles, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => createStyles({
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
}));

interface IFrameProps {
  url: string;
  name: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  border?: 'portrait' | 'landscape';
}

export default function IFrame(props: IFrameProps) {
  const classes = useStyles({});
  const {
    url,
    name,
    width,
    height,
    border,
    className
  } = props;

  const cls = clsx(classes.iframe, {
    [className || '']: !!className,
    [classes.iframeWithBorder]: border != null,
    [classes.iframeWithBorderPortrait]: border === 'landscape',
    [classes.iframeWithBorderLandscape]: border === 'portrait'
  });

  return (
    <iframe
      style={{width, height}}
      id="searchPreviewIframe"
      title={name}
      src={url || 'about:blank'}
      className={cls}
    />
  )
}
