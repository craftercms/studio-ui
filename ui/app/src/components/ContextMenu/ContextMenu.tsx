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

import React, { ElementType, ReactNode } from 'react';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from 'tss-react/mui';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { rand } from '../PathNavigator/utils';
import Skeleton from '@mui/material/Skeleton';

import { SystemIcon, SystemIconDescriptor } from '../SystemIcon';

export interface ContextMenuOption {
  id: string;
  icon?: SystemIconDescriptor;
  label: ReactNode;
}

export interface ContextMenuProps extends MenuProps {
  isLoading?: boolean;
  numOfLoaderItems?: number;
  classes?: MenuProps['classes'] & Partial<Record<'menuItem' | 'emptyRoot' | 'loadingRoot', string>>;
  options: Array<Array<ContextMenuOption>>;
  emptyState?: {
    icon?: ElementType;
    message: string;
  };
  onMenuItemClicked(optionId: string, event: React.MouseEvent<Element, MouseEvent>): void;
}

const useStyles = makeStyles()(() => ({
  emptyRoot: {
    display: 'block',
    padding: '10px',
    textAlign: 'center'
  },
  loadingRoot: {
    width: '135px',
    padding: '0 15px'
  }
}));

export function ContextMenu(props: ContextMenuProps) {
  const { classes, cx } = useStyles();
  const {
    options,
    classes: propClasses,
    onMenuItemClicked,
    emptyState,
    isLoading = false,
    numOfLoaderItems = 5,
    ...menuProps
  } = props;
  return (
    <Menu {...menuProps} classes={propClasses}>
      {isLoading ? (
        <div className={cx(classes.loadingRoot, propClasses?.loadingRoot)}>
          {new Array(numOfLoaderItems).fill(null).map((value, i) => (
            <Typography key={i} variant="body2" style={{ width: `${rand(85, 100)}%`, padding: '6px 0' }}>
              <Skeleton animation="wave" width="100%" />
            </Typography>
          ))}
        </div>
      ) : options.flatMap((i) => i).length === 0 ? (
        <div className={cx(classes.emptyRoot, propClasses?.emptyRoot)}>
          <ErrorOutlineOutlinedIcon fontSize="small" />
          <Typography variant="caption" display="block">
            {emptyState?.message || (
              <FormattedMessage
                id="contextMenu.emptyOptionsMessage"
                defaultMessage="No options available to display."
              />
            )}
          </Typography>
        </div>
      ) : (
        options.map((section: any, i: number) =>
          section.map((option: ContextMenuOption, y: number) => (
            <MenuItem
              dense
              key={option.id}
              divider={i !== options.length - 1 && y === section.length - 1}
              onClick={(e) => onMenuItemClicked(option.id, e)}
              className={propClasses?.menuItem}
            >
              <Typography variant="body2">{option.label}</Typography>
              {option.icon && <SystemIcon icon={option.icon} sx={{ ml: 1 }} />}
            </MenuItem>
          ))
        )
      )}
    </Menu>
  );
}

export default ContextMenu;
