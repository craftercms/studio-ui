import React from "react";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { palette } from "../../styles/theme";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addBtn: {
      background: palette.green.main,
      color: palette.white,
      width: 30,
      height: 30,
      minHeight: 30,

      "&:hover": {
        background: palette.green.shade
      }
    }
  })
);

export function QuickCreate() {
  const classes = useStyles({});
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = e => setAnchorEl(e.currentTarget);

  const handleClose = () => setAnchorEl(null);

  return (
    <div>
      <Fab
        size="small"
        aria-label="quick create"
        onClick={handleClick}
        className={classes.addBtn}
      >
        <AddIcon fontSize="small" />
      </Fab>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem onClick={handleClose}>Item 1</MenuItem>
        <MenuItem onClick={handleClose}>Item 2</MenuItem>
        <MenuItem onClick={handleClose}>Item 3</MenuItem>
      </Menu>
    </div>
  );
}
