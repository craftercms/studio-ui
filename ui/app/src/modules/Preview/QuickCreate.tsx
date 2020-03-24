import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircleRounded';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { palette } from '../../styles/theme';
import { getQuickCreateContentList } from '../../services/content';
import {
  useActiveSiteId,
  useSpreadState,
  useSelection
} from '../../utils/hooks';
import EmbeddedLegacyEditors from './EmbeddedLegacyEditors';
import NewContentDialog from '../Content/Authoring/NewContentDialog';

const translations = defineMessages({
  quickCreateBtnLabel: {
    id: 'quickCreateBtnLabel.label',
    defaultMessage: 'Open quick create menu'
  }
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addBtn: {
      padding: 0
    },

    addIcon: {
      width: 30,
      height: 30,
      fill: palette.green.main
    },

    menu: {
      transform: 'translate(20px, 15px)',
      '& ul': {
        paddingTop: 0,
        minWidth: '140px'
      }
    },

    menuItem: {
      fontSize: 14
    },

    menuTitle: {
      fontSize: 14
    },

    menuSectionTitle: {
      fontSize: 12,
      backgroundColor: palette.gray.light0,
      color: palette.gray.medium3,
      padding: '5px 16px',
      '&:hover': {
        backgroundColor: palette.gray.light0,
        cursor: 'text'
      }
    }
  })
);

export function QuickCreateMenu({ anchorEl, handleMenuClose }) {
  const classes = useStyles({});
  const [quickCreateContentList, setQuickCreateContentList] = useState(null);
  const [displayNewContentDialog, setDisplayNewContentDialog] = useState(false);
  const siteId = useActiveSiteId();
  const AUTHORING_BASE = useSelection<string>(
    state => state.env.AUTHORING_BASE
  );
  const defaultFormSrc = `${AUTHORING_BASE}/legacy/form`;
  const [dialogConfig, setDialogConfig] = useSpreadState({
    open: false,
    src: defaultFormSrc,
    type: 'form',
    inProgress: false
  });


  const handleNewContentClick = () => {
    setDisplayNewContentDialog(true);
  };

  const handleFormDisplay = srcData => {
    const { contentTypeId, path } = srcData;
    const today = new Date();
    const formatPath = path.replace(
      '{year}',
      today.getFullYear()
    ).replace(
      '{month}',
      ('0' + (today.getMonth() + 1)).slice(-2)
    );
    const src = `${defaultFormSrc}?isNewContent=true&contentTypeId=${contentTypeId}&path=${formatPath}&type=form`;

    setDialogConfig({
      open: true,
      src
    });
  };

  const handleNewContentDialogClose = () => {
    setDisplayNewContentDialog(false);
  };

  const handleOpenType = (srcData) => () => {
    const { form } = srcData;
    const path = '/site/website';
    const src = `${defaultFormSrc}?isNewContent=true&contentTypeId=${form}&path=${path}&type=form`;

    setDialogConfig({
      open: true,
      src
    });

    setDisplayNewContentDialog(false);
  };

  useEffect(() => {
    if (siteId) {
      getQuickCreateContentList(siteId).subscribe(data =>
        setQuickCreateContentList(data.items)
      );
    }
  }, [siteId]);

  return (
    <>
      <Menu
        className={classes.menu}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          className={classes.menuTitle}
          onClick={handleNewContentClick}>
          <FormattedMessage
            id="quickCreateMenu.title"
            defaultMessage="New Content"
          />
        </MenuItem>
        <Divider />
        <Typography
          component="h4"
          className={classes.menuSectionTitle}
        >
          <FormattedMessage
            id="quickCreateMenu.sectionTitle"
            defaultMessage="Quick Create"
          />
        </Typography>

        {quickCreateContentList?.map(item =>
          <MenuItem
            key={item.path}
            onClick={() => {
              handleMenuClose();
              handleFormDisplay(item);
            }}
            className={classes.menuItem}
          >
            {item.label}
          </MenuItem>
        )}
      </Menu>
      <EmbeddedLegacyEditors
        showTabs={false}
        showController={false}
        dialogConfig={dialogConfig}
        setDialogConfig={setDialogConfig}
      />
      <NewContentDialog
        open={displayNewContentDialog}
        handleClose={handleNewContentDialogClose}
        handleOpenType={handleOpenType}
        contentTypesFetchConfig={{
          site: siteId,
          path: '/site/website/'
        }}
      />
    </>
  );

}

export function QuickCreateMenuBtn({ handleMenuBtnClick }) {
  const classes = useStyles({});
  const { formatMessage } = useIntl();

  return (
    <IconButton
      onClick={handleMenuBtnClick}
      aria-label={formatMessage(translations.quickCreateBtnLabel)}
      className={classes.addBtn}
      size="small"
    >
      <AddCircleIcon fontSize="large" className={classes.addIcon} />
    </IconButton>
  );
}

export default function QuickCreate() {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuBtnClick = e => setAnchorEl(e.currentTarget);

  const handleMenuClose = () => setAnchorEl(null);


  return (
    <>
      <QuickCreateMenuBtn handleMenuBtnClick={handleMenuBtnClick} />
      <QuickCreateMenu anchorEl={anchorEl} handleMenuClose={handleMenuClose} />
    </>
  );
}
