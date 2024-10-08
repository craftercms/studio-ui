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

// TODO: props, need to inherit from some other prop
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { asLocalizedDateTime } from '../../../utils/datetime';
import React from 'react';
import useLocale from '../../../hooks/useLocale';

export function DateTime(props) {
  const { contentA: content } = props;
  const locale = useLocale();
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Tooltip title={content as string}>
        <Typography>
          {content
            ? asLocalizedDateTime(
                new Date(content as string).getTime(),
                locale.localeCode,
                locale.dateTimeFormatOptions
              )
            : ''}
        </Typography>
      </Tooltip>
    </Box>
  );
}

export default DateTime;
