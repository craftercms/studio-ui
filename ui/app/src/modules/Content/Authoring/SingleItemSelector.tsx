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

import React, { useCallback, useReducer, useRef } from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { palette } from '../../../styles/theme';
import { Variant } from '@material-ui/core/styles/createTypography';
import { SandboxItem } from '../../../models/Item';
import InsertDriveFileRoundedIcon from '@material-ui/icons/InsertDriveFileRounded';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import StandardAction from '../../../models/StandardAction';
import PaginationOptions from '../../../models/PaginationOptions';
import { LookupTable } from '../../../models/LookupTable';
import ApiResponse from '../../../models/ApiResponse';
import { createAction } from '@reduxjs/toolkit';
import { GetChildrenResponse } from '../../../models/GetChildrenResponse';
import { useActiveSiteId, useStateResource } from '../../../utils/hooks';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import Breadcrumbs from '../../../components/Navigation/PathNavigator/PathNavigatorBreadcrumbs';
import PathNavigatorList from '../../../components/Navigation/PathNavigator/PathNavigatorList';
import { getChildrenByPath } from '../../../services/content';
import { getParentsFromPath, itemsFromPath, withIndex, withoutIndex } from '../../../utils/path';
import { createLookupTable, nou } from '../../../utils/object';
import { forkJoin, Observable } from 'rxjs';

const useStyles = makeStyles((theme) => ({
  popoverRoot: {
    minWidth: '245px',
    marginTop: '5px',
    padding: '0px 5px 5px 5px'
  },
  root: {
    'backgroundColor': palette.white,
    'display': 'flex',
    'padding-left': '15px',
    'align-items': 'center',
    'justify-content': 'space-between',
    'align-self': 'flex-start',
    'min-width': '245px',
    '& p': {
      padding: 0
    }
  },
  selectedItem: {
    marginLeft: 'auto',
    display: 'flex',
    marginRight: '15px'
  },
  title: {
    fontWeight: 600,
    marginRight: '15px'
  },
  changeBtn: {},
  itemIcon: {
    fill: palette.teal.main,
    marginRight: 10
  },
  selectIcon: {}
}));

interface SingleItemSelectorProps {
  itemIcon?: React.ElementType;
  selectIcon?: React.ElementType;
  classes?: {
    root?: string;
    title?: string;
    selectIcon?: string;
    itemIcon?: string;
  };
  selectedItem?: SandboxItem;
  rootPath: string;
  label: string;
  titleVariant?: Variant;
  labelVariant?: Variant;
  open: boolean;
  onClose(): void;
  onItemClicked(item: SandboxItem): void;
  onDropdownClick(): void;
}

interface SingleItemSelectorState extends PaginationOptions {
  byId: LookupTable<SandboxItem>;
  isFetching: boolean;
  error: ApiResponse;
  items: string[];
  leafs: string[];
  rootPath: string;
  currentPath: string;
  keywords: string;
  pageNumber: number;
  breadcrumb: SandboxItem[];
  selectedItem: SandboxItem;
}

const init: (props: SingleItemSelectorProps) => SingleItemSelectorState = (props: SingleItemSelectorProps) => ({
  byId: null,
  isFetching: null,
  error: null,
  items: [],
  leafs: [],
  keywords: 'string',
  pageNumber: 0,
  breadcrumb: [],
  offset: null,
  limit: null,
  rootPath: props.rootPath,
  currentPath: props.selectedItem?.path?? props.rootPath,
  selectedItem: props.selectedItem?? null
});

type SingleItemSelectorReducer = React.Reducer<SingleItemSelectorState, StandardAction>;

const reducer: SingleItemSelectorReducer = (state, { type, payload }) => {
  switch (type) {
    case changeSelectedItem.type: {
      return {
        ...state,
        currentPath: payload.path,
        selectedItem: payload
      };
    }
    case fetchChildrenByPath.type: {
      return {
        ...state,
        currentPath: payload,
        isFetching: true
      };
    }
    case fetchChildrenByPathComplete.type: {
      const { currentPath, rootPath, leafs, byId } = state;
      if (payload.length === 0 && withoutIndex(currentPath) !== withoutIndex(rootPath)) {
        return {
          ...state,
          path: getNextPath(currentPath, byId),
          leafs: leafs.concat(currentPath),
          isFetching: false
        };
      } else {
        const nextItems = {
          ...{ ...state.byId, ...createLookupTable(payload) },
          [payload.parent.id]: payload.parent
        };

        return {
          ...state,
          byId: nextItems,
          items: payload.map((item) => item.id),
          isFetching: false,
          breadcrumb: itemsFromPath(currentPath, rootPath, nextItems)
        };
      }
    }
    case fetchParentsItemsComplete.type: {
      const { currentPath, rootPath, leafs, byId } = state;
      let nextItems = { ...byId };
      let pathsByParent = {};

      payload.forEach((response: GetChildrenResponse, i: number) => {
        pathsByParent[response.parent.id] = response.map((item) => item.id);
        nextItems = {
          ...nextItems, ...createLookupTable(response),
          [response.parent.id]: response.parent
        };
      });
      if (pathsByParent[currentPath].length) {
        return {
          ...state,
          byId: nextItems,
          items: pathsByParent[currentPath],
          isFetching: false,
          breadcrumb: itemsFromPath(currentPath, rootPath, nextItems)
        };
      } else {
        const nextPath = getNextPath(currentPath, nextItems);
        return {
          ...state,
          byId: nextItems,
          path: nextPath,
          items: pathsByParent[nextPath],
          breadcrumb: itemsFromPath(nextPath, rootPath, nextItems),
          leafs: leafs.concat(currentPath),
          isFetching: false
        };
      }
    }
    default:
      throw new Error(`Unknown action "${type}"`);
  }
};

function getNextPath(currentPath: string, byId: LookupTable<SandboxItem>): string {
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

export const changeSelectedItem = createAction<SandboxItem>('CHANGE_SELECTED_ITEM');

export const fetchChildrenByPath = createAction<string>('FETCH_CHILDREN_BY_PATH');

export const fetchParentsItemsComplete = createAction<GetChildrenResponse[]>('SET_PARENTS_ITEMS');

export const fetchChildrenByPathComplete = createAction<GetChildrenResponse>('FETCH_CHILDREN_BY_PATH_COMPLETE');

export const fetchChildrenByPathFailed = createAction<any>('FETCH_CHILDREN_BY_PATH_FAILED');

export default function SingleItemSelector(props: SingleItemSelectorProps) {
  const {
    itemIcon: ItemIcon = InsertDriveFileRoundedIcon,
    selectIcon: SelectIcon = ExpandMoreRoundedIcon,
    classes: propClasses,
    titleVariant = 'body1',
    labelVariant = 'body1',
    onItemClicked,
    onDropdownClick,
    onClose,
    label,
    open
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
        case fetchChildrenByPath.type:
          const parentsPath = getParentsFromPath(state.currentPath);
          const requests: Observable<GetChildrenResponse>[] = [getChildrenByPath(site, payload)];
          if (parentsPath.length) {
            parentsPath.forEach(parentPath => {
              if (!state.items[parentPath] && !state.items[withIndex(parentPath)]) {
                requests.push(getChildrenByPath(site, parentPath));
              }
            });
            forkJoin(requests).subscribe(
              (response) => exec(fetchParentsItemsComplete(response)),
              (error) => {
                console.log(error);
              }
            );

          } else {
            getChildrenByPath(site, payload).subscribe(
              (response) => exec(fetchChildrenByPathComplete(response)),
              (response) => exec(fetchChildrenByPathFailed(response))
            );
          }
          break;
      }
    },
    [state, site]
  );

  const itemsResource = useStateResource<SandboxItem[], SingleItemSelectorState>(state, {
    shouldResolve: (consumer) => Boolean(consumer.byId) && !consumer.isFetching,
    shouldReject: (consumer) => Boolean(consumer.error),
    shouldRenew: (consumer, resource) => (
      consumer.isFetching && resource.complete
    ),
    resultSelector: (consumer) => {
      return consumer.items.map(id => consumer.byId[id]);
    },
    errorSelector: (consumer) => consumer.error
  });

  const handleDropdownClick = () => {
    onDropdownClick();
    exec(fetchChildrenByPath(state.currentPath));
  };

  const onPathSelected = (item) => {
    exec(fetchChildrenByPath(item.path));
  };

  const onCrumbSelected = (item) => {
    if (withoutIndex(state.currentPath) === withoutIndex(item.path)) {
      onItemClicked(item);
    } else {
      exec(fetchChildrenByPath(item.path));
    }
  };

  const handleItemClicked = (item) => {
    exec(changeSelectedItem(item));
    onItemClicked(item);
  };

  return (
    <Paper className={clsx(classes.root, propClasses?.root)} elevation={0}>
      <Typography
        variant={titleVariant}
        className={clsx(classes.title, propClasses?.title)}
      >
        {label}
      </Typography>
      {
        state.selectedItem &&
        <div className={classes.selectedItem}>
          <ItemIcon className={clsx(classes.itemIcon, propClasses?.itemIcon)} />
          <Typography variant={labelVariant}>{state.selectedItem.label}</Typography>
        </div>
      }
      <IconButton
        className={classes.changeBtn}
        ref={anchorEl}
        onClick={handleDropdownClick}
      >
        <SelectIcon className={clsx(classes.selectIcon, propClasses?.selectIcon)} />
      </IconButton>
      <Popover
        anchorEl={anchorEl.current}
        open={open}
        classes={{ paper: classes.popoverRoot }}
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
          breadcrumb={state?.breadcrumb ?? []}
          onSearch={() => {
          }}
          onCrumbSelected={onCrumbSelected}
        />
        <SuspenseWithEmptyState resource={itemsResource}>
          <PathNavigatorList
            leafs={state?.leafs ?? []}
            locale={'en'}
            resource={itemsResource}
            onPathSelected={onPathSelected}
            onItemClicked={handleItemClicked}
          />
        </SuspenseWithEmptyState>
      </Popover>
    </Paper>
  );
}
