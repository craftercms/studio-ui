import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import AddCircleIcon from '@material-ui/icons/AddCircleRounded';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { palette } from "../../styles/theme";
import { getQuickCreateContentList } from '../../services/content';


function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addBtn: {
      fill: palette.green.main,
      width: 30,
      height: 30,

      "&:hover": {
        fill: palette.green.shade
      }
    },

    menu: {
      "& ul": {
        paddingTop: 0
      }
    },

    menuTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      backgroundColor: palette.gray.light2,
      borderBottom: palette.gray.light3,
      marginBottom: 5,
      textTransform: 'uppercase',

      "&:hover": {
        backgroundColor: palette.gray.light2
      }
    },

    menuItem: {
      fontSize: 12,
      
      "& a": {
        color: palette.black,
        textDecoration: 'none'
      } 
    }
  })
);

export default function QuickCreate() {
  const classes = useStyles({});
  const query = useQuery();
  const siteId = query.get('site');
  const [anchorEl, setAnchorEl] = useState(null);
  const [quickCreateContentList, setQuickCreateContentList] = useState([]);

  const handleClick = e => setAnchorEl(e.currentTarget);

  const handleClose = () => setAnchorEl(null);

  useEffect(() => {
    getQuickCreateContentList(siteId).subscribe(data => 
      setQuickCreateContentList(data.items)
    )
  }, [siteId])


  return (
    <>
      <AddCircleIcon fontSize="small" onClick={handleClick} className={classes.addBtn}/>
      <Menu
        className={classes.menu}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem className={classes.menuTitle}>
          <FormattedMessage
            id="quickCreateMenu.title"
            defaultMessage="quick create"
          />
        </MenuItem>
        
        { quickCreateContentList.length && quickCreateContentList.map((item, i) => (
          <MenuItem key={i} onClick={handleClose} className={classes.menuItem}>
            <Link to='/'>{item.label}</Link>
          </MenuItem>
        )) }

      </Menu>
    </>
  );
}
