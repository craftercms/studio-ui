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

import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircleRounded';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { palette } from '../../styles/theme';
import {
  usePreviewState,
  useQuickCreateListResource,
  useSelection,
  useSystemVersionResource
} from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import { showNewContentDialog } from '../../state/actions/dialogs';
import { newContentCreationComplete, showEditDialog } from '../../state/reducers/dialogs/edit';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import QuickCreateItem from '../../models/content/QuickCreateItem';
import { Resource } from '../../models/Resource';
import Suspencified from '../../components/SystemStatus/Suspencified';
import { getSimplifiedVersion } from '../../utils/string';

const translations = defineMessages({
  quickCreateBtnLabel: {
    id: 'quickCreateBtnLabel.label',
    defaultMessage: 'Open quick create menu'
  }
});

const useStyles = makeStyles(() =>
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
  })
);

interface QuickCreateMenuProps {
  open: boolean;
  anchorEl: HTMLElement;
  resource: {
    version: Resource<string>;
    quickCreate: Resource<QuickCreateItem[]>;
  };
  onNewContentSelected?(): void;
  onQuickCreateItemSelected?(src: string): void;
  onClose?(): void;
}

interface QuickCreateMenuButtonProps {
  onMenuBtnClick(e): void;
}

interface QuickCreateSectionProps {
  classes: { [className: string]: string };
  onItemSelected: (item: QuickCreateItem) => any;
  resource: {
    version: Resource<string>;
    quickCreate: Resource<QuickCreateItem[]>;
  };
}

export function QuickCreateMenu(props: QuickCreateMenuProps) {
  const {
    open,
    onClose,
    anchorEl,
    resource,
    onNewContentSelected,
    onQuickCreateItemSelected
  } = props;
  const classes = useStyles({});
  const authoringBase = useSelection<string>((state) => state.env.authoringBase);
  const baseFormSrc = `${authoringBase}/legacy/form`;

  const onFormDisplay = ({ contentTypeId, path }: QuickCreateItem) => {
    const today = new Date();
    const formatPath = path
      .replace('{year}', `${today.getFullYear()}`)
      .replace('{month}', ('0' + (today.getMonth() + 1)).slice(-2));
    const src = `${baseFormSrc}?isNewContent=true&contentTypeId=${contentTypeId}&path=${formatPath}&type=form`;
    onQuickCreateItemSelected?.(src);
  };

  return (
    <>
      <Menu
        classes={{ paper: classes.menu }}
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={onClose}
      >
        <MenuItem className={classes.menuTitle} onClick={onNewContentSelected}>
          <FormattedMessage id="quickCreateMenu.title" defaultMessage="New Content" />
        </MenuItem>
        <Divider />
        <Typography component="h4" className={classes.menuSectionTitle}>
          <FormattedMessage id="quickCreateMenu.sectionTitle" defaultMessage="Quick Create" />
        </Typography>
        <Suspencified loadingStateProps={{ classes: { graphic: classes.quickCreateLoadingState } }}>
          <QuickCreateSection
            classes={classes}
            resource={resource}
            onItemSelected={onFormDisplay}
          />
        </Suspencified>
      </Menu>
    </>
  );
}

function QuickCreateSection(props: QuickCreateSectionProps) {
  const { resource, classes, onItemSelected } = props;
  const quickCreateItems = resource.quickCreate.read();

  let version = getSimplifiedVersion(resource.version.read());

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
                id="quickCreateMenu.learnMore"
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

function QuickCreateMenuButton(props: QuickCreateMenuButtonProps) {
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

export default function() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPreview, setCurrentPreview] = useState(null);
  const { guest } = usePreviewState();
  const dispatch = useDispatch();

  const onMenuBtnClick = (e) => {
    setAnchorEl(e.currentTarget);
    if (guest) {
      const { modelId, models } = guest;
      const {
        craftercms: { label, path }
      } = models[modelId];
      setCurrentPreview({
        label,
        path
      });
    }
  };

  const onMenuClose = () => setAnchorEl(null);

  const onNewContentSelected = () => {
    onMenuClose();
    dispatch(
      showNewContentDialog({
        item: currentPreview,
        compact: false,
        onContentTypeSelected: showEditDialog()
      })
    );
  };

  const onQuickCreateItemSelected = (src: string) => {
    onMenuClose();
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

  const quickCreateResource = useQuickCreateListResource();

  const versionResource = useSystemVersionResource();

  return (
    <>
      <QuickCreateMenuButton onMenuBtnClick={onMenuBtnClick} />
      <QuickCreateMenu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onMenuClose}
        resource={{ quickCreate: quickCreateResource, version: versionResource }}
        onNewContentSelected={onNewContentSelected}
        onQuickCreateItemSelected={onQuickCreateItemSelected}
      />
    </>
  );
}
