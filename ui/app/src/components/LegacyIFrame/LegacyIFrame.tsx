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

import React, { IframeHTMLAttributes } from 'react';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useEnv } from '../../utils/hooks/useEnv';

export interface LegacyIFrameProps {
  path: string;
  title?: string;
  iframeProps?: IframeHTMLAttributes<any>;
}

const useStyles = makeStyles(() =>
  createStyles({
    iframe: {
      width: '100%',
      height: '100%',
      border: 'none',
      display: 'block'
    }
  })
);

function LegacyIFrame(props: LegacyIFrameProps) {
  const { path, title = '', iframeProps } = props;
  const authoringUrl = useEnv().authoringBase;
  const classes = useStyles();

  const iframeSrc = `${authoringUrl}${path.startsWith('/') ? '' : '/'}${path}`;

  return <iframe frameBorder={0} title={title} src={iframeSrc} className={classes.iframe} {...iframeProps} />;
}

export default LegacyIFrame;
