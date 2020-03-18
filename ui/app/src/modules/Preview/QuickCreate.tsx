import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircleRounded';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { palette } from "../../styles/theme";
import { getQuickCreateContentList } from '../../services/content';
import { useActiveSiteId, useSpreadState, useSelection } from '../../utils/hooks';
import EmbeddedLegacyEditors from './EmbeddedLegacyEditors';


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
  const siteId = useActiveSiteId();
  const AUTHORING_BASE = useSelection<string>(state => state.env.AUTHORING_BASE);
  const defaultSrc = `${AUTHORING_BASE}/legacy/form?`;
  const [anchorEl, setAnchorEl] = useState(null);
  const [quickCreateContentList, setQuickCreateContentList] = useState([]);
  const [dialogConfig, setDialogConfig] = useSpreadState({
    open: false,
    src: '',
    type: 'form',
    inProgress: false,
  });

  const handleClick = e => setAnchorEl(e.currentTarget);

  const handleClose = () => setAnchorEl(null);


  const getPath = (type: string) => console.log('GETTING PATH!')

  useEffect(() => {
    if(siteId) {
      getQuickCreateContentList(siteId).subscribe(data => 
        setQuickCreateContentList(data.items)
      )
    }
  }, [siteId])

  const handleMenuItem = srcData => {
    const today = new Date();
    const src = 
      `${defaultSrc}/legacy/form?newEdit=article&contentTypeId=${srcData.contentTypeId}&path=${srcData.path.replace('{year}/{month}', `${today.getFullYear()}/${today.getFullYear()}`)}&type=form`;
    setDialogConfig({
      open: true,
      src
    })
  }


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
        
        { quickCreateContentList.length && quickCreateContentList.map(item => (
          <MenuItem 
            key={item.siteId} 
            onClick={() => handleMenuItem(item)}
            className={classes.menuItem}
          >
            {item.label}
          </MenuItem>
        )) }

      </Menu>
      <EmbeddedLegacyEditors 
        getPath={getPath}
        dialogConfig={dialogConfig}
        setDialogConfig={setDialogConfig}
        showController={false} 
      />
    </>
  );
}
