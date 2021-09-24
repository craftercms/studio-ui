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

import React, { PropsWithChildren } from 'react';
import ContextMenu, { ContextMenuProps } from '../ContextMenu';
import { PopoverOrigin, PopoverPosition, PopoverReference } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import StandardAction from '../../models/StandardAction';
import { generateSingleItemOptions, itemActionDispatcher } from '../../utils/itemActions';
import { PopoverProps } from '@mui/material/Popover';
import { getRootPath, isValidCutPastePath } from '../../utils/path';
import { AllItemActions } from '../../models/Item';
import { useSelection } from '../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useEnv } from '../../utils/hooks/useEnv';
import { useItemsByPath } from '../../utils/hooks/useItemsByPath';

export interface ItemMenuBaseProps {
  path: string;
  open: boolean;
  classes?: ContextMenuProps['classes'];
  anchorOrigin?: PopoverOrigin;
  anchorReference?: PopoverReference;
  anchorPosition?: PopoverPosition;
  numOfLoaderItems?: number;
}

export type ItemMenuProps = PropsWithChildren<
  ItemMenuBaseProps & {
    anchorEl?: PopoverProps['anchorEl'];
    onClose?(): void;
  }
>;

export interface ItemMenuStateProps extends ItemMenuBaseProps {
  onClose?: StandardAction;
}

export default function ItemActionsMenu(props: ItemMenuProps) {
  const {
    open,
    path,
    onClose,
    numOfLoaderItems = 8,
    classes,
    anchorEl,
    anchorOrigin,
    anchorReference = 'anchorEl',
    anchorPosition
  } = props;
  const site = useActiveSiteId();
  const items = useItemsByPath();
  const clipboard = useSelection((state) => state.content.clipboard);
  const item = items?.[path];
  const { authoringBase } = useEnv();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const onMenuItemClicked = (option: AllItemActions, event: React.MouseEvent<Element, MouseEvent>) => {
    itemActionDispatcher({ site, item, option, authoringBase, dispatch, formatMessage, clipboard, event });
    onClose();
  };
  const hasClipboard =
    item &&
    clipboard &&
    clipboard.paths.length &&
    getRootPath(clipboard.sourcePath) === getRootPath(item.path) &&
    isValidCutPastePath(item.path, clipboard.sourcePath);
  const options = generateSingleItemOptions(item, formatMessage, { hasClipboard });
  return (
    <ContextMenu
      open={open}
      onClose={onClose}
      classes={classes}
      options={options}
      onMenuItemClicked={onMenuItemClicked}
      isLoading={!item}
      numOfLoaderItems={numOfLoaderItems}
      anchorEl={anchorEl}
      anchorOrigin={anchorOrigin}
      anchorReference={anchorReference}
      anchorPosition={anchorPosition}
    />
  );
}
