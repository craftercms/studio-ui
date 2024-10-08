/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import AsyncVideoPlayer from '../../AsyncVideoPlayer';
import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// TODO: props, need to inherit from some other prop
export function VideoView(props) {
  const { contentA: content } = props;
  return (
    <Box sx={{ textAlign: 'center' }}>
      <AsyncVideoPlayer playerOptions={{ src: content as string, controls: true, width: 400 }} />
      <Typography variant="subtitle2">{content as string}</Typography>
    </Box>
  );
}

export default VideoView;
