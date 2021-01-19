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

import { DetailedItem } from '../../../models/Item';
import React, { useState } from 'react';
import { useStyles } from './styles';
import ListItem from '@material-ui/core/ListItem';
import clsx from 'clsx';
import Checkbox from '@material-ui/core/Checkbox';
import FolderIcon from '@material-ui/icons/FolderOpenRounded';
import Typography from '@material-ui/core/Typography';
import FlagRoundedIcon from '@material-ui/icons/FlagRounded';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVertRounded';
import ChevronRightRoundedIcon from '@material-ui/icons/ChevronRightRounded';
import { isFolder, isNavigable, isPreviewable } from './utils';
import ComponentIcon from '../../Icons/Component';
import Page from '../../Icons/Page';
import CropOriginalRoundedIcon from '@material-ui/icons/CropOriginalRounded';
import Tooltip from '@material-ui/core/Tooltip';
import { defineMessages, useIntl } from 'react-intl';
import LevelDescriptorIcon from '../../Icons/LevelDescriptor';

interface NavItemProps {
  item: DetailedItem;
  locale: string;
  isLeaf?: boolean;
  isActive?: boolean;
  isLevelDescriptor?: boolean;
  isSelectMode?: boolean;
  showItemNavigateToButton?: boolean;
  onItemClicked?(item: DetailedItem, event: React.MouseEvent): void;
  onChangeParent?(item: DetailedItem): void;
  onPreview?(item: DetailedItem): void;
  onItemChecked?(item: DetailedItem, unselect: boolean): void;
  onOpenItemMenu?(element: Element, item: DetailedItem): void;
}

const translations = defineMessages({
  view: {
    id: 'words.view',
    defaultMessage: 'View'
  },
  noChildren: {
    id: 'navigator.noChildren',
    defaultMessage: 'Item has no children'
  },
  itemMenu: {
    id: 'words.options',
    defaultMessage: 'Options'
  }
});

// PathNavigatorListItem
export default function PathNavigatorItem(props: NavItemProps) {
  const classes = useStyles();
  const {
    item,
    isActive = false,
    onItemClicked,
    onChangeParent,
    onPreview,
    locale = null,
    isSelectMode,
    onItemChecked,
    onOpenItemMenu,
    isLeaf = false,
    isLevelDescriptor = false,
    showItemNavigateToButton = true
  } = props;
  const [over, setOver] = useState(false);
  const { formatMessage } = useIntl();
  const onMouseOver = isSelectMode ? null : () => setOver(true);
  const onMouseLeave = isSelectMode ? null : () => setOver(false);
  const onClick = (e) => onItemClicked?.(item, e);
  const navigable = isNavigable(item);
  const previewable = isPreviewable(item);
  const folder = isFolder(item);

  return (
    <ListItem
      selected={isActive}
      button={!isSelectMode as true}
      className={clsx(
        classes.navItem,
        isSelectMode && 'noLeftPadding',
        isLevelDescriptor && classes.navItemLevelDescriptor
      )}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {isSelectMode ? (
        <Checkbox
          color="default"
          className={classes.navItemCheckbox}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            onItemChecked(item, e.currentTarget.checked);
          }}
          value="primary"
        />
      ) : isLevelDescriptor ? (
        <LevelDescriptorIcon className={classes.levelDescriptorIcon} />
      ) : (
        <RenderIcon classes={{ iconClass: classes.typeIcon }} item={item} />
      )}
      <Typography
        variant="body2"
        title={item.label}
        className={clsx(
          classes.navItemText,
          !isSelectMode && locale !== item.localeCode && 'opacity',
          isSelectMode && 'select-mode',
          folder && 'non-navigable'
        )}
      >
        {item.label}
        {locale && locale !== item.localeCode && <FlagRoundedIcon className={classes.flag} />}
      </Typography>
      <div className={clsx(classes.optionsWrapper, over && classes.optionsWrapperOver)}>
        {onOpenItemMenu && (
          <Tooltip title={formatMessage(translations.itemMenu)}>
            <IconButton
              aria-label={formatMessage(translations.itemMenu)}
              className={classes.itemIconButton}
              onClick={(event) => {
                event.stopPropagation();
                onOpenItemMenu(event.currentTarget, item);
              }}
            >
              <MoreVertIcon className={classes.icon} />
            </IconButton>
          </Tooltip>
        )}
        {showItemNavigateToButton && (
          <Tooltip
            title={isLeaf ? formatMessage(translations.noChildren) : formatMessage(translations.view)}
            classes={{ tooltip: clsx(isLeaf && classes.leafTooltip) }}
          >
            <IconButton
              disableRipple={isLeaf}
              aria-label={isLeaf ? formatMessage(translations.noChildren) : formatMessage(translations.view)}
              className={clsx(classes.itemIconButton, isLeaf && 'Mui-disabled')}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (isLeaf) {
                  return;
                } else if (navigable || folder) {
                  onChangeParent?.(item);
                } else if (previewable) {
                  onPreview?.(item);
                }
              }}
            >
              <ChevronRightRoundedIcon className={classes.icon} />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </ListItem>
  );
}

function RenderIcon({ item, classes }: { item: DetailedItem; classes: any }) {
  let Icon = Page;
  switch (item.systemType) {
    case 'folder': {
      Icon = FolderIcon;
      break;
    }
    case 'component':
    case 'taxonomy': {
      Icon = ComponentIcon;
      break;
    }
    case 'asset': {
      if (item.mimeType.startsWith('image/')) {
        Icon = CropOriginalRoundedIcon;
      }
      break;
    }
  }
  return <Icon className={classes.iconClass} />;
}
