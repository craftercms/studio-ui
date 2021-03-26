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
import AddCircleIcon from '@material-ui/icons/AddRounded';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { usePreviewState, useQuickCreateListResource, useSelection, useSystemVersionResource } from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import { newContentCreationComplete, showEditDialog, showNewContentDialog } from '../../state/actions/dialogs';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import QuickCreateItem from '../../models/content/QuickCreateItem';
import { Resource } from '../../models/Resource';
import Suspencified from '../../components/SystemStatus/Suspencified';
import { getSimplifiedVersion } from '../../utils/string';
import palette from '../../styles/palette';
import Tooltip from '@material-ui/core/Tooltip';

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

const useStyles = makeStyles((theme) =>
  createStyles({
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
  resource: {
    version: Resource<string>;
    quickCreate: Resource<QuickCreateItem[]>;
  };
}

export function QuickCreateMenu(props: QuickCreateMenuProps) {
  const { open, onClose, anchorEl, resource, onNewContentSelected, onQuickCreateItemSelected } = props;
  const classes = useStyles({});
  const authoringBase = useSelection<string>((state) => state.env.authoringBase);
  const baseFormSrc = `${authoringBase}/legacy/form`;

  const onFormDisplay = ({ contentTypeId, path }: QuickCreateItem) => {
    const today = new Date();
    const formatPath = path
      .replace('{year}', `${today.getFullYear()}`)
      .replace('{month}', ('0' + (today.getMonth() + 1)).slice(-2));
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
        <MenuItem className={classes.menuTitle} onClick={onNewContentSelected}>
          <FormattedMessage id="quickCreateMenu.title" defaultMessage="New Content" />
        </MenuItem>
        <Divider />
        <Typography component="h4" className={classes.menuSectionTitle}>
          <FormattedMessage id="quickCreateMenu.sectionTitle" defaultMessage="Quick Create" />
        </Typography>
        <Suspencified loadingStateProps={{ classes: { graphic: classes.quickCreateLoadingState } }}>
          <QuickCreateSection classes={classes} resource={resource} onItemSelected={onFormDisplay} />
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

const QuickCreateMenuButton = React.forwardRef<HTMLButtonElement, QuickCreateMenuButtonProps>(function(props, ref) {
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

const QuickCreate = React.forwardRef<HTMLButtonElement, { disabled?: boolean }>(function(props, ref) {
  const { disabled = false } = props;
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

  const quickCreateResource = useQuickCreateListResource();

  const versionResource = useSystemVersionResource();

  return (
    <>
      <QuickCreateMenuButton disabled={disabled} ref={ref} onMenuBtnClick={onMenuBtnClick} />
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
});

export default QuickCreate;
