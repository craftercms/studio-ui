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

import ArrowDown from '@material-ui/icons/ArrowDropDownRounded';
import Button, { ButtonTypeMap } from '@material-ui/core/Button';
import React, { ReactNode } from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import IconButton from '@material-ui/core/IconButton';
import { SvgIconTypeMap } from '@material-ui/core/SvgIcon';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import Tooltip from '@material-ui/core/Tooltip';

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
    iconTooltip
  } = props;

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

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

  return (
    <>
      {Icon ? (
        iconTooltip ? (
          <Tooltip title={iconTooltip}>
            <span>
              <IconButton onClick={handleClick} disabled={disabled}>
                <Icon color={disabled ? 'disabled' : iconColor} />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <IconButton onClick={handleClick} disabled={disabled}>
            <Icon color={disabled ? 'disabled' : iconColor} />
          </IconButton>
        )
      ) : (
        <Button className={props.classes?.button} variant={buttonVariant} onClick={handleClick} disabled={disabled}>
          {text} <ArrowDown />
        </Button>
      )}
      <Menu
        anchorEl={anchorEl}
        getContentAnchorEl={null}
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
