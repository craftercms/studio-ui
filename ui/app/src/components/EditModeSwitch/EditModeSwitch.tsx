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

import { withStyles } from 'tss-react/mui';
import Switch, { SwitchProps } from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';
import { DetailedItem, SandboxItem } from '../../models/Item';
import { useIntl } from 'react-intl';
import translations from './translations';
import { useDispatch } from 'react-redux';
import { setPreviewEditMode } from '../../state/actions/preview';
import { useSelection } from '../../hooks/useSelection';
import { isItemLockedForMe } from '../../utils/content';
import { useActiveUser } from '../../hooks/useActiveUser';

const EditSwitch = withStyles(Switch, (theme, _params, classes) => {
  const green = theme.palette.success.main;
  return {
    root: {
      width: 42,
      height: 26,
      padding: 0,
      margin: theme.spacing(1)
    },
    switchBase: {
      padding: 1,
      [`&.${classes.disabled}`]: {
        opacity: 0.5,
        [`& + .${classes.track}`]: {
          opacity: 0.5
        },
        [`& .${classes.thumb}`]: {
          opacity: 0.5
        }
      },
      [`&.${classes.checked}`]: {
        transform: 'translateX(16px)',
        [`& + .${classes.track}`]: {
          backgroundColor: green,
          opacity: 1,
          border: 'none'
        },
        [`& .${classes.thumb}`]: {
          color: theme.palette.common.white,
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="15" viewBox="0 0 24 24" width="15"><path fill="${encodeURIComponent(
            theme.palette.success.dark
          )}" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19zM20.71 5.63l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41z" /></svg>')`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }
      }
    },
    checked: {},
    disabled: {
      opacity: 0.5
    },
    thumb: {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="15" viewBox="0 0 24 24" width="15"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19zM20.71 5.63l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41z" /></svg>')`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      width: 24,
      height: 24
    },
    track: {
      borderRadius: 26 / 2,
      border: `1px solid ${theme.palette.grey[400]}`,
      backgroundColor: theme.palette.grey[50],
      opacity: 1,
      transition: theme.transitions.create(['background-color', 'border'])
    }
  };
});

export interface EditModeSwitchProps extends Partial<SwitchProps> {
  item?: SandboxItem | DetailedItem;
}

export function EditModeSwitch(props: EditModeSwitchProps) {
  const { item, disabled, ...rest } = props;
  const user = useActiveUser();
  const isLocked = isItemLockedForMe(item, user.username);
  const write = Boolean(item?.availableActionsMap.edit);
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const editMode = useSelection((state) => state.preview.editMode) && !isLocked && write;

  const onChange = (e) => {
    dispatch(setPreviewEditMode({ editMode: e.target.checked }));
  };

  return (
    <Tooltip
      title={
        isLocked
          ? item
            ? formatMessage(translations.itemLocked, { lockOwner: item.lockOwner })
            : ''
          : !write
          ? formatMessage(translations.editNotAvailable)
          : formatMessage(translations.toggleEditMode)
      }
    >
      <span>
        <EditSwitch color="default" checked={editMode} onChange={onChange} {...rest} disabled={disabled || !write} />
      </span>
    </Tooltip>
  );
}

export default EditModeSwitch;
