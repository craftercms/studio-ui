/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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
import { useActiveSiteId, useEnv, useItemsByPath, useSelection } from '../../utils/hooks';
import { PopoverOrigin, PopoverPosition, PopoverReference } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import StandardAction from '../../models/StandardAction';
import { AllItemActions, generateSingleItemOptions, itemActionDispatcher } from '../../utils/itemActions';
import { PopoverProps } from '@material-ui/core/Popover';
import { getRootPath, isValidCutPastePath } from '../../utils/path';
import GlobalState from '../../models/GlobalState';
import ItemMegaMenuUI from './ItemMegaMenuUI';

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
  }
>;

export interface ItemMegaMenuStateProps extends ItemMegaMenuBaseProps {
  onClose?: StandardAction;
}

export default function ItemMegaMenu(props: ItemMegaMenuProps) {
  const {
    open,
    path,
    onClose,
    anchorEl,
    anchorOrigin,
    anchorReference = 'anchorEl',
    anchorPosition,
    numOfLoaderItems = 8
  } = props;
  const site = useActiveSiteId();
  const items = useItemsByPath();
  const clipboard = useSelection((state) => state.content.clipboard);
  const item = items[path];
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
    isValidCutPastePath(item.path, clipboard.sourcePath);
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
      onMenuItemClicked={onMenuItemClicked}
    />
  );
}
