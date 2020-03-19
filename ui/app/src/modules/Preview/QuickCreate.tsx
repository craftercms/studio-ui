import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircleRounded';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { palette } from "../../styles/theme";
import { getQuickCreateContentList } from '../../services/content';
import { useActiveSiteId, useSpreadState, useSelection } from '../../utils/hooks';
import EmbeddedLegacyEditors from './EmbeddedLegacyEditors';

const translations = defineMessages({
  quickCreateBtnLabel: {
    id: 'quickCreateBtnLabel.label',
    defaultMessage: 'Open quick create menu'
  }
});


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
  const { formatMessage } = useIntl();
  const siteId = useActiveSiteId();
  const AUTHORING_BASE = useSelection<string>(state => state.env.AUTHORING_BASE);
  const defaultFormSrc = `${AUTHORING_BASE}/legacy/form`;
  const [anchorEl, setAnchorEl] = useState(null);
  const [quickCreateContentList, setQuickCreateContentList] = useState(null);
  const [dialogConfig, setDialogConfig] = useSpreadState({
    open: false,
    src: defaultFormSrc,
    type: 'form',
    inProgress: false,
  });

  const handleClick = e => setAnchorEl(e.currentTarget);

  const handleClose = () => setAnchorEl(null);

  useEffect(() => {
    if(siteId) {
      getQuickCreateContentList(siteId).subscribe(data => 
        setQuickCreateContentList(data.items)
      )
    }
  }, [siteId])

  const handleFormDisplay = srcData => {
    const { contentTypeId, path } = srcData;
    const today = new Date();
    const formatPath = path.replace('{year}/{month}', `${today.getFullYear()}/${today.getFullYear()}`)
    const src = 
      `${defaultFormSrc}?newEdit=article&contentTypeId=${contentTypeId}&path=${formatPath}&type=form`;

    setDialogConfig({
      open: true,
      src
    })
  }


  return (
    <>
      <IconButton 
        onClick={handleClick} 
        aria-label={formatMessage(translations.quickCreateBtnLabel)}
      >
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
        
        { quickCreateContentList?.map(item => (
          <MenuItem 
            key={item.siteId} 
            onClick={() => handleFormDisplay(item)}
            className={classes.menuItem}
          >
            {item.label}
          </MenuItem>
        )) }

      </Menu>
      <EmbeddedLegacyEditors
        showTabs={false} 
        showController={false} 
        dialogConfig={dialogConfig}
        setDialogConfig={setDialogConfig}
      />
    </>
  );
}
