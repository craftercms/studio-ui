/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import React, { forwardRef, Suspense, useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddRounded';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { makeStyles } from 'tss-react/mui';
import { useDispatch } from 'react-redux';
import { newContentCreationComplete, showEditDialog, showNewContentDialog } from '../../state/actions/dialogs';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import QuickCreateItem from '../../models/content/QuickCreateItem';
import palette from '../../styles/palette';
import Tooltip from '@mui/material/Tooltip';
import { DetailedItem } from '../../models/Item';
import { useSelection } from '../../hooks/useSelection';
import { usePreviewState } from '../../hooks/usePreviewState';
import { useItemsByPath } from '../../hooks/useItemsByPath';
import { lookupItemByPath } from '../../utils/content';
import { processPathMacros } from '../../utils/path';
import { fetchQuickCreateList } from '../../state/actions/content';
import useQuickCreateState from '../../hooks/useQuickCreateState';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import useSystemVersion from '../../hooks/useSystemVersion';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { LoadingState } from '../LoadingState';

const translations = defineMessages({
  quickCreateBtnLabel: {
    id: 'quickCreateBtnLabel.label',
    defaultMessage: 'Open quick create menu'
  },
  quickCreateMenuTooltip: {
    id: 'previewToolbar.quickCreateMenuTooltip',
    defaultMessage: 'Quick create menu'
  }
});

const useStyles = makeStyles()((theme) => ({
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
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.secondary,
    padding: '5px 16px'
  },
  quickCreateEmptyRoot: {
    width: '149px',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    alignItems: 'center',
    boxShadow: 'none'
  },
  quickCreateEmptyCardContent: {
    padding: '5px 10px'
  },
  quickCreateEmptyDescription: {
    fontSize: '12px'
  },
  quickCreateEmptyCardActions: {
    padding: 0,
    '& .MuiButton-root': {
      fontSize: '14px',
      textDecoration: 'underline',
      color: palette.blue.main
    }
  },
  quickCreateLoadingState: {
    width: 80
  }
}));

interface QuickCreateMenuProps {
  open: boolean;
  item?: DetailedItem;
  anchorEl: HTMLElement;
  onNewContentSelected?(): void;
  onQuickCreateItemSelected?(props: {
    authoringBase: string;
    path: string;
    contentTypeId: string;
    isNewContent: boolean;
  }): void;
  onClose?(): void;
}

interface QuickCreateMenuButtonProps {
  disabled?: boolean;
  onMenuBtnClick(e): void;
}

interface QuickCreateSectionProps {
  classes: { [className: string]: string };
  onItemSelected: (item: QuickCreateItem) => any;
  version: string;
  quickCreateItems: QuickCreateItem[];
}

export function QuickCreateMenu(props: QuickCreateMenuProps) {
  const { open, onClose, anchorEl, onNewContentSelected, onQuickCreateItemSelected, item } = props;
  const { classes } = useStyles();
  const authoringBase = useSelection<string>((state) => state.env.authoringBase);
  const itemNewContentButton = item?.availableActionsMap.createContent;
  const { error, isFetching, items: quickCreateItems } = useQuickCreateState();
  const systemVersion = useSystemVersion();

  const onFormDisplay = (item: QuickCreateItem) => {
    const { contentTypeId, path } = item;
    const formatPath = processPathMacros({
      path,
      // Since we can't support these at this stage of creation, at least this will avoid the form opening with an error
      objectId: '(objectId)',
      objectGroupId: '(objectGroupId)',
      fullParentPath: '',
      useUUID: false
    });
    onQuickCreateItemSelected?.({
      path: formatPath,
      contentTypeId,
      isNewContent: true,
      authoringBase
    });
  };

  return (
    <>
      <Menu classes={{ paper: classes.menu }} anchorEl={anchorEl} open={open} onClose={onClose}>
        {itemNewContentButton && (
          <MenuItem
            className={classes.menuTitle}
            onClick={onNewContentSelected}
            sx={{ borderBottom: 1, borderBottomColor: 'divider' }}
          >
            <FormattedMessage id="quickCreateMenu.title" defaultMessage="New Content" />
          </MenuItem>
        )}
        <Typography component="h4" className={classes.menuSectionTitle}>
          <FormattedMessage id="quickCreateMenu.sectionTitle" defaultMessage="Quick Create" />
        </Typography>
        {error ? (
          <ApiResponseErrorState error={error} />
        ) : isFetching ? (
          <LoadingState classes={{ graphic: classes.quickCreateLoadingState }} />
        ) : quickCreateItems && systemVersion ? (
          <QuickCreateSection
            classes={classes}
            version={systemVersion}
            quickCreateItems={quickCreateItems}
            onItemSelected={onFormDisplay}
          />
        ) : null}
      </Menu>
    </>
  );
}

function QuickCreateSection(props: QuickCreateSectionProps) {
  const { version, quickCreateItems, classes, onItemSelected } = props;

  return (
    <>
      {quickCreateItems.map((item) => (
        <MenuItem key={item.path} onClick={() => onItemSelected(item)} className={classes.menuItem}>
          {item.label}
        </MenuItem>
      ))}
      {quickCreateItems.length === 0 && (
        <Card className={classes.quickCreateEmptyRoot}>
          <CardContent className={classes.quickCreateEmptyCardContent}>
            <Typography color="textSecondary" gutterBottom>
              <ErrorOutlineOutlinedIcon fontSize={'small'} />
            </Typography>
            <Typography className={classes.quickCreateEmptyDescription}>
              <FormattedMessage
                id="quickCreateMenu.learnMoreError"
                defaultMessage="Quick create has not been configured. Please contact your system administrator."
              />
            </Typography>
          </CardContent>
          <CardActions className={classes.quickCreateEmptyCardActions}>
            {version && (
              <Button
                size="small"
                href={`https://docs.craftercms.org/en/${version}/developers/content-modeling.html#setting-up-quick-create`}
                target="_blank"
                rel="nofollow noreferrer"
              >
                <FormattedMessage id="quickCreateMenu.learnMore" defaultMessage="Learn More" />
              </Button>
            )}
          </CardActions>
        </Card>
      )}
    </>
  );
}

const QuickCreateMenuButton = forwardRef<HTMLButtonElement, QuickCreateMenuButtonProps>((props, ref) => {
  const { onMenuBtnClick, disabled = false } = props;
  const { formatMessage } = useIntl();
  return (
    <Tooltip title={disabled ? '' : formatMessage(translations.quickCreateMenuTooltip)}>
      <IconButton
        disabled={disabled}
        ref={ref}
        size="small"
        color="primary"
        onClick={onMenuBtnClick}
        aria-label={formatMessage(translations.quickCreateBtnLabel)}
      >
        <AddCircleIcon fontSize="large" />
      </IconButton>
    </Tooltip>
  );
});

const QuickCreate = forwardRef<HTMLButtonElement, { item?: DetailedItem }>((props, ref) => {
  const { item } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPreviewItemPath, setCurrentPreviewItemPath] = useState<string>(null);
  const { guest } = usePreviewState();
  const dispatch = useDispatch();
  const items = useItemsByPath();
  const site = useActiveSiteId();

  useEffect(() => {
    site && dispatch(fetchQuickCreateList());
  }, [site, dispatch]);

  const onMenuBtnClick = (e) => {
    setAnchorEl(e.currentTarget);
    if (guest) {
      const { modelId, models } = guest;
      const {
        craftercms: { path }
      } = models[modelId];
      setCurrentPreviewItemPath(path);
    }
  };

  const onMenuClose = () => setAnchorEl(null);

  const onNewContentSelected = () => {
    onMenuClose();
    dispatch(
      showNewContentDialog({
        item: lookupItemByPath(currentPreviewItemPath, items),
        // @ts-ignore - required attributes of `showEditDialog` are submitted by new content dialog `onContentTypeSelected` callback and injected into the showEditDialog action by the GlobalDialogManger
        onContentTypeSelected: showEditDialog({})
      })
    );
  };

  const onQuickCreateItemSelected = (props) => {
    onMenuClose();
    dispatch(
      showEditDialog({
        ...props,
        inProgress: false,
        onSaveSuccess: newContentCreationComplete()
      })
    );
  };

  return (
    <>
      <QuickCreateMenuButton ref={ref} onMenuBtnClick={onMenuBtnClick} />
      <QuickCreateMenu
        item={item}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onMenuClose}
        onNewContentSelected={onNewContentSelected}
        onQuickCreateItemSelected={onQuickCreateItemSelected}
      />
    </>
  );
});

export default QuickCreate;
