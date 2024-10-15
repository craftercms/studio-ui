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
import clsx from 'clsx';
import { lighten, useTheme } from '@mui/material/styles';

export interface DiffCollectionItemProps {
  state: 'new' | 'deleted' | 'changed' | 'unchanged';
  primaryText: ReactNode;
  secondaryText?: ReactNode;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  disableHighlight?: boolean;
  hideState?: boolean;
  onSelect?(selected: boolean): void;
}

export function DiffCollectionItem(props: DiffCollectionItemProps) {
  const {
    state,
    primaryText,
    secondaryText,
    isSelected = false,
    disableHighlight = false,
    onSelect,
    isSelectionMode,
    hideState
  } = props;
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      className={clsx(state, isSelected && 'selected', disableHighlight && 'disable-highlight')}
      sx={{
        display: 'flex',
        alignItems: 'center',
        paddingRight: '10px',
        borderRadius: 1,
        borderStyle: 'solid',
        borderWidth: '1px',
        width: '100%',
        '&.unchanged': {
          color: theme.palette.getContrastText(isDarkMode ? palette.gray.light7 : palette.gray.light3),
          backgroundColor: isDarkMode ? palette.gray.light7 : palette.gray.light3,
          borderColor: 'divider',
          '&:hover:not(.disable-highlight), &.selected': {
            color: theme.palette.getContrastText(palette.gray.light5),
            backgroundColor: palette.gray.light5,
            borderColor: palette.gray.light5
          }
        },
        '&.new': {
          width: '50%',
          marginLeft: 'auto',
          color: theme.palette.getContrastText(palette.green.highlight),
          borderColor: palette.green.tint,
          backgroundColor: palette.green.highlight,
          '&:hover:not(.disable-highlight), &.selected': {
            color: theme.palette.getContrastText(lighten(palette.green.highlight, 0.5)),
            backgroundColor: lighten(palette.green.highlight, 0.5)
          }
        },
        '&.changed': {
          color: theme.palette.getContrastText(palette.yellow.highlight),
          backgroundColor: palette.yellow.highlight,
          borderColor: palette.yellow.tint,
          '&:hover:not(.disable-highlight), &.selected': {
            color: theme.palette.getContrastText(lighten(palette.yellow.highlight, 0.5)),
            backgroundColor: lighten(palette.yellow.highlight, 0.5)
          }
        },
        '&.deleted': {
          width: '50%',
          color: theme.palette.getContrastText(palette.red.highlight),
          backgroundColor: palette.red.highlight,
          borderColor: palette.red.tint,
          '&:hover:not(.disable-highlight), &.selected': {
            color: theme.palette.getContrastText(lighten(palette.red.highlight, 0.5)),
            backgroundColor: lighten(palette.red.highlight, 0.5)
          }
        }
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            sx={{
              p: 0,
              pr: 1,
              color: 'inherit',
              display: !isSelectionMode && 'none'
            }}
            checked={isSelected}
            onChange={(e) => onSelect?.(e.target.checked)}
          />
        }
        label={
          <>
            <Typography component="div" variant="body1" children={primaryText} />
            <Typography component="div" variant="body2" children={secondaryText} />
          </>
        }
        sx={{
          width: '100%',
          py: 1,
          px: 1.25,
          marginLeft: !isSelectionMode && 0,
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

export default DiffCollectionItem;
