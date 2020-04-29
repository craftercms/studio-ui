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

import { SandboxItem } from '../../../models/Item';
import React, { useState } from 'react';
import { useStyles } from './styles';
import ListItem from '@material-ui/core/ListItem';
import clsx from 'clsx';
import Checkbox from '@material-ui/core/Checkbox';
import LeafIcon from '@material-ui/icons/EcoRounded';
import PageIcon from '@material-ui/icons/InsertDriveFileOutlined';
import FolderIcon from '@material-ui/icons/FolderOpenRounded';
import Typography from '@material-ui/core/Typography';
import FlagRoundedIcon from '@material-ui/icons/FlagRounded';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVertRounded';
import ChevronRightRoundedIcon from '@material-ui/icons/ChevronRightRounded';
import { isNavigable } from './utils';

interface NavItemProps {
  item: SandboxItem;
  locale: string;
  isLeaf: boolean;
  isSelectMode?: boolean;
  onItemClicked?(item: SandboxItem, event: React.MouseEvent): void;
  onChangeParent?(item: SandboxItem): void;
  onItemChecked?(item: SandboxItem, unselect: boolean): void;
  onOpenItemMenu?(element: Element, item: SandboxItem): void;
}

// PathNavigatorListItem
export default function (props: NavItemProps) {
  const classes = useStyles(props);
  const {
    item,
    onItemClicked,
    onChangeParent,
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
  return (
    <ListItem
      button={!isSelectMode as true}
      className={clsx(classes.navItem, isSelectMode && 'noLeftPadding')}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      onClick={navigable ? onClick : () => onChangeParent?.(item)}
    >
      {isSelectMode ? (
        <Checkbox
          color="default"
          className={classes.navItemCheckbox}
          onChange={(e) => {
            onItemChecked(item, e.currentTarget.checked);
          }}
          value="primary"
        />
      ) : navigable ? (
        isLeaf ? (
          <LeafIcon className={classes.typeIcon} />
        ) : (
          <PageIcon className={classes.typeIcon} />
        )
      ) : (
        <FolderIcon className={classes.typeIcon} />
      )}
      <Typography
        variant="body2"
        className={clsx(
          classes.navItemText,
          !isSelectMode && locale !== item.localeCode && 'opacity',
          isSelectMode && 'select-mode',
          !navigable && 'non-navigable'
        )}
      >
        {item.label}
        {locale !== item.localeCode && <FlagRoundedIcon className={classes.flag} />}
      </Typography>
      <div className={clsx(classes.optionsWrapper, over && classes.optionsWrapperOver)}>
        {
          onOpenItemMenu &&
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
        }
        <IconButton
          disabled={isLeaf}
          aria-label="Options"
          className={classes.itemIconButton}
          onClick={(event) => {
            event.stopPropagation();
            onChangeParent(item);
          }}
        >
          <ChevronRightRoundedIcon className={classes.icon} />
        </IconButton>
      </div>
    </ListItem>
  );
}
