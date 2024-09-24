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

import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import React, { ReactNode } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import palette from '../../../styles/palette';
import { FormattedMessage } from 'react-intl';
import useStyles from '../../UserManagement/styles';

interface DiffStateItemProps {
  state: 'new' | 'deleted' | 'changed' | 'unchanged';
  label: ReactNode;
  selected?: boolean;
  selectionMode?: boolean;
  disableHighlight?: boolean;
  hideState?: boolean;
  onSelect?(selected: boolean): void;
}

export function StateItem(props: DiffStateItemProps) {
  const { state, label, selected = false, disableHighlight = false, onSelect, selectionMode, hideState } = props;
  const { cx } = useStyles();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        paddingRight: '10px',
        borderRadius: '5px',
        width: '100%',
        '&.unchanged': {
          color: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.getContrastText(palette.gray.medium4) : palette.gray.medium4,
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? palette.gray.medium4 : palette.gray.light1),
          '&:hover:not(.disable-highlight), &.selected': {
            color: (theme) =>
              theme.palette.mode === 'dark'
                ? theme.palette.getContrastText(palette.gray.medium7)
                : palette.gray.medium4,
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? palette.gray.medium7 : palette.gray.light5)
          }
        },
        '&.new': {
          color: palette.green.shade,
          backgroundColor: palette.green.highlight,
          marginLeft: 'auto',
          width: '50%',
          '&:hover:not(.disable-highlight), &.selected': {
            backgroundColor: palette.green.main,
            color: (theme) => theme.palette.getContrastText(palette.green.main)
          }
        },
        '&.changed': {
          color: palette.yellow.shade,
          backgroundColor: palette.yellow.highlight,
          '&:hover:not(.disable-highlight), &.selected': {
            background: palette.yellow.main,
            color: (theme) => theme.palette.getContrastText(palette.yellow.main)
          }
        },
        '&.deleted': {
          color: palette.red.shade,
          backgroundColor: palette.red.highlight,
          width: '50%',
          '&:hover:not(.disable-highlight), &.selected': {
            background: palette.red.tint,
            color: (theme) => theme.palette.getContrastText(palette.red.tint)
          }
        }
      }}
      className={cx(state, selected && 'selected', disableHighlight && 'disable-highlight')}
    >
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            sx={{
              color: 'inherit',
              p: 0,
              pr: 1,
              display: !selectionMode && 'none'
            }}
            checked={selected}
            onChange={(e) => onSelect?.(e.target.checked)}
          />
        }
        label={
          <Typography noWrap sx={{ fontSize: 14 }}>
            {label}
          </Typography>
        }
        sx={{
          width: '100%',
          padding: '8.5px 10px',
          marginLeft: !selectionMode && 0,
          cursor: disableHighlight && 'default'
        }}
      />
      {!hideState && state === 'changed' && (
        <Typography variant="caption">
          <FormattedMessage defaultMessage="Changed" />
        </Typography>
      )}
      {!hideState && state === 'unchanged' && (
        <Typography variant="caption">
          <FormattedMessage defaultMessage="Unchanged" />
        </Typography>
      )}
    </Box>
  );
}

export default StateItem;
