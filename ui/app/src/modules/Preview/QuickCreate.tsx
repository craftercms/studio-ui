import React, { useEffect } from "react";
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { palette } from "../../styles/theme";
import { getQuickCreateContentList } from "../../services/content";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addBtn: {
      fill: palette.green.main,
      width: 30,
      height: 30,

      "&:hover": {
        fill: palette.green.shade
      }
    }
  })
);

export default function QuickCreate() {
  const classes = useStyles({});
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = e => setAnchorEl(e.currentTarget);

  const handleClose = () => setAnchorEl(null);

  useEffect(() => {
    getQuickCreateContentList('editorial').subscribe(data => console.log('getQuickCreateContentList data', data))
  }, [])

  return (
    <>
      <AddCircleIcon fontSize="small" onClick={handleClick} className={classes.addBtn}/>
      <Menu
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
    </>
  );
}
