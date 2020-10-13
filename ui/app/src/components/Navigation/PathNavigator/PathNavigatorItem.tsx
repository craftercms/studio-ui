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
import { Tooltip } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

interface NavItemProps {
  item: DetailedItem;
  locale: string;
  isLeaf: boolean;
  isSelectMode?: boolean;
  onItemClicked?(item: DetailedItem, event: React.MouseEvent): void;
  onChangeParent?(item: DetailedItem): void;
  onPreview?(item: DetailedItem): void;
  onItemChecked?(item: DetailedItem, unselect: boolean): void;
  onOpenItemMenu?(element: Element, item: DetailedItem): void;
}

// PathNavigatorListItem
export default function(props: NavItemProps) {
  const classes = useStyles(props);
  const {
    item,
    onItemClicked,
    onChangeParent,
    onPreview,
    locale,
    isSelectMode,
    onItemChecked,
    onOpenItemMenu,
    isLeaf
  } = props;
  const [over, setOver] = useState(false);
  const onMouseOver = isSelectMode ? null : () => setOver(true);
  const onMouseLeave = isSelectMode ? null : () => setOver(false);
  const onClick = (e) => onItemClicked?.(item, e);
  const navigable = isNavigable(item);
  const previewable = isPreviewable(item);
  const folder = isFolder(item);

  return (
    <ListItem
      button={!isSelectMode as true}
      className={clsx(classes.navItem, isSelectMode && 'noLeftPadding')}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      onClick={
        navigable
          ? onClick
          : folder
          ? () => onChangeParent?.(item)
          : previewable
          ? () => onPreview(item)
          : null
      }
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
        {locale !== item.localeCode && <FlagRoundedIcon className={classes.flag} />}
      </Typography>
      <div className={clsx(classes.optionsWrapper, over && classes.optionsWrapperOver)}>
        {onOpenItemMenu && (
          <IconButton
            aria-label="Options"
            className={classes.itemIconButton}
            onClick={(event) => {
              event.stopPropagation();
              onOpenItemMenu(event.currentTarget, item);
            }}
          >
            <MoreVertIcon className={classes.icon} />
          </IconButton>
        )}
        <Tooltip
          title={
            isLeaf ? (
              <FormattedMessage id="navigator.isLeaf" defaultMessage="Item has no children" />
            ) : (
              <FormattedMessage id="words.view" defaultMessage="View" />
            )
          }
        >
          <IconButton
            aria-label="Options"
            className={classes.itemIconButton}
            onClick={(event) => {
              event.stopPropagation();
              if (isLeaf) {
                return;
              } else if (navigable || folder) {
                onChangeParent?.(item);
              } else if (previewable) {
                onPreview(item);
              }
            }}
          >
            <ChevronRightRoundedIcon className={classes.icon} />
          </IconButton>
        </Tooltip>
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
