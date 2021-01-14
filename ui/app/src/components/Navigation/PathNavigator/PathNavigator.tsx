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

import React, { ElementType, useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import TablePagination from '@material-ui/core/TablePagination';
import { DetailedItem } from '../../../models/Item';
import clsx from 'clsx';
import ContextMenu, { SectionItem } from '../../ContextMenu';
import {
  useActiveSiteId,
  useEnv,
  useLogicResource,
  useMount,
  useSelection,
  useSiteLocales,
  useSpreadState
} from '../../../utils/hooks';
import { useDispatch } from 'react-redux';
import Suspencified, { SuspenseWithEmptyState } from '../../SystemStatus/Suspencified';
import { getParentPath, withIndex, withoutIndex } from '../../../utils/path';
import { useStyles } from './styles';
import { translations } from './translations';
import Header from './PathNavigatorHeader';
import Breadcrumbs from './PathNavigatorBreadcrumbs';
import NavItem from './PathNavigatorItem';
import ItemList from './PathNavigatorList';
import { languages } from '../../../utils/i18n-legacy';
import {
  pathNavigatorConditionallySetPath,
  pathNavigatorInit,
  pathNavigatorItemChecked,
  pathNavigatorItemUnchecked,
  pathNavigatorRefresh,
  pathNavigatorSetCollapsed,
  pathNavigatorSetCurrentPath,
  pathNavigatorSetKeyword,
  pathNavigatorSetLocaleCode,
  pathNavigatorUpdate
} from '../../../state/actions/pathNavigator';
import { getStoredPreviewChoice } from '../../../utils/state';
import ItemMenu from '../../ItemMenu/ItemMenu';
import { completeDetailedItem, fetchUserPermissions } from '../../../state/actions/content';
import { showEditDialog, showPreviewDialog } from '../../../state/actions/dialogs';
import { getContentXML } from '../../../services/content';
import { isFolder, isNavigable, isPreviewable } from './utils';
import LoadingState from '../../SystemStatus/LoadingState';
import LookupTable from '../../../models/LookupTable';
import { StateStylingProps } from '../../../models/UiConfig';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import { getHostToHostBus } from '../../../modules/Preview/previewContext';
import { filter } from 'rxjs/operators';
import {
  folderCreated,
  folderRenamed,
  itemCreated,
  itemDuplicated,
  itemsDeleted,
  itemsPasted,
  itemUpdated
} from '../../../state/actions/system';
import List from '@material-ui/core/List';
import PathNavigatorSkeletonItem from './PathNavigatorSkeletonItem';
import { getNumOfMenuOptionsForItem } from '../../../utils/content';

export interface WidgetProps {
  id: string;
  label: string;
  rootPath: string;
  excludes?: string[];
  locale?: string;
  showChildrenRail?: boolean;
  icon?: Partial<StateStylingProps>;
  container?: Partial<StateStylingProps>;
  classes?: Partial<Record<'root' | 'body' | 'searchRoot', string>>;
  onItemClicked?: (item: DetailedItem) => void;
  computeActiveItems?: () => string[];
  createItemClickedHandler?: (defaultHandler: (item: DetailedItem) => void) => (item: DetailedItem) => void;
}

interface Menu {
  path?: string;
  sections: SectionItem[][];
  anchorEl: Element;
  loaderItems?: number;
  emptyState?: {
    icon?: ElementType;
    message: string;
  };
}

export interface WidgetState {
  rootPath: string;
  currentPath: string;
  localeCode: string;
  keyword: '';
  isSelectMode: boolean;
  hasClipboard: boolean;
  levelDescriptor: string;
  itemsInPath: string[];
  breadcrumb: string[];
  selectedItems: string[];
  leaves: string[];
  count: number; // Number of items in the current path
  limit: number;
  offset: number;
  collapsed?: boolean;
}

interface WidgetUIProps {
  state: WidgetState;
  // TODO: add props
  [key: string]: any;
}

const menuOptions = {
  refresh: {
    id: 'refresh',
    label: translations.refresh
  }
};

// PathNavigator
export default function PathNavigator(props: WidgetProps) {
  const {
    label,
    icon = {},
    container = {},
    rootPath: path,
    id = label?.replace(/\s/g, ''),
    locale,
    excludes,
    showChildrenRail = true,
    onItemClicked: onItemClickedProp,
    createItemClickedHandler = (defaultHandler) => defaultHandler,
    computeActiveItems: computeActiveItemsProp
  } = props;
  const state = useSelection((state) => state.pathNavigator)[id];
  const itemsByPath = useSelection((state) => state.content.items).byPath;
  const site = useActiveSiteId();
  const { authoringBase } = useEnv();
  const legacyFormSrc = `${authoringBase}/legacy/form?`;
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [simpleMenu, setSimpleMenu] = useState<Menu>({
    anchorEl: null,
    sections: [],
    emptyState: null
  });

  const [itemMenu, setItemMenu] = useSpreadState<Menu>({
    path,
    sections: [],
    anchorEl: null,
    loaderItems: null
  });

  const siteLocales = useSiteLocales();

  useMount(() => {
    if (!state) {
      dispatch(pathNavigatorInit({ id, path, locale, excludes }));
    }
  });

  useEffect(() => {
    if (siteLocales.defaultLocaleCode) {
      dispatch(
        pathNavigatorSetLocaleCode({
          id,
          locale: siteLocales.defaultLocaleCode
        })
      );
    }
  }, [dispatch, id, siteLocales.defaultLocaleCode]);

  // Item Updates Propagation
  useEffect(() => {
    const events = [
      itemsPasted.type,
      itemUpdated.type,
      folderCreated.type,
      folderRenamed.type,
      itemsDeleted.type,
      itemDuplicated.type,
      itemCreated.type,
      itemCreated.type
    ];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => events.includes(e.type))).subscribe(({ type, payload }) => {
      switch (type) {
        case itemCreated.type:
        case itemUpdated.type:
        case folderRenamed.type:
        case itemDuplicated.type: {
          const parentPath = getParentPath(payload.target);
          if (parentPath === withoutIndex(state.currentPath)) {
            dispatch(pathNavigatorRefresh({ id }));
          }
          if (state.leaves.some((path) => withoutIndex(path) === parentPath)) {
            dispatch(
              pathNavigatorUpdate({
                id,
                leaves: state.leaves.filter((path) => withoutIndex(path) !== parentPath)
              })
            );
          }
          break;
        }
        case folderCreated.type: {
          if (withoutIndex(payload.target) === withoutIndex(state.currentPath)) {
            dispatch(pathNavigatorRefresh({ id }));
          }
          if (state.leaves.some((path) => withoutIndex(path) === withoutIndex(payload.target))) {
            dispatch(
              pathNavigatorUpdate({
                id,
                leaves: state.leaves.filter((path) => withoutIndex(path) !== withoutIndex(payload.target))
              })
            );
          }
          break;
        }
        case itemsPasted.type: {
          if (payload.clipboard.type === 'COPY') {
            if (withoutIndex(payload.target) === withoutIndex(state.currentPath)) {
              dispatch(pathNavigatorRefresh({ id }));
            }
            if (state.leaves.some((path) => withoutIndex(path) === withoutIndex(payload.target))) {
              dispatch(
                pathNavigatorUpdate({
                  id,
                  leaves: state.leaves.filter((path) => withoutIndex(path) !== withoutIndex(payload.target))
                })
              );
            }
          } else {
            // payload.clipboard.type === 'CUT
            const parentPath = getParentPath(payload.target);
            if (parentPath === withoutIndex(state.currentPath)) {
              dispatch(pathNavigatorRefresh({ id }));
            }
          }
          break;
        }
        case itemsDeleted.type: {
          payload.targets.forEach((path) => {
            if (withoutIndex(path) === withoutIndex(state.currentPath)) {
              dispatch(
                pathNavigatorSetCurrentPath({
                  id,
                  path: getParentPath(withoutIndex(path))
                })
              );
            } else if (state.itemsInPath.includes(path)) {
              dispatch(pathNavigatorRefresh({ id }));
            }
          });
          break;
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [state, id, dispatch]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const computeActiveItems = useCallback(computeActiveItemsProp ?? (() => []), [computeActiveItemsProp]);

  if (!state) {
    return <LoadingState />;
  }

  const onPathSelected = (item: DetailedItem) => {
    dispatch(
      pathNavigatorConditionallySetPath({
        id,
        path: item.path
      })
    );
  };

  const onPreview = (item: DetailedItem) => {
    if (item.systemType === 'component' || item.systemType === 'taxonomy') {
      const src = `${legacyFormSrc}site=${site}&path=${item.path}&type=form&readonly=true`;
      dispatch(showEditDialog({ src }));
    } else if (item.mimeType.startsWith('image/')) {
      dispatch(
        showPreviewDialog({
          type: 'image',
          title: item.label,
          url: item.path
        })
      );
    } else {
      getContentXML(site, item.path).subscribe((content) => {
        let mode = 'txt';

        if (item.systemType === 'template') {
          mode = 'ftl';
        } else if (item.systemType === 'script') {
          mode = 'groovy';
        } else if (item.mimeType === 'application/javascript') {
          mode = 'javascript';
        } else if (item.mimeType === 'text/css') {
          mode = 'css';
        }

        dispatch(
          showPreviewDialog({
            type: 'editor',
            title: item.label,
            url: item.path,
            mode,
            content
          })
        );
      });
    }
  };

  const onPageChanged = (page: number) => void 0;

  const onSelectItem = (item: DetailedItem, checked: boolean) => {
    dispatch(
      checked
        ? pathNavigatorItemChecked({ id, item })
        : pathNavigatorItemUnchecked({
            id,
            item
          })
    );
  };

  const onCurrentParentMenu = (element: Element) => {
    let path = state.currentPath;
    if (path === '/site/website') {
      path = withIndex(state.currentPath);
    }
    dispatch(completeDetailedItem({ path }));
    dispatch(fetchUserPermissions({ path }));
    setItemMenu({
      path,
      anchorEl: element,
      loaderItems: getNumOfMenuOptionsForItem(itemsByPath[path])
    });
  };

  const onOpenItemMenu = (element: Element, item: DetailedItem) => {
    dispatch(completeDetailedItem({ path: item.path }));
    dispatch(fetchUserPermissions({ path: item.path }));
    setItemMenu({
      path: item.path,
      anchorEl: element,
      loaderItems: getNumOfMenuOptionsForItem(item)
    });
  };

  const onHeaderButtonClick = (anchorEl: Element, type: string) => {
    const locales = siteLocales.localeCodes?.map((code) => ({
      id: `locale.${code}`,
      label: {
        id: `locale.${code}`,
        defaultMessage: formatMessage(languages[code])
      }
    }));

    if (type === 'language') {
      setSimpleMenu({
        sections: locales.length ? [locales] : [],
        anchorEl,
        emptyState: locales.length === 0 ? { message: formatMessage(translations.noLocales) } : null
      });
    } else {
      setSimpleMenu({
        sections: [[menuOptions.refresh]],
        anchorEl
      });
    }
  };

  const onCloseSimpleMenu = () => setSimpleMenu({ ...simpleMenu, anchorEl: null });

  const onCloseItemMenu = () => setItemMenu({ ...itemMenu, anchorEl: null });

  const onItemClicked = onItemClickedProp
    ? onItemClickedProp
    : createItemClickedHandler((item: DetailedItem) => {
        if (isNavigable(item)) {
          if (item.previewUrl) {
            let previewBase = getStoredPreviewChoice(site) === '2' ? 'next/preview' : 'preview';
            window.location.href = `${authoringBase}/${previewBase}#/?page=${item.previewUrl}&site=${site}`;
          }
        } else if (isFolder(item)) {
          onPathSelected(item);
        } else if (isPreviewable(item)) {
          onPreview(item);
        }
      });

  const onBreadcrumbSelected = (item: DetailedItem) => {
    if (withoutIndex(item.path) === withoutIndex(state.currentPath)) {
      onItemClicked(item);
    } else {
      dispatch(pathNavigatorSetCurrentPath({ id, path: item.path }));
    }
  };

  const onSimpleMenuClick = (section: SectionItem) => {
    onCloseSimpleMenu();
    if (section.id === 'refresh') {
      dispatch(
        pathNavigatorRefresh({
          id
        })
      );
    }
  };

  const onChangeCollapsed = (collapsed: boolean) => {
    dispatch(pathNavigatorSetCollapsed({ id, collapsed }));
  };

  const onSearch = (keyword: string) => {
    dispatch(pathNavigatorSetKeyword({ id, keyword }));
  };

  return (
    <Suspencified>
      <PathNavigatorUI
        state={state}
        classes={props.classes}
        itemsByPath={itemsByPath}
        showChildrenRail={showChildrenRail}
        icon={icon}
        container={container}
        title={label}
        itemMenu={itemMenu}
        simpleMenu={simpleMenu}
        onChangeCollapsed={onChangeCollapsed}
        onHeaderButtonClick={onHeaderButtonClick}
        onCurrentParentMenu={onCurrentParentMenu}
        siteLocales={siteLocales}
        onSearch={onSearch}
        onBreadcrumbSelected={onBreadcrumbSelected}
        onSelectItem={onSelectItem}
        onPathSelected={onPathSelected}
        onPreview={onPreview}
        onOpenItemMenu={onOpenItemMenu}
        onItemClicked={onItemClicked}
        onPageChanged={onPageChanged}
        onCloseItemMenu={onCloseItemMenu}
        onCloseSimpleMenu={onCloseSimpleMenu}
        onSimpleMenuClick={onSimpleMenuClick}
        computeActiveItems={computeActiveItems}
      />
    </Suspencified>
  );
}

export function PathNavigatorUI(props: WidgetUIProps) {
  const classes = useStyles();
  // region consts {...} = props
  const {
    state,
    itemsByPath,
    icon,
    container,
    title,
    itemMenu,
    simpleMenu,
    showChildrenRail,
    onChangeCollapsed,
    onHeaderButtonClick,
    onCurrentParentMenu,
    siteLocales,
    onSearch,
    onBreadcrumbSelected,
    onSelectItem,
    onPathSelected,
    onPreview,
    onOpenItemMenu,
    onItemClicked,
    onPageChanged,
    onCloseItemMenu,
    onCloseSimpleMenu,
    onSimpleMenuClick,
    computeActiveItems
  } = props;
  // endregion
  const { formatMessage } = useIntl();

  const resource = useLogicResource<DetailedItem[], { itemsInPath: string[]; itemsByPath: LookupTable<DetailedItem> }>(
    // We only want to renew the state when itemsInPath changes.
    // Note: This only works whilst `itemsByPath` updates prior to `itemsInPath`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo(() => ({ itemsByPath, itemsInPath: state.itemsInPath }), [state.itemsInPath]),
    {
      shouldResolve: ({ itemsInPath, itemsByPath }) => {
        return Boolean(itemsInPath) && !itemsInPath.some((path) => !itemsByPath[path]);
      },
      shouldRenew: (items, resource) => resource.complete,
      shouldReject: () => false,
      resultSelector: ({ itemsInPath, itemsByPath }) => itemsInPath.map((path) => itemsByPath[path]),
      errorSelector: null
    }
  );

  const levelDescriptor = useMemo(() => {
    if (itemsByPath && state.levelDescriptor) {
      return itemsByPath[state.levelDescriptor];
    }
    return null;
  }, [state.levelDescriptor, itemsByPath]);

  return (
    <>
      <Accordion
        expanded={!state.collapsed}
        onChange={() => onChangeCollapsed(!state.collapsed)}
        className={clsx(
          classes.accordion,
          props.classes?.root,
          container.baseClass,
          state.collapsed ? container.collapsedClass : container.expandedClass
        )}
        style={{
          ...container.baseStyle,
          ...(state.collapsed ? container.collapsedStyle : container.expandedStyle)
        }}
      >
        <Header
          iconClassName={clsx(icon.baseClass, state.collapsed ? icon.collapsedClass : icon.expandedClass)}
          iconStyle={{
            ...icon.baseStyle,
            ...(state.collapsed ? icon.collapsedStyle : icon.expandedStyle)
          }}
          title={title}
          locale={state.localeCode}
          onContextMenu={(anchor) => onHeaderButtonClick(anchor, 'options')}
          onLanguageMenu={siteLocales?.localeCodes?.length ? (anchor) => onHeaderButtonClick(anchor, 'language') : null}
        />
        <AccordionDetails
          className={clsx(classes.accordionDetails, showChildrenRail && classes.childrenRail, props.classes?.body)}
        >
          <Breadcrumbs
            keyword={state.keyword}
            breadcrumb={state.breadcrumb.map((path) => itemsByPath[path] ?? itemsByPath[withIndex(path)])}
            onMenu={onCurrentParentMenu}
            onSearch={(keyword) => onSearch(keyword)}
            onCrumbSelected={onBreadcrumbSelected}
            classes={{ searchRoot: props.classes?.searchRoot }}
          />
          <SuspenseWithEmptyState
            resource={resource}
            errorBoundaryProps={{
              errorStateProps: { classes: { graphic: classes.stateGraphics } }
            }}
            withEmptyStateProps={{
              emptyStateProps: {
                title: 'No items at this location',
                classes: { image: classes.stateGraphics }
              }
            }}
            suspenseProps={{
              fallback: <NavLoader numOfItems={state.limit} />
            }}
          >
            {levelDescriptor && (
              <NavItem
                item={levelDescriptor}
                locale={state.localeCode}
                isLevelDescriptor
                onOpenItemMenu={onOpenItemMenu}
                onItemClicked={onItemClicked}
              />
            )}
            <ItemList
              leaves={state.leaves}
              locale={state.localeCode}
              resource={resource}
              onSelectItem={onSelectItem}
              onPathSelected={onPathSelected}
              onPreview={onPreview}
              onOpenItemMenu={onOpenItemMenu}
              onItemClicked={onItemClicked}
              computeActiveItems={computeActiveItems}
            />
          </SuspenseWithEmptyState>
          <TablePagination
            classes={{
              root: classes.pagination,
              selectRoot: 'hidden',
              toolbar: clsx(classes.paginationToolbar, classes.widgetSection)
            }}
            component="div"
            labelRowsPerPage=""
            count={state.count}
            rowsPerPage={state.limit}
            page={state && Math.ceil(state.offset / state.limit)}
            backIconButtonProps={{ 'aria-label': formatMessage(translations.previousPage) }}
            nextIconButtonProps={{ 'aria-label': formatMessage(translations.nextPage) }}
            onChangePage={(e, page: number) => onPageChanged(page)}
          />
        </AccordionDetails>
      </Accordion>
      {Boolean(itemMenu.anchorEl) && (
        <ItemMenu
          path={itemMenu.path}
          open={true}
          loaderItems={itemMenu.loaderItems}
          anchorEl={itemMenu.anchorEl}
          onClose={onCloseItemMenu}
        />
      )}
      <ContextMenu
        anchorEl={simpleMenu.anchorEl}
        sections={simpleMenu.sections}
        emptyState={simpleMenu.emptyState}
        open={Boolean(simpleMenu.anchorEl)}
        onClose={onCloseSimpleMenu}
        onMenuItemClicked={onSimpleMenuClick}
      />
    </>
  );
}

const NavLoader = React.memo((props: { numOfItems?: number }) => {
  const { numOfItems = 5 } = props;
  const items = new Array(numOfItems).fill(null);
  return (
    <List component="nav" disablePadding={true}>
      {items.map((value, i) => (
        <PathNavigatorSkeletonItem key={i} />
      ))}
    </List>
  );
});
