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

import Button, { ButtonProps } from '@mui/material/Button';
import React, { useRef, useState } from 'react';
import Menu, { MenuProps } from '@mui/material/Menu';
import { ListItemProps, ListItemText, ListItemTextProps } from '@mui/material';
import { CheckRounded, KeyboardArrowDownRounded } from '@mui/icons-material';
import { UNDEFINED } from '../../utils/constants';
import ListItemButton from '@mui/material/ListItemButton';

interface DropDownMenuProps extends ButtonProps {
  onMenuItemClick(e, optionId: string): void;
  closeOnSelection?: boolean;
  options: Array<{
    id: string;
    selected?: boolean;
    primaryText: React.ReactNode;
    secondaryText?: React.ReactNode;
    disabled?: boolean;
  }>;
  menuProps?: Partial<Omit<MenuProps, 'open' | 'anchorEl' | 'onClose'>>;
  listItemProps?: Partial<Omit<ListItemProps, 'button'>>;
  listItemTextProps?: Partial<Omit<ListItemTextProps, 'primary' | 'secondary'>>;
}

export function DropDownMenu(props: DropDownMenuProps) {
  const {
    options,
    onMenuItemClick: onMenuItemClickProp,
    onClick,
    closeOnSelection = true,
    menuProps,
    listItemProps,
    listItemTextProps,
    ...buttonProps
  } = props;
  const buttonRef = useRef<HTMLButtonElement>();
  const [open, setOpen] = useState(false);
  const onClose = () => setOpen(false);
  const onMenuItemClick = (e, option) => {
    closeOnSelection && onClose();
    onMenuItemClickProp?.(e, option.id);
  };
  return (
    <>
      <Button
        endIcon={<KeyboardArrowDownRounded />}
        {...buttonProps}
        ref={buttonRef}
        onClick={(e) => {
          // @ts-ignore
          if (onClick?.(e) !== false) {
            setOpen(true);
          }
        }}
      />
      <Menu {...menuProps} open={open} anchorEl={buttonRef.current} onClose={onClose}>
        {options?.map((option) => (
          <ListItemButton
            key={option.id}
            component="li"
            selected={option.selected}
            secondaryAction={option.selected ? <CheckRounded /> : UNDEFINED}
            {...listItemProps}
            onClick={(e) => onMenuItemClick(e, option)}
            disabled={option.disabled}
          >
            <ListItemText primary={option.primaryText} secondary={option.secondaryText} {...listItemTextProps} />
          </ListItemButton>
        ))}
      </Menu>
    </>
  );
}

export default DropDownMenu;
