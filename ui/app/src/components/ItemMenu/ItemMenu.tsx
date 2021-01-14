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

import React, { PropsWithChildren, Suspense } from 'react';
import { ContextMenuItems, SectionItem } from '../ContextMenu';
import { Resource } from '../../models/Resource';
import { DetailedItem } from '../../models/Item';
import { LookupTable } from '../../models/LookupTable';
import { useActiveSiteId, useEnv, useLogicResource, usePermissions, useSelection } from '../../utils/hooks';
import Menu from '@material-ui/core/Menu';
import { PopoverOrigin, PopoverPosition, PopoverReference } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { getRootPath, isValidCutPastePath } from '../../utils/path';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { rand } from '../Navigation/PathNavigator/utils';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import { Clipboard } from '../../models/GlobalState';
import StandardAction from '../../models/StandardAction';
import { generateSingleItemOptions, itemActionDispatcher } from '../../utils/itemActions';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';

interface ItemMenuBaseProps {
  path: string;
  open: boolean;
  classes?: Partial<Record<'paper' | 'itemRoot' | 'menuList' | 'helperText', string>>;
  anchorOrigin?: PopoverOrigin;
  anchorReference?: PopoverReference;
  anchorPosition?: PopoverPosition;
  loaderItems?: number;
}

export type ItemMenuProps = PropsWithChildren<
  ItemMenuBaseProps & {
    anchorEl?: Element;
    onClose?(): void;
  }
>;

interface ItemMenuUIProps {
  resource: { item: Resource<DetailedItem>; permissions: Resource<LookupTable<boolean>> };
  classes?: Partial<Record<'helperText' | 'itemRoot', string>>;
  clipboard: Clipboard;
  onMenuItemClicked(section: SectionItem): void;
}

export interface ItemMenuStateProps extends ItemMenuBaseProps {
  onClose?: StandardAction;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    loadingWrapper: {
      width: '135px',
      padding: '0px 15px'
    },
    typo: {
      padding: '6px 0'
    }
  })
);

export const emptyStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'block',
      padding: '0 10px',
      textAlign: 'center'
    }
  })
);

export default function ItemMenu(props: ItemMenuProps) {
  const {
    open,
    path,
    onClose,
    loaderItems = 8,
    classes,
    anchorEl,
    anchorOrigin,
    anchorReference = 'anchorEl',
    anchorPosition
  } = props;
  const site = useActiveSiteId();
  const permissions = usePermissions();
  const items = useSelection((state) => state.content.items);
  const clipboard = useSelection((state) => state.content.clipboard);
  const item = items.byPath?.[path];
  const itemPermissions = permissions?.[path];
  const { authoringBase } = useEnv();
  const legacyFormSrc = `${authoringBase}/legacy/form?`;
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const resourceItem = useLogicResource<DetailedItem, DetailedItem>(item, {
    shouldResolve: (source) => Boolean(source),
    shouldReject: (source) => false,
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => source,
    errorSelector: (source) => null
  });

  const resourcePermissions = useLogicResource<LookupTable<boolean>, LookupTable<boolean>>(itemPermissions, {
    shouldResolve: (source) => Boolean(source),
    shouldReject: (source) => false,
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => source,
    errorSelector: (source) => null
  });

  const onMenuItemClicked = (option: SectionItem) => {
    itemActionDispatcher(site, item, option, legacyFormSrc, dispatch, formatMessage, clipboard);
    onClose();
  };
  return (
    <Menu
      open={open}
      classes={{ paper: classes?.paper, list: classes?.menuList }}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={anchorOrigin}
      anchorPosition={anchorPosition}
      anchorReference={anchorReference}
    >
      <Suspense fallback={<Loader numOfItems={loaderItems} />}>
        <ItemMenuUI
          resource={{ item: resourceItem, permissions: resourcePermissions }}
          classes={classes}
          onMenuItemClicked={onMenuItemClicked}
          clipboard={clipboard}
        />
      </Suspense>
    </Menu>
  );
}

function ItemMenuUI(props: ItemMenuUIProps) {
  const { resource, classes, onMenuItemClicked, clipboard } = props;
  const item = resource.item.read();
  let permissions = resource.permissions.read();
  const emptyClasses = emptyStyles();
  const hasClipboard =
    clipboard?.paths.length &&
    getRootPath(clipboard.sourcePath) === getRootPath(item.path) &&
    isValidCutPastePath(item.path, clipboard.sourcePath);
  const options = generateSingleItemOptions(item, { hasClipboard, ...permissions });
  const noOptions = options.length === 1 && options[0].length === 0;

  return noOptions ? (
    <div className={emptyClasses.root}>
      <ErrorOutlineOutlinedIcon fontSize="small" />
      <Typography variant="caption" display="block">
        <FormattedMessage id="itemMenu.noPermissions" defaultMessage="No actions available for this item." />
      </Typography>
    </div>
  ) : (
    <ContextMenuItems classes={classes} sections={options} onMenuItemClicked={onMenuItemClicked} />
  );
}

export const Loader = React.memo((props: { numOfItems?: number }) => {
  const { numOfItems = 5 } = props;
  const classes = useStyles();
  const items = new Array(numOfItems).fill(null);
  return (
    <div className={classes.loadingWrapper}>
      {items.map((value, i) => (
        <Typography key={i} variant="body2" className={classes.typo} style={{ width: `${rand(85, 100)}%` }}>
          <Skeleton animation="wave" width="100%" />
        </Typography>
      ))}
    </div>
  );
});
