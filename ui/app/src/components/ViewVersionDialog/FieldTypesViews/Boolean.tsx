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

import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import React from 'react';

// TODO: props, need to inherit from some other prop
export function Boolean(props) {
  const { contentA: content } = props;
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography>
        {content ? <FormattedMessage defaultMessage="Checked" /> : <FormattedMessage defaultMessage="Unchecked" />}
      </Typography>
    </Box>
  );
}

export default Boolean;
