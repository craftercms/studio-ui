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
import { useActiveUser } from '../../hooks/useActiveUser';
import { isItemLockedForMe } from '../../utils/content';
import { useDispatch } from 'react-redux';
import { setPreviewEditMode } from '../../state/actions/preview';
import { DetailedItem } from '../../models/Item';
import { usePreviewState } from '../../hooks/usePreviewState';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import { UNDEFINED } from '../../utils/constants';
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';

export interface EditModesSwitcherProps {
  item: DetailedItem;
  disabled?: boolean;
}

export function EditModesSwitcher(props: EditModesSwitcherProps) {
  const { item, disabled } = props;
  const user = useActiveUser();
  const isLocked = isItemLockedForMe(item, user.username);
  const write = Boolean(item?.availableActionsMap.edit);
  const dispatch = useDispatch();
  const { editMode, highlightMode } = usePreviewState();
  const onEditModeChange = (editMode, highlightMode?) => dispatch(setPreviewEditMode({ editMode, highlightMode }));
  const isComputedDisabled = disabled || !write || isLocked;
  const isAllHighlightMode = editMode && highlightMode === 'all';
  const isMoveHighlightMode = editMode && !isAllHighlightMode;
  const getStyle = () => ({
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
          <FormattedMessage
            id="editModesSwitcher.offButtonTooltip"
            defaultMessage="Switch off editing ({shortcutKey})"
            values={{
              shortcutKey: editMode ? (isAllHighlightMode ? 'e' : 'm') : 'e | m'
            }}
          />
        }
      >
        <IconButton
          size="small"
          color={!editMode ? 'error' : UNDEFINED}
          disabled={disabled}
          onClick={() => onEditModeChange(false)}
          sx={{
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            ...(!editMode && { cursor: 'default' })
          }}
        >
          <PowerSettingsNewRoundedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip
        title={
          isComputedDisabled ? (
            ''
          ) : (
            <FormattedMessage id="editModesSwitcher.editModeTooltip" defaultMessage="Edit mode (e)" />
          )
        }
      >
        <IconButton
          color={isAllHighlightMode ? 'success' : UNDEFINED}
          disabled={isComputedDisabled}
          size="small"
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
          isComputedDisabled ? (
            ''
          ) : (
            <FormattedMessage id="editModesSwitcher.moveModeTooltip" defaultMessage="Move mode (m)" />
          )
        }
      >
        <IconButton
          color={isMoveHighlightMode ? 'primary' : UNDEFINED}
          disabled={isComputedDisabled}
          size="small"
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

export default EditModesSwitcher;
