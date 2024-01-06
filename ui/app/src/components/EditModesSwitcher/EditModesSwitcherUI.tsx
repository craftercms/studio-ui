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
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { HighlightMode } from '../../models/GlobalState';
import { UNDEFINED } from '../../utils/constants';
import { FormattedMessage } from 'react-intl';

export interface EditModesSwitcherUIProps {
  isEditMode: boolean;
  highlightMode: HighlightMode;
  size?: IconButtonProps['size'];
  activeSxShadow?: number;
  disabled?: boolean;
  onEditModeChange(on: boolean, mode?: HighlightMode): void;
}

export function EditModesSwitcherUI(props: EditModesSwitcherUIProps) {
  const { isEditMode, highlightMode, onEditModeChange, size = 'small', activeSxShadow = 0, disabled = false } = props;
  const isAllHighlightMode = isEditMode && highlightMode === 'all';
  const isMoveHighlightMode = isEditMode && !isAllHighlightMode;
  const getStyle = () => ({
    boxShadow: activeSxShadow,
    bgcolor: 'background.default',
    ':hover': {
      cursor: 'default'
    }
  });
  return (
    <Box
      sx={{
        minWidth: 104,
        borderRadius: 20,
        display: 'inline-block',
        border: (theme) =>
          `1px solid ${theme.palette.mode === 'light' ? theme.palette.divider : theme.palette.grey[700]}`,
        transition: (theme) => theme.transitions.create(['background-color', 'border'])
      }}
    >
      <Tooltip
        title={
          disabled ? (
            ''
          ) : (
            <FormattedMessage
              id="editModesSwitcher.offButtonTooltip"
              defaultMessage="Switch off editing ({shortcutKey})"
              values={{
                shortcutKey: isEditMode ? (isAllHighlightMode ? 'e' : 'm') : 'e | m'
              }}
            />
          )
        }
      >
        <IconButton
          size={size}
          color={!isEditMode ? 'error' : UNDEFINED}
          disabled={disabled}
          onClick={() => onEditModeChange(false)}
          sx={{
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            ...(!isEditMode && {
              boxShadow: activeSxShadow,
              cursor: 'default'
            })
          }}
        >
          <PowerSettingsNewRoundedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip
        title={
          disabled ? '' : <FormattedMessage id="editModesSwitcher.editModeTooltip" defaultMessage="Edit mode (e)" />
        }
      >
        <IconButton
          color={isAllHighlightMode ? 'success' : UNDEFINED}
          disabled={disabled}
          size={size}
          onClick={() => onEditModeChange(true, 'all')}
          sx={{
            borderRadius: 0,
            ...(isAllHighlightMode && getStyle())
          }}
        >
          <EditRoundedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip
        title={
          disabled ? '' : <FormattedMessage id="editModesSwitcher.moveModeTooltip" defaultMessage="Move mode (m)" />
        }
      >
        <IconButton
          color={isMoveHighlightMode ? 'primary' : UNDEFINED}
          disabled={disabled}
          size={size}
          onClick={() => onEditModeChange(true, 'move')}
          sx={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            ...(isMoveHighlightMode && getStyle())
          }}
        >
          <DragIndicatorRoundedIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default EditModesSwitcherUI;
