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

import React, { IframeHTMLAttributes } from 'react';
import { useEnv } from '../../hooks/useEnv';
import Box from '@mui/material/Box';

export interface LegacyIFrameProps {
  path: string;
  title?: string;
  iframeProps?: IframeHTMLAttributes<any>;
}

function LegacyIFrame(props: LegacyIFrameProps) {
  const { path, title = '', iframeProps } = props;
  const authoringUrl = useEnv().authoringBase;
  const iframeSrc = `${authoringUrl}${path.startsWith('/') ? '' : '/'}${path}`;

  return (
    <Box
      component="iframe"
      frameBorder={0}
      title={title}
      src={iframeSrc}
      sx={{
        width: '100%',
        height: '100%',
        border: 'none',
        display: 'block'
      }}
      {...iframeProps}
    />
  );
}

export default LegacyIFrame;
