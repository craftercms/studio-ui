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
import { useActiveSiteId, usePreviewState, useSelection } from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import ErrorDialog from '../../components/SystemStatus/ErrorDialog';
import { ApiResponse } from '../../models/ApiResponse';
import { showNewContentDialog } from '../../state/actions/dialogs';
import { newContentCreationComplete, showEditDialog } from '../../state/reducers/dialogs/edit';

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
      paddingTop: 0,
      minWidth: '140px'
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

interface QuickCreateMenuProps {
  anchorEl: HTMLElement;
  onNewContentSelected?(): void;
  onQuickCreateItemSelected?(src: string): void;
  onClose?(): void;
}

interface QuickCreateMenuButtonProps {
  onMenuBtnClick(e): void;
}

export function QuickCreateMenu(props: QuickCreateMenuProps) {
  const {
    anchorEl,
    onClose,
    onNewContentSelected,
    onQuickCreateItemSelected
  } = props;
  const classes = useStyles({});
  const siteId = useActiveSiteId();
  const AUTHORING_BASE = useSelection<string>((state) => state.env.AUTHORING_BASE);
  const defaultFormSrc = `${AUTHORING_BASE}/legacy/form`;
  const [error, setError] = useState<ApiResponse>(null);
  const [quickCreateContentList, setQuickCreateContentList] = useState(null);

  const onNewContentClick = () => {
    onClose();
    onNewContentSelected?.();
  };

  const onFormDisplay = (srcData) => () => {
    const { contentTypeId, path: _path } = srcData;
    const today = new Date();
    const formatPath = _path
      .replace('{year}', today.getFullYear())
      .replace('{month}', ('0' + (today.getMonth() + 1)).slice(-2));

    onClose();
    const src = `${defaultFormSrc}?isNewContent=true&contentTypeId=${contentTypeId}&path=${formatPath}&type=form`;
    onQuickCreateItemSelected?.(src);
  };

  useEffect(() => {
    if (siteId) {
      getQuickCreateContentList(siteId).subscribe(
        (data) => setQuickCreateContentList(data.items),
        (error) => setError(error.response.response)
      );
    }
  }, [siteId]);

  return (
    <>
      <Menu
        classes={{ paper: classes.menu }}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={onClose}
      >
        <MenuItem className={classes.menuTitle} onClick={onNewContentClick}>
          <FormattedMessage id="quickCreateMenu.title" defaultMessage="New Content" />
        </MenuItem>
        <Divider />
        <Typography component="h4" className={classes.menuSectionTitle}>
          <FormattedMessage id="quickCreateMenu.sectionTitle" defaultMessage="Quick Create" />
        </Typography>
        {quickCreateContentList?.map((item) => (
          <MenuItem key={item.path} onClick={onFormDisplay(item)} className={classes.menuItem}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
      <ErrorDialog open={Boolean(error)} error={error} onDismiss={() => setError(null)} />
    </>
  );
}

export function QuickCreateMenuButton(props: QuickCreateMenuButtonProps) {
  const { onMenuBtnClick } = props;
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  return (
    <IconButton
      onClick={onMenuBtnClick}
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
  const [currentPreview, setCurrentPreview] = useState(null);
  const { guest } = usePreviewState();
  const dispatch = useDispatch();
  const siteId = useActiveSiteId();

  const onMenuBtnClick = (e) => {
    setAnchorEl(e.currentTarget);
    if (guest) {
      const { modelId, models } = guest;
      const {
        craftercms: { label, path }
      } = models[modelId];

      const item = {
        label,
        path
      };

      setCurrentPreview(item);
    }
  };

  const onMenuClose = () => setAnchorEl(null);

  const onNewContentSelected = () => {
    dispatch(
      showNewContentDialog({
        item: currentPreview,
        compact: false,
        onContentTypeSelected: showEditDialog()
      })
    );
  };

  const onQuickCreateItemSelected = (src: string) => {
    dispatch(
      showEditDialog({
        src,
        type: 'form',
        inProgress: false,
        showTabs: false,
        onSaveSuccess: newContentCreationComplete()
      })
    );
  };

  return (
    <>
      <QuickCreateMenuButton onMenuBtnClick={onMenuBtnClick} />
      <QuickCreateMenu
        anchorEl={anchorEl}
        onClose={onMenuClose}
        onNewContentSelected={onNewContentSelected}
        onQuickCreateItemSelected={onQuickCreateItemSelected}
      />
    </>
  );
}
