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

import { DetailedItem } from '../../models/Item';
import React, { useState } from 'react';
import { useStyles } from './styles';
import ListItem from '@mui/material/ListItem';
import clsx from 'clsx';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVertRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { isFolder, isNavigable, isPreviewable } from './utils';
import Tooltip from '@mui/material/Tooltip';
import { defineMessages, useIntl } from 'react-intl';
import ItemDisplay from '../ItemDisplay';

export interface NavItemProps {
  item: DetailedItem;
  locale: string;
  isActive?: boolean;
  isCurrentPath?: boolean;
  isLevelDescriptor?: boolean;
  isSelectMode?: boolean;
  showItemNavigateToButton?: boolean;
  onItemClicked?(item: DetailedItem, event?: React.MouseEvent): void;
  onChangeParent?(item: DetailedItem): void;
  onPreview?(item: DetailedItem): void;
  onItemChecked?(item: DetailedItem, unselect: boolean): void;
  onOpenItemMenu?(element: Element, item: DetailedItem): void;
}

const translations = defineMessages({
  viewChildren: {
    id: 'pathNavigator.viewChildren',
    defaultMessage: 'View children'
  },
  noChildren: {
    id: 'pathNavigator.noChildren',
    defaultMessage: 'Item has no children'
  },
  itemMenu: {
    id: 'words.options',
    defaultMessage: 'Options'
  }
});

// PathNavigatorListItem
function PathNavigatorItem(props: NavItemProps) {
  const classes = useStyles();
  const {
    item,
    isActive = false,
    isCurrentPath = false,
    onItemClicked,
    onChangeParent,
    onPreview,
    isSelectMode,
    onItemChecked,
    onOpenItemMenu,
    isLevelDescriptor = false,
    showItemNavigateToButton = true
  } = props;
  const [over, setOver] = useState(false);
  const { formatMessage } = useIntl();
  const onMouseOver = isSelectMode ? null : () => setOver(true);
  const onMouseLeave = isSelectMode ? null : () => setOver(false);
  const onClick = (e) => onItemClicked?.(item, e);
  const onContextMenu = (e) => {
    if (onOpenItemMenu) {
      e.preventDefault();
      onOpenItemMenu(e.currentTarget.querySelector('[data-item-menu]'), item);
    }
  };
  const navigable = isNavigable(item);
  const previewable = isPreviewable(item);
  const folder = isFolder(item);
  const isLeaf = item.childrenCount === 0;

  return (
    <ListItem
      selected={isActive}
      button={!isSelectMode as true}
      className={clsx(
        classes.navItem,
        isSelectMode && 'noLeftPadding',
        isLevelDescriptor && classes.navItemLevelDescriptor,
        isCurrentPath && classes.currentPathItem
      )}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {isSelectMode && (
        <Checkbox
          size="small"
          color="default"
          className={classes.navItemCheckbox}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            onItemChecked(item, e.currentTarget.checked);
          }}
          value="primary"
        />
      )}
      <ItemDisplay
        styles={{
          root: {
            maxWidth: isSelectMode
              ? 'calc(100% - 32px)'
              : over
              ? // Level descriptor doesn't ever have children, so will
                // always have only one action button.
                `calc(100% - ${isLevelDescriptor ? 25 : 50}px)`
              : '100%'
          }
        }}
        item={item}
        showPublishingTarget={!isSelectMode}
        showWorkflowState={!isSelectMode}
        labelTypographyProps={{ variant: 'body2' }}
      />
      {(onOpenItemMenu || showItemNavigateToButton) && (
        <div className={clsx(classes.optionsWrapper, over && classes.optionsWrapperOver)}>
          {onOpenItemMenu && (
            <Tooltip title={formatMessage(translations.itemMenu)}>
              <IconButton
                aria-label={formatMessage(translations.itemMenu)}
                className={classes.itemIconButton}
                data-item-menu
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenItemMenu(event.currentTarget, item);
                }}
                size="large"
              >
                <MoreVertIcon className={classes.icon} />
              </IconButton>
            </Tooltip>
          )}
          {showItemNavigateToButton && !isLevelDescriptor && !isLeaf && (
            <Tooltip title={formatMessage(translations.viewChildren)}>
              <IconButton
                aria-label={formatMessage(translations.viewChildren)}
                className={classes.itemIconButton}
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
                size="large"
              >
                <ChevronRightRoundedIcon className={classes.icon} />
              </IconButton>
            </Tooltip>
          )}
        </div>
      )}
    </ListItem>
  );
}

export default PathNavigatorItem;
