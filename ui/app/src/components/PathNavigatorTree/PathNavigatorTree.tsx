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

import React, { useEffect, useRef, useState } from 'react';
import PathNavigatorTreeUI, { PathNavigatorTreeUIProps } from './PathNavigatorTreeUI';
import { useDispatch } from 'react-redux';
import {
  pathNavigatorTreeBackgroundRefresh,
  pathNavigatorTreeCollapsePath,
  pathNavigatorTreeExpandPath,
  pathNavigatorTreeFetchPathChildren,
  pathNavigatorTreeFetchPathPage,
  pathNavigatorTreeInit,
  pathNavigatorTreeRefresh,
  pathNavigatorTreeSetKeyword,
  pathNavigatorTreeToggleCollapsed
} from '../../state/actions/pathNavigatorTree';
import { StateStylingProps } from '../../models/UiConfig';
import LookupTable from '../../models/LookupTable';
import {
  getEditorMode,
  isEditableViaFormEditor,
  isImage,
  isNavigable,
  isPreviewable,
  isVideo,
  isPdfDocument
} from '../PathNavigator/utils';
import ContextMenu, { ContextMenuOption } from '../ContextMenu/ContextMenu';
import { getNumOfMenuOptionsForItem, lookupItemByPath } from '../../utils/content';
import { previewItem } from '../../state/actions/preview';
import { getOffsetLeft, getOffsetTop } from '@mui/material/Popover';
import { showEditDialog, showItemMegaMenu, showPreviewDialog } from '../../state/actions/dialogs';
import { getStoredPathNavigatorTree } from '../../utils/state';
import GlobalState from '../../models/GlobalState';
import PathNavigatorSkeleton from '../PathNavigator/PathNavigatorSkeleton';
import { DetailedItem } from '../../models/Item';
import { SystemIconDescriptor } from '../SystemIcon';
import { useSelection } from '../../hooks/useSelection';
import { useEnv } from '../../hooks/useEnv';
import { useActiveUser } from '../../hooks/useActiveUser';
import { useItemsByPath } from '../../hooks/useItemsByPath';
import { useSubject } from '../../hooks/useSubject';
import { debounceTime } from 'rxjs/operators';
import { useActiveSite } from '../../hooks/useActiveSite';
import { ApiResponse } from '../../models';
import { batchActions } from '../../state/actions/misc';
import SystemType from '../../models/SystemType';
import { PathNavigatorTreeItemProps } from './PathNavigatorTreeItem';
import { UNDEFINED } from '../../utils/constants';

export interface PathNavigatorTreeProps
  extends Pick<
    PathNavigatorTreeItemProps,
    'showNavigableAsLinks' | 'showPublishingTarget' | 'showWorkflowState' | 'showItemMenu'
  > {
  id: string;
  label: string;
  rootPath: string;
  excludes?: string[];
  limit?: number;
  icon?: SystemIconDescriptor;
  expandedIcon?: SystemIconDescriptor;
  collapsedIcon?: SystemIconDescriptor;
  container?: Partial<StateStylingProps>;
  initialCollapsed?: boolean;
  collapsible?: boolean;
  initialSystemTypes?: SystemType[];
  initialExpanded?: string[];
  onNodeClick?: PathNavigatorTreeUIProps['onLabelClick'];
  active?: PathNavigatorTreeItemProps['active'];
  classes?: Partial<Record<'header', string>>;
}

export interface PathNavigatorTreeStateProps {
  id: string;
  rootPath: string;
  collapsed: boolean;
  limit: number;
  expanded: string[];
  childrenByParentPath: LookupTable<string[]>;
  keywordByPath: LookupTable<string>;
  totalByPath: LookupTable<number>;
  offsetByPath: LookupTable<number>;
  excludes: string[];
  systemTypes: SystemType[];
  error: ApiResponse;
  isRootPathMissing: boolean;
}

interface Menu {
  path?: string;
  sections?: ContextMenuOption[][];
  anchorEl: Element;
  loaderItems?: number;
}

// @see https://github.com/craftercms/craftercms/issues/5360
// const translations = defineMessages({
//   refresh: {
//     id: 'words.refresh',
//     defaultMessage: 'Refresh'
//   }
// });
//
// const menuOptions: LookupTable<ContextMenuOptionDescriptor> = {
//   refresh: {
//     id: 'refresh',
//     label: translations.refresh
//   }
// };

export function PathNavigatorTree(props: PathNavigatorTreeProps) {
  // region const { ... } = props;
  const {
    label,
    id = props.label.replace(/\s/g, ''),
    excludes,
    limit = 10,
    icon,
    expandedIcon,
    collapsedIcon,
    container,
    rootPath,
    initialExpanded,
    initialCollapsed = true,
    collapsible = true,
    initialSystemTypes,
    onNodeClick,
    active,
    classes,
    showNavigableAsLinks,
    showPublishingTarget,
    showWorkflowState,
    showItemMenu
  } = props;
  // endregion
  const state = useSelection((state) => state.pathNavigatorTree[id]);
  const { id: siteId, uuid } = useActiveSite();
  const user = useActiveUser();
  const onSearch$ = useSubject<{ keyword: string; path: string }>();
  const uiConfig = useSelection<GlobalState['uiConfig']>((state) => state.uiConfig);
  const [widgetMenu, setWidgetMenu] = useState<Menu>({ anchorEl: null, sections: [] });
  const { authoringBase } = useEnv();
  const dispatch = useDispatch();
  const itemsByPath = useItemsByPath();
  const initialRefs = useRef({ initialCollapsed, initialSystemTypes, limit, excludes, initialExpanded });
  const keywordByPath = state?.keywordByPath;
  const totalByPath = state?.totalByPath;
  const childrenByParentPath = state?.childrenByParentPath;
  const rootItem = lookupItemByPath(rootPath, itemsByPath);

  useEffect(() => {
    // Adding uiConfig as means to stop navigator from trying to
    // initialize with previous state information when switching sites
    if (rootPath !== state?.rootPath && uiConfig.currentSite === siteId) {
      const storedState = getStoredPathNavigatorTree(uuid, user.username, id);
      const { initialSystemTypes, initialCollapsed, limit, excludes, initialExpanded } = initialRefs.current;
      dispatch(
        pathNavigatorTreeInit({
          id,
          rootPath,
          excludes,
          limit,
          collapsed: initialCollapsed,
          systemTypes: initialSystemTypes,
          expanded: initialExpanded,
          ...storedState
        })
      );
    }
  }, [dispatch, id, rootPath, siteId, state?.rootPath, uiConfig.currentSite, user.username, uuid]);

  useEffect(() => {
    const subscription = onSearch$.pipe(debounceTime(400)).subscribe(({ keyword, path }) => {
      dispatch(
        batchActions([
          pathNavigatorTreeSetKeyword({
            id,
            path,
            keyword
          }),
          pathNavigatorTreeBackgroundRefresh({ id })
        ])
      );
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, id, onSearch$, rootPath]);

  if (!rootItem || !state) {
    const storedState = getStoredPathNavigatorTree(uuid, user.username, id);
    return <PathNavigatorSkeleton renderBody={storedState ? !storedState.collapsed : !initialCollapsed} />;
  }

  // region Handlers

  const onChangeCollapsed = (collapsed) => {
    collapsible && dispatch(pathNavigatorTreeToggleCollapsed({ id, collapsed }));
  };

  const onNodeLabelClick =
    onNodeClick ??
    ((event: React.MouseEvent<Element, MouseEvent>, path: string) => {
      if (isNavigable(itemsByPath[path])) {
        dispatch(
          previewItem({
            item: itemsByPath[path],
            newTab: event.ctrlKey || event.metaKey
          })
        );
      } else if (isPreviewable(itemsByPath[path])) {
        onPreview(itemsByPath[path]);
      } else {
        onToggleNodeClick(path);
      }
    });

  const onToggleNodeClick = (path: string) => {
    // If the path is already expanded, should be collapsed
    if (state.expanded.includes(path)) {
      dispatch(pathNavigatorTreeCollapsePath({ id, path }));
    } else {
      const childrenCount = itemsByPath[path].childrenCount;
      if (childrenCount) {
        // If the item's children have been loaded, should simply be expanded
        if (childrenByParentPath[path]) {
          dispatch(pathNavigatorTreeExpandPath({ id, path }));
        } else {
          // Children not fetched yet, should be fetched
          dispatch(pathNavigatorTreeFetchPathChildren({ id, path }));
        }
      }
    }
  };

  const onHeaderButtonClick = (element: Element) => {
    // @see https://github.com/craftercms/craftercms/issues/5360
    onWidgetOptionsClick('refresh');
    // setWidgetMenu({
    //   sections: [[toContextMenuOptionsLookup(menuOptions, formatMessage).refresh]],
    //   anchorEl: element
    // });
  };

  const onOpenItemMenu = (element: Element, path: string) => {
    const anchorRect = element.getBoundingClientRect();
    const top = anchorRect.top + getOffsetTop(anchorRect, 'top');
    const left = anchorRect.left + getOffsetLeft(anchorRect, 'left');
    dispatch(
      showItemMegaMenu({
        path,
        anchorReference: 'anchorPosition',
        anchorPosition: { top, left },
        loaderItems: getNumOfMenuOptionsForItem(itemsByPath[path])
      })
    );
  };

  const onCloseWidgetOptions = () => setWidgetMenu({ ...widgetMenu, anchorEl: null });

  const onWidgetOptionsClick = (option: string) => {
    onCloseWidgetOptions();
    if (option === 'refresh') {
      dispatch(
        pathNavigatorTreeRefresh({
          id
        })
      );
    }
  };

  const onFilterChange = (keyword: string, path: string) => {
    if (!state.expanded.includes(path)) {
      dispatch(
        pathNavigatorTreeExpandPath({
          id,
          path
        })
      );
    }

    onSearch$.next({ keyword, path });
  };

  const onMoreClick = (path: string) => {
    dispatch(pathNavigatorTreeFetchPathPage({ id, path }));
  };

  const onPreview = (item: DetailedItem) => {
    if (isEditableViaFormEditor(item)) {
      dispatch(showEditDialog({ path: item.path, authoringBase, site: siteId, readonly: true }));
    } else if (isImage(item) || isVideo(item) || isPdfDocument(item.mimeType)) {
      dispatch(
        showPreviewDialog({
          type: isImage(item) ? 'image' : isVideo(item) ? 'video' : 'pdf',
          title: item.label,
          url: item.path
        })
      );
    } else {
      const mode = getEditorMode(item);
      dispatch(
        showPreviewDialog({
          type: 'editor',
          title: item.label,
          url: item.path,
          mode
        })
      );
    }
  };

  // endregion

  return (
    <>
      <PathNavigatorTreeUI
        classes={{ header: classes?.header }}
        title={label}
        active={active}
        icon={expandedIcon && collapsedIcon ? (state.collapsed ? collapsedIcon : expandedIcon) : icon}
        container={container}
        isCollapsed={state.collapsed}
        rootPath={rootPath}
        isRootPathMissing={state.isRootPathMissing}
        itemsByPath={itemsByPath}
        keywordByPath={keywordByPath}
        totalByPath={totalByPath}
        childrenByParentPath={childrenByParentPath}
        expandedNodes={state?.expanded}
        onIconClick={onToggleNodeClick}
        onLabelClick={onNodeLabelClick}
        onChangeCollapsed={onChangeCollapsed}
        onOpenItemMenu={onOpenItemMenu}
        onHeaderButtonClick={state.collapsed ? UNDEFINED : onHeaderButtonClick}
        onFilterChange={onFilterChange}
        onMoreClick={onMoreClick}
        showNavigableAsLinks={showNavigableAsLinks}
        showPublishingTarget={showPublishingTarget}
        showWorkflowState={showWorkflowState}
        showItemMenu={showItemMenu}
      />
      <ContextMenu
        anchorEl={widgetMenu.anchorEl}
        options={widgetMenu.sections}
        open={Boolean(widgetMenu.anchorEl)}
        onClose={onCloseWidgetOptions}
        onMenuItemClicked={onWidgetOptionsClick}
      />
    </>
  );
}

export default PathNavigatorTree;
