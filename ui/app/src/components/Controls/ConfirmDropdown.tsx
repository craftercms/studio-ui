/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import ArrowDown from '@mui/icons-material/ArrowDropDownRounded';
import Button, { ButtonTypeMap } from '@mui/material/Button';
import React, { ReactNode, useMemo } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { SvgIconTypeMap } from '@mui/material/SvgIcon';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import Tooltip from '@mui/material/Tooltip';

const useStyles = makeStyles(() =>
  createStyles({
    menuPaper: {
      maxWidth: '250px',
      '& ul': {
        padding: 0
      },
      '& li': {
        borderTop: '1px solid #dedede',
        paddingTop: '10px',
        paddingBottom: '10px'
      }
    },
    helperText: {
      padding: '10px 16px 10px 16px'
    }
  })
);

interface ConfirmDropdownProps {
  text?: ReactNode;
  cancelText: ReactNode;
  confirmText: ReactNode;
  confirmHelperText?: ReactNode;
  disabled?: boolean;
  buttonVariant?: ButtonTypeMap['props']['variant'];
  classes?: {
    button?: string;
    menuPaper?: string;
  };
  size?: IconButtonProps['size'];
  icon?: OverridableComponent<SvgIconTypeMap>;
  iconColor?: 'inherit' | 'primary' | 'secondary' | 'action' | 'disabled' | 'error';
  iconTooltip?: React.ReactNode;
  onConfirm(): any;
  onCancel?(): any;
}

export default function ConfirmDropdown(props: ConfirmDropdownProps) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const classes = useStyles({});
  const {
    onConfirm,
    onCancel,
    text,
    cancelText,
    confirmText,
    confirmHelperText,
    disabled = false,
    buttonVariant = 'outlined',
    icon: Icon,
    iconColor = 'primary',
    iconTooltip,
    size = 'medium'
  } = props;

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleConfirm = () => {
    handleClose();
    onConfirm();
  };

  const handleCancel = () => {
    handleClose();
    onCancel?.();
  };

  // Not memoizing causes the menu to get misplaced upon opening.
  const iconButton = useMemo(
    () => (
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size={size}>
        <Icon color={disabled ? 'disabled' : iconColor} />
      </IconButton>
    ),
    [Icon, disabled, iconColor, size]
  );

  return (
    <>
      {Icon ? (
        iconTooltip ? (
          <Tooltip title={iconTooltip}>{iconButton}</Tooltip>
        ) : (
          iconButton
        )
      ) : (
        <Button
          className={props.classes?.button}
          variant={buttonVariant}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          disabled={disabled}
          endIcon={<ArrowDown />}
        >
          {text}
        </Button>
      )}
      <Menu
        anchorEl={anchorEl}
        classes={{ paper: clsx(classes.menuPaper, props.classes?.menuPaper) }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        {confirmHelperText && (
          <Typography variant="body1" className={classes.helperText}>
            {confirmHelperText}
          </Typography>
        )}
        <MenuItem onClick={handleCancel}>{cancelText}</MenuItem>
        <MenuItem onClick={handleConfirm}>{confirmText}</MenuItem>
      </Menu>
    </>
  );
}
