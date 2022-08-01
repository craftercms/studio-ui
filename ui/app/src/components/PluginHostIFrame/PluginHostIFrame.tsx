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

import * as React from 'react';
import { forwardRef, IframeHTMLAttributes } from 'react';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import PluginFileBuilder from '../../models/PluginFileBuilder';
import Box, { BoxProps } from '@mui/material/Box';
import { toQueryString } from '../../utils/object';

type CompletePluginFileBuilder = Required<PluginFileBuilder>;

type Optional = 'site' | 'id' | 'file';

export interface PluginHostIFrameProps extends IframeHTMLAttributes<HTMLIFrameElement> {
  sx?: BoxProps['sx'];
  plugin: Omit<CompletePluginFileBuilder, Optional> & Partial<Pick<CompletePluginFileBuilder, Optional>>;
}

export const PluginHostIFrame = forwardRef<HTMLIFrameElement, PluginHostIFrameProps>((props, ref) => {
  const {
    sx,
    plugin: { type, name, id, file, site },
    ...other
  } = props;
  const siteId = useActiveSiteId();
  return (
    <Box
      title="Studio plugin host frame"
      {...other}
      sx={typeof sx === 'object' ? { width: '100%', height: '100%', border: 'none', ...sx } : sx}
      ref={ref}
      component="iframe"
      src={`/studio/plugin${toQueryString(
        {
          site: site || siteId,
          type,
          name,
          file,
          pluginId: id
        },
        { skipNull: true, skipEmptyString: true }
      )}`}
    />
  );
});

export default PluginHostIFrame;
