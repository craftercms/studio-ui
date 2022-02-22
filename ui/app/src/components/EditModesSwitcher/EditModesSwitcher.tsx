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
import EditModesSwitcherUI from './EditModesSwitcherUI';
import { useActiveUser } from '../../hooks/useActiveUser';
import { isItemLockedForMe } from '../../utils/content';
import { useDispatch } from 'react-redux';
import { setPreviewEditMode } from '../../state/actions/preview';
import { DetailedItem } from '../../models/Item';
import { usePreviewState } from '../../hooks/usePreviewState';

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
  const onChange = (editMode, highlightMode) => dispatch(setPreviewEditMode({ editMode, highlightMode }));
  const isDisabled = disabled || !write || isLocked;
  return (
    <EditModesSwitcherUI
      disabled={isDisabled}
      isEditMode={editMode}
      highlightMode={highlightMode}
      onEditModeChange={onChange}
    />
  );
}

export default EditModesSwitcher;
