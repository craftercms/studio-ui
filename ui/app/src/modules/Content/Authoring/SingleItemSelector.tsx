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

import React, { ReactNode, useCallback, useReducer, useRef } from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Variant } from '@material-ui/core/styles/createTypography';
import { DetailedItem } from '../../../models/Item';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import StandardAction from '../../../models/StandardAction';
import PaginationOptions from '../../../models/PaginationOptions';
import { LookupTable } from '../../../models/LookupTable';
import ApiResponse from '../../../models/ApiResponse';
import { createAction } from '@reduxjs/toolkit';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import Breadcrumbs from '../../../components/PathNavigator/PathNavigatorBreadcrumbs';
import PathNavigatorList from '../../../components/PathNavigator/PathNavigatorList';
import { fetchChildrenByPath, fetchItemsByPath, fetchItemWithChildrenByPath } from '../../../services/content';
import { getIndividualPaths, getParentPath, withIndex, withoutIndex } from '../../../utils/path';
import { createLookupTable, nou } from '../../../utils/object';
import { forkJoin } from 'rxjs';
import { isFolder } from '../../../components/PathNavigator/utils';
import { lookupItemByPath, parseSandBoxItemToDetailedItem } from '../../../utils/content';
import { GetChildrenResponse } from '../../../models/GetChildrenResponse';
import Pagination from '../../../components/Pagination';
import NavItem from '../../../components/PathNavigator/PathNavigatorItem';
import { useActiveSiteId } from '../../../utils/hooks/useActiveSiteId';
import { useLogicResource } from '../../../utils/hooks/useLogicResource';
import ItemDisplay from '../../../components/ItemDisplay';

const useStyles = makeStyles((theme) => ({
  popoverRoot: {
    minWidth: '200px',
    maxWidth: '400px',
    marginTop: '5px',
    padding: '0 5px 5px 5px'
  },
  root: {
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    paddingLeft: '15px',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 'auto',
    maxWidth: '100%',
    minWidth: '200px',
    '&.disable': {
      'min-width': 'auto',
      backgroundColor: 'inherit'
    }
  },
  selectedItem: {
    marginLeft: 'auto',
    display: 'flex',
    minWidth: 0
  },
  title: {
    fontWeight: 600,
    marginRight: '30px'
  },
  changeBtn: {},
  itemName: {},
  selectIcon: {}
}));

interface SingleItemSelectorProps {
  selectIcon?: React.ElementType;
  classes?: {
    root?: string;
    title?: string;
    selectIcon?: string;
    popoverRoot?: string;
  };
  selectedItem?: DetailedItem;
  rootPath: string;
  label?: ReactNode;
  titleVariant?: Variant;
  open: boolean;
  hideUI?: boolean;
  canSelectFolders?: boolean;
  disabled?: boolean;
  onClose?(): void;
  onItemClicked(item: DetailedItem): void;
  onDropdownClick?(): void;
}

interface SingleItemSelectorState extends PaginationOptions {
  byId: LookupTable<DetailedItem>;
  isFetching: boolean;
  error: ApiResponse;
  items: string[];
  leaves: string[];
  rootPath: string;
  currentPath: string;
  keywords: string;
  pageNumber: number;
  offset: number;
  total: number;
  limit: number;
  breadcrumb: string[];
}

const init: (props: SingleItemSelectorProps) => SingleItemSelectorState = (props: SingleItemSelectorProps) => ({
  byId: null,
  isFetching: null,
  error: null,
  items: [],
  leaves: [],
  keywords: '',
  pageNumber: 0,
  breadcrumb: [],
  offset: 0,
  limit: 10,
  total: 0,
  rootPath: props.rootPath,
  currentPath: props.selectedItem?.path ?? props.rootPath
});

type SingleItemSelectorReducer = React.Reducer<SingleItemSelectorState, StandardAction>;

const reducer: SingleItemSelectorReducer = (state, { type, payload }) => {
  switch (type) {
    case changeCurrentPath.type: {
      return {
        ...state,
        currentPath: payload.path
      };
    }
    case setKeyword.type: {
      return {
        ...state,
        keywords: payload,
        isFetching: true
      };
    }
    case changePage.type: {
      return { ...state, isFetching: true };
    }
    case fetchParentsItems.type:
    case fetchChildrenByPathAction.type: {
      return {
        ...state,
        currentPath: payload,
        isFetching: true
      };
    }
    case fetchChildrenByPathComplete.type: {
      const { currentPath, rootPath, leaves, byId } = state;
      const { children, parent } = payload;
      if (children.length === 0 && withoutIndex(currentPath) !== withoutIndex(rootPath)) {
        return {
          ...state,
          currentPath: getNextPath(currentPath, byId),
          leaves: leaves.concat(currentPath),
          total: children.total,
          isFetching: false
        };
      } else {
        const nextItems = {
          ...{ ...state.byId, ...createLookupTable(children, 'path') },
          ...(parent && { [parent.path]: parent })
        };

        return {
          ...state,
          byId: nextItems,
          items: children.map((item) => item.path),
          isFetching: false,
          total: children.total,
          offset: children.offset,
          limit: children.limit,
          breadcrumb: getIndividualPaths(withoutIndex(currentPath), withoutIndex(rootPath))
        };
      }
    }
    case fetchParentsItemsComplete.type: {
      const { currentPath, rootPath, byId } = state;
      const { children, items } = payload;

      return {
        ...state,
        byId: {
          ...byId,
          ...createLookupTable(children.map(parseSandBoxItemToDetailedItem), 'path'),
          ...createLookupTable(items, 'path')
        },
        items: children.map((item) => item.path),
        isFetching: false,
        limit: children.limit,
        total: children.total,
        offset: children.offset,
        breadcrumb: getIndividualPaths(withoutIndex(currentPath), withoutIndex(rootPath))
      };
    }
    default:
      throw new Error(`Unknown action "${type}"`);
  }
};

function getNextPath(currentPath: string, byId: LookupTable<DetailedItem>): string {
  let pieces = currentPath.split('/').slice(0);
  pieces.pop();
  if (currentPath.includes('index.xml')) {
    pieces.pop();
  }
  let nextPath = pieces.join('/');
  if (nou(byId[nextPath])) {
    nextPath = withIndex(nextPath);
  }
  return nextPath;
}

const changeCurrentPath = /*#__PURE__*/ createAction<DetailedItem>('CHANGE_SELECTED_ITEM');

const setKeyword = /*#__PURE__*/ createAction<string>('SET_KEYWORD');

const changePage = /*#__PURE__*/ createAction<number>('CHANGE_PAGE');

const fetchChildrenByPathAction = /*#__PURE__*/ createAction<string>('FETCH_CHILDREN_BY_PATH');

const fetchParentsItems = /*#__PURE__*/ createAction<string>('FETCH_PARENTS_ITEMS');

const fetchParentsItemsComplete = /*#__PURE__*/ createAction<{ items?: DetailedItem[]; children: GetChildrenResponse }>(
  'FETCH_PARENTS_ITEMS_COMPLETE'
);

const fetchChildrenByPathComplete = /*#__PURE__*/ createAction<{
  parent?: DetailedItem;
  children: GetChildrenResponse;
}>('FETCH_CHILDREN_BY_PATH_COMPLETE');

const fetchChildrenByPathFailed = /*#__PURE__*/ createAction<any>('FETCH_CHILDREN_BY_PATH_FAILED');

export default function SingleItemSelector(props: SingleItemSelectorProps) {
  const {
    selectIcon: SelectIcon = ExpandMoreRoundedIcon,
    classes: propClasses,
    titleVariant = 'body1',
    hideUI = false,
    disabled = false,
    onItemClicked,
    onDropdownClick,
    onClose,
    label,
    open,
    selectedItem,
    rootPath,
    canSelectFolders = false
  } = props;
  const classes = useStyles();
  const anchorEl = useRef();
  const [state, _dispatch] = useReducer(reducer, props, init);
  const site = useActiveSiteId();

  const exec = useCallback(
    (action) => {
      _dispatch(action);
      const { type, payload } = action;
      switch (type) {
        case setKeyword.type: {
          fetchChildrenByPath(site, state.currentPath, { limit: state.limit, keyword: payload }).subscribe(
            (children) => exec(fetchChildrenByPathComplete({ children })),
            (response) => exec(fetchChildrenByPathFailed(response))
          );
          break;
        }
        case changePage.type: {
          fetchChildrenByPath(site, state.currentPath, { limit: state.limit, offset: payload }).subscribe(
            (children) => exec(fetchChildrenByPathComplete({ children })),
            (response) => exec(fetchChildrenByPathFailed(response))
          );
          break;
        }
        case fetchChildrenByPathAction.type:
          fetchItemWithChildrenByPath(site, payload, { limit: state.limit }).subscribe(
            ({ item, children }) => exec(fetchChildrenByPathComplete({ parent: item, children })),
            (response) => exec(fetchChildrenByPathFailed(response))
          );
          break;
        case fetchParentsItems.type:
          const parentsPath = getIndividualPaths(payload, state.rootPath);

          if (parentsPath.length > 1) {
            forkJoin([
              fetchItemsByPath(site, parentsPath, { castAsDetailedItem: true }),
              fetchChildrenByPath(site, payload, {
                limit: state.limit
              })
            ]).subscribe(
              ([items, children]) => exec(fetchParentsItemsComplete({ items, children })),
              (response) => exec(fetchChildrenByPathFailed(response))
            );
          } else {
            fetchItemWithChildrenByPath(site, payload, { limit: state.limit }).subscribe(
              ({ item, children }) => exec(fetchChildrenByPathComplete({ parent: item, children })),
              (response) => exec(fetchChildrenByPathFailed(response))
            );
          }
          break;
      }
    },
    [state, site]
  );

  const itemsResource = useLogicResource<DetailedItem[], SingleItemSelectorState>(state, {
    shouldResolve: (consumer) => Boolean(consumer.byId) && !consumer.isFetching,
    shouldReject: (consumer) => Boolean(consumer.error),
    shouldRenew: (consumer, resource) => consumer.isFetching && resource.complete,
    resultSelector: (consumer) => consumer.items.map((id) => consumer.byId[id]),
    errorSelector: (consumer) => consumer.error
  });

  const handleDropdownClick = (item: DetailedItem) => {
    onDropdownClick();
    let nextPath = withoutIndex(item.path) === withoutIndex(rootPath) ? item.path : getParentPath(item.path);
    exec(fetchParentsItems(nextPath));
  };

  const onPathSelected = (item: DetailedItem) => {
    exec(fetchChildrenByPathAction(item.path));
  };

  const onSearch = (keyword) => {
    exec(setKeyword(keyword));
  };

  const onCrumbSelected = (item: DetailedItem) => {
    if (state.breadcrumb.length === 1) {
      handleItemClicked(item);
    } else {
      exec(fetchChildrenByPathAction(item.path));
    }
  };

  const handleItemClicked = (item: DetailedItem) => {
    const folder = isFolder(item);

    if (folder && canSelectFolders === false) {
      onPathSelected(item);
    } else {
      exec(changeCurrentPath(item));
      onItemClicked(item);
    }
  };

  const onPageChanged = (page: number) => {
    const offset = page * state.limit;
    exec(changePage(offset));
  };

  const Wrapper = hideUI ? React.Fragment : Paper;
  const wrapperProps = hideUI
    ? {}
    : {
        className: clsx(classes.root, !onDropdownClick && 'disable', propClasses?.root),
        elevation: 0
      };

  return (
    <Wrapper {...wrapperProps}>
      {!hideUI && (
        <>
          {label && (
            <Typography variant={titleVariant} className={clsx(classes.title, propClasses?.title)}>
              {label}
            </Typography>
          )}
          {selectedItem && (
            <div className={classes.selectedItem}>
              <ItemDisplay item={selectedItem} showNavigableAsLinks={false} />
            </div>
          )}
        </>
      )}
      {onDropdownClick && (
        <IconButton
          className={classes.changeBtn}
          ref={anchorEl}
          disabled={disabled}
          onClick={disabled ? null : () => handleDropdownClick(selectedItem)}
        >
          <SelectIcon className={clsx(classes.selectIcon, propClasses?.selectIcon)} />
        </IconButton>
      )}
      <Popover
        anchorEl={anchorEl.current}
        open={open}
        classes={{ paper: clsx(classes.popoverRoot, propClasses?.popoverRoot) }}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <Breadcrumbs
          keyword={state?.keywords}
          breadcrumb={state.breadcrumb.map((path) => state.byId[path] ?? state.byId[withIndex(path)])}
          onSearch={onSearch}
          onCrumbSelected={onCrumbSelected}
        />
        {state.byId && lookupItemByPath(state.currentPath, state.byId) && (
          <NavItem
            item={lookupItemByPath(state.currentPath, state.byId)}
            locale="en_US"
            isLevelDescriptor={false}
            isCurrentPath
            onItemClicked={handleItemClicked}
          />
        )}
        <SuspenseWithEmptyState resource={itemsResource}>
          <PathNavigatorList
            leaves={state?.leaves ?? []}
            locale={'en_US'}
            resource={itemsResource}
            onPathSelected={onPathSelected}
            onItemClicked={handleItemClicked}
          />
          <Pagination
            count={state.total}
            rowsPerPage={state.limit}
            page={state && Math.ceil(state.offset / state.limit)}
            onChangePage={(page: number) => onPageChanged(page)}
          />
        </SuspenseWithEmptyState>
      </Popover>
    </Wrapper>
  );
}
