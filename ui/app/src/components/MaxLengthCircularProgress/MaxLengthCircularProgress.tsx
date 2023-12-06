/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { PartialSxRecord } from '../../models';
import { FormattedMessage } from 'react-intl';

export interface MaxLengthCircularProgressProps {
  max: number;
  current: number;
  threshold?: number;
  renderThresholdPercentage?: number;
  sx?: PartialSxRecord<'root'>;
  sxs?: PartialSxRecord<'root' | 'tooltip' | 'typography' | 'circularProgress'>;
}

export function MaxLengthCircularProgress({
  max = 1000,
  current = 0,
  threshold = 20,
  renderThresholdPercentage,
  sx,
  sxs
}: MaxLengthCircularProgressProps) {
  const percentage = Math.floor((current * 100) / max);
  if (renderThresholdPercentage != null && percentage < renderThresholdPercentage) return <></>;
  const remaining = max - current;
  const displayRemaining = remaining <= threshold;
  const overLimit = current > max;
  return (
    <Tooltip
      sx={sxs?.tooltip}
      title={
        overLimit ? (
          <FormattedMessage defaultMessage="Max length exceeded" />
        ) : (
          <FormattedMessage defaultMessage="Max length ({current} / {max})" values={{ current, max }} />
        )
      }
    >
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          ...sx,
          ...sxs?.root
        }}
      >
        <CircularProgress
          sx={sxs?.circularProgress}
          thickness={5}
          variant="determinate"
          value={percentage > 100 ? 100 : percentage}
          color={displayRemaining ? (overLimit ? 'error' : 'warning') : 'primary'}
        />
        <Typography
          variant="caption"
          component="div"
          color={overLimit ? 'error' : 'text.secondary'}
          children={displayRemaining ? remaining : `${percentage}%`}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            ...sxs?.typography
          }}
        />
      </Box>
    </Tooltip>
  );
}

export default MaxLengthCircularProgress;
