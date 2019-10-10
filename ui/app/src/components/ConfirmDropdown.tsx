import withStyles from "@material-ui/styles/withStyles";
import { fade } from '@material-ui/core/styles/colorManipulator';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Button from "@material-ui/core/Button";
import React from "react";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import Typography from "@material-ui/core/Typography";

const ColorButton = withStyles(() => ({
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

interface ConfirmDropdown {
  onConfirm(): any,
  text: string,
  cancelText: string,
  confirmText: string
  confirmHelperText?: string,
}


export default function SelectButton(props: ConfirmDropdown) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const classes = useStyles({});
  const {onConfirm, text, cancelText, confirmText, confirmHelperText} = props;

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
        <MenuItem onClick={onConfirm}>{confirmText}</MenuItem>
        <Typography variant="body2" color="textSecondary" className={classes.helperText}>
          {confirmHelperText}
        </Typography>
      </Menu>
    </div>
  )
}
