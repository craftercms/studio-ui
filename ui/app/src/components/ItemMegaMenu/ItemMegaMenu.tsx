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

import React, { PropsWithChildren } from 'react';
import { PopoverOrigin, PopoverPosition, PopoverReference } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import StandardAction from '../../models/StandardAction';
import { generateSingleItemOptions, itemActionDispatcher } from '../../utils/itemActions';
import { PopoverProps } from '@mui/material/Popover';
import { getRootPath, isValidCopyPastePath, isValidCutPastePath } from '../../utils/path';
import GlobalState from '../../models/GlobalState';
import ItemMegaMenuUI from './ItemMegaMenuUI';
import { AllItemActions } from '../../models/Item';
import { useSelection } from '../../hooks/useSelection';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useEnv } from '../../hooks/useEnv';
import { useItemsByPath } from '../../hooks/useItemsByPath';
import { lookupItemByPath } from '../../utils/content';

export interface ItemMegaMenuBaseProps {
  path: string;
  open: boolean;
  anchorOrigin?: PopoverOrigin;
  anchorReference?: PopoverReference;
  anchorPosition?: PopoverPosition;
  numOfLoaderItems?: number;
}

export type ItemMegaMenuProps = PropsWithChildren<
  ItemMegaMenuBaseProps & {
    anchorEl?: PopoverProps['anchorEl'];
    onClose?(): void;
    onClosed?(): void;
  }
>;

export interface ItemMegaMenuStateProps extends ItemMegaMenuBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
}

export function ItemMegaMenu(props: ItemMegaMenuProps) {
  const {
    open,
    path,
    onClose,
    onClosed,
    anchorEl,
    anchorOrigin,
    anchorReference = 'anchorEl',
    anchorPosition,
    numOfLoaderItems = 8
  } = props;
  const site = useActiveSiteId();
  const items = useItemsByPath();
  const clipboard = useSelection((state) => state.content.clipboard);
  const item = lookupItemByPath(path, items);
  const contentTypes = useSelection((state) => state.contentTypes);
  const itemContentType = contentTypes?.byId?.[item?.contentTypeId]?.name;
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
    (clipboard.type === 'CUT'
      ? isValidCutPastePath(item.path, clipboard.sourcePath)
      : isValidCopyPastePath(item.path, clipboard.sourcePath));
  const locale = useSelection<GlobalState['uiConfig']['locale']>((state) => state.uiConfig.locale);
  const options = generateSingleItemOptions(item, formatMessage, { hasClipboard });
  const editorialOptions = options[0];
  const nonEditorialOptions = options.slice(1);
  return (
    <ItemMegaMenuUI
      open={open}
      item={item}
      numOfLoaderItems={numOfLoaderItems}
      isLoading={!item}
      contentType={itemContentType}
      options={options}
      editorialOptions={editorialOptions}
      nonEditorialOptions={nonEditorialOptions}
      anchorEl={anchorEl}
      anchorOrigin={anchorOrigin}
      anchorReference={anchorReference}
      anchorPosition={anchorPosition}
      locale={locale}
      onClose={onClose}
      onClosed={onClosed}
      onMenuItemClicked={onMenuItemClicked}
    />
  );
}

export default ItemMegaMenu;
