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

import { Slide } from '@mui/material';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MaximizeIcon from '@mui/icons-material/OpenInBrowserRounded';
import React, { ReactNode } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import MinimizedBarPortal from '../MinimizedBarPortal/MinimizedBarPortal';

export interface MinimizedBarProps {
  open: boolean;
  title: ReactNode;
  subtitle?: string;
  status?: 'indeterminate' | number;
  onMaximize?(): void;
}

export function MinimizedBar(props: MinimizedBarProps) {
  const { open, title, onMaximize, subtitle, status } = props;
  return open ? (
    <MinimizedBarPortal>
      <Slide direction="left" in mountOnEnter unmountOnExit>
        <Paper
          elevation={4}
          sx={(theme) => ({
            display: 'flex',
            padding: `${theme.spacing(2)} ${theme.spacing(2.5)}`,
            alignItems: 'center',
            marginLeft: '20px',
            position: 'relative',
            border: `1px solid ${theme.palette.divider}`
          })}
        >
          <Box>
            <Typography variant="body1" children={title} />
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  fontSize: '14px',
                  marginLeft: '15px'
                }}
                children={subtitle}
              />
            )}
          </Box>
          {onMaximize ? (
            <IconButton aria-label="Maximize" onClick={onMaximize} children={<MaximizeIcon />} size="large" />
          ) : null}
          {status && (
            <LinearProgress
              sx={{
                position: 'absolute',
                bottom: '0',
                width: '100%',
                left: '0',
                borderBottomLeftRadius: '3px',
                borderBottomRightRadius: '3px'
              }}
              variant={status === 'indeterminate' ? 'indeterminate' : 'determinate'}
              value={status === 'indeterminate' ? null : status}
            />
          )}
        </Paper>
      </Slide>
    </MinimizedBarPortal>
  ) : null;
}

export default MinimizedBar;
