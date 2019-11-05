/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import withStyles from "@material-ui/styles/withStyles";
import { fade } from '@material-ui/core/styles/colorManipulator';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Button from "@material-ui/core/Button";
import React from "react";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import Typography from "@material-ui/core/Typography";

export const ColorButton = withStyles(() => ({
  root: {
    color: '#FF9500',
    paddingRight: '10px',
    border: `1px solid ${fade('#FF9500', 0.5)}`,
    '&:hover': {
      backgroundColor: fade('#FF9500', 0.08),
    },
  },
}))(Button);

const useStyles = makeStyles(() => ({
  paper: {
    width: '215px',
    '& ul': {
      padding: 0
    },
    '& li:first-child': {
      borderBottom: '1px solid #dedede'
    },
    '& li': {
      paddingTop: '10px',
      paddingBottom: '10px',
    }
  },
  helperText: {
    padding: '0px 16px 10px 16px'
  }
}));

interface ConfirmDropdownProps {
  onConfirm(): any,
  text: string,
  cancelText: string,
  confirmText: string
  confirmHelperText?: string,
}


export default function SelectButton(props: ConfirmDropdownProps) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const classes = useStyles({});
  const {onConfirm, text, cancelText, confirmText, confirmHelperText} = props;

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

  return (
    <div>
      <ColorButton variant="outlined" onClick={handleClick}>
        {text} <ArrowDropDownIcon/>
      </ColorButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        classes={{paper: classes.paper }}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleClose}>{cancelText}</MenuItem>
        <MenuItem onClick={handleConfirm}>{confirmText}</MenuItem>
        <Typography variant="body2" color="textSecondary" className={classes.helperText}>
          {confirmHelperText}
        </Typography>
      </Menu>
    </div>
  )
}
