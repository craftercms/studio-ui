import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircleRounded';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { palette } from "../../styles/theme";
import { getQuickCreateContentList } from '../../services/content';
import { useActiveSiteId, useSpreadState } from '../../utils/hooks';
import EmbeddedLegacyEditors from './EmbeddedLegacyEditors';


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
  const siteId = useActiveSiteId();
  const [anchorEl, setAnchorEl] = useState(null);
  const [quickCreateContentList, setQuickCreateContentList] = useState([]);
  const [dialogConfig, setDialogConfig] = useSpreadState({
    open: false,
    src: 'http://authoring.sample.com:8080/studio/legacy/form?site=editorial&path=/site/website/articles/2020/3/index.xml&type=form',
    // src: '/studio/legacy/form?site=editorial&path=/site/website/index.xml&type=form',
    type: 'form',
    inProgress: false,
  });

  const handleClick = e => setAnchorEl(e.currentTarget);

  const handleClose = () => setAnchorEl(null);


  const getPath = (type: string) => {}

  useEffect(() => {
    if(siteId) {
      getQuickCreateContentList(siteId).subscribe(data => 
       {
         console.log(data.items)
        setQuickCreateContentList(data.items)
       }
      )
    }
  }, [siteId])


  return (
    <>
      <IconButton onClick={handleClick}>
        <AddCircleIcon fontSize="small" className={classes.addBtn}/>
      </IconButton>
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
          <MenuItem key={i} onClick={() => {
            setDialogConfig({
              open: true
            })
          }} className={classes.menuItem}>
            {item.label}
          </MenuItem>
        )) }

      </Menu>
      <EmbeddedLegacyEditors getPath={getPath} dialogConfig={dialogConfig} setDialogConfig={setDialogConfig} showController={false} />
    </>
  );
}
