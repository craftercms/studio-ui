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

import React, { ElementType, Fragment, useMemo, useState } from 'react';
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
import { withIndex, withoutIndex } from '../../../utils/path';
import { useStyles } from './styles';
import { translations } from './translations';
import Header from './PathNavigatorHeader';
import Breadcrumbs from './PathNavigatorBreadcrumbs';
import Nav from './PathNavigatorList';
import ContentLoader from 'react-content-loader';
import { languages } from '../../../utils/i18n-legacy';
import { removeSpaces } from '../../../utils/string';
import {
  pathNavigatorInit,
  pathNavigatorItemChecked,
  pathNavigatorItemUnchecked,
  pathNavigatorSetCollapsed,
  pathNavigatorSetCurrentPath,
  pathNavigatorSetKeyword
} from '../../../state/actions/pathNavigator';
import { getStoredPreviewChoice } from '../../../utils/state';
import { ItemMenu } from '../../ItemMenu/ItemMenu';
import { completeDetailedItem, fetchUserPermissions } from '../../../state/actions/content';
import { showEditDialog, showPreviewDialog } from '../../../state/actions/dialogs';
import { getContent } from '../../../services/content';
import { getNumOfMenuOptionsForItem, rand } from './utils';
import LoadingState from '../../SystemStatus/LoadingState';
import LookupTable from '../../../models/LookupTable';

const MyLoader = React.memo(function() {
  const [items] = useState(() => {
    const numOfItems = 5;
    const start = 20;
    return new Array(numOfItems).fill(null).map((_, i) => ({
      y: start + 30 * i,
      width: rand(70, 85)
    }));
  });
  return (
    <ContentLoader speed={2} width="100%" backgroundColor="#f3f3f3" foregroundColor="#ecebeb">
      {items.map(({ y, width }, i) => (
        <Fragment key={i}>
          <circle cx="10" cy={y} r="8" />
          <rect x="25" y={y - 5} rx="5" ry="5" width={`${width}%`} height="10" />
        </Fragment>
      ))}
    </ContentLoader>
  );
});

const menuOptions = {
  refresh: {
    id: 'refresh',
    label: translations.refresh
  }
};

export interface WidgetProps {
  path: string;
  icon?: string | React.ElementType;
  id: string;
  title?: string;
  locale: string;
  classes?: Partial<Record<'root' | 'body' | 'searchRoot', string>>;
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
  itemsInPath: string[];
  breadcrumb: string[];
  selectedItems: string[];
  leafs: string[];
  count: number; // Number of items in the current path
  limit: number;
  offset: number;
  collapsed?: boolean;
}

// PathNavigator
export default function(props: WidgetProps) {
  const { title, icon, path, id = removeSpaces(props.title), locale } = props;
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
      dispatch(pathNavigatorInit({ id, path: path, locale: locale }));
    }
  });

  if (!state) {
    return <LoadingState />;
  }

  const onPathSelected = (item: DetailedItem) => {
    dispatch(
      pathNavigatorSetCurrentPath({
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
      getContent(site, item.path).subscribe((content) => {
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

  const onItemClicked = (item: DetailedItem) => {
    if (item.previewUrl) {
      let previewBase = getStoredPreviewChoice(site) === '2' ? 'next/preview' : 'preview';
      window.location.href = `${authoringBase}/${previewBase}#/?page=${item.previewUrl}&site=${site}`;
    }
  };

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
        pathNavigatorSetCurrentPath({
          id,
          path: state.currentPath
        })
      );
    }
  };

  const onItemMenuActionSuccessCreator = (args) => ({
    type: 'PATH_NAVIGATOR_ITEM_ACTION_SUCCESS',
    payload: { id, ...args }
  });

  const onHeaderClick = (collapsed: boolean) => {
    dispatch(pathNavigatorSetCollapsed({ id, collapsed }));
  };

  const onSearch = (keyword: string) => {
    dispatch(pathNavigatorSetKeyword({ id, keyword }));
  };

  return (
    <Suspencified>
      <WidgetUI
        state={state}
        itemsByPath={itemsByPath}
        icon={icon}
        title={title}
        itemMenu={itemMenu}
        simpleMenu={simpleMenu}
        onHeaderClick={onHeaderClick}
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
        onItemMenuActionSuccessCreator={onItemMenuActionSuccessCreator}
      />
    </Suspencified>
  );
}

function WidgetUI(props: any) {
  const classes = useStyles({});
  const {
    state,
    itemsByPath,
    icon,
    title,
    itemMenu,
    simpleMenu,
    onHeaderClick,
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
    onItemMenuActionSuccessCreator
  } = props;
  const { formatMessage } = useIntl();

  const resource = useLogicResource<
    DetailedItem[],
    { itemsInPath: string[]; itemsByPath: LookupTable<DetailedItem> }
  >(
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
      resultSelector: ({ itemsInPath, itemsByPath }) =>
        itemsInPath.map((path) => itemsByPath[path]),
      errorSelector: null
    }
  );

  return (
    <section className={clsx(classes.root, props.classes?.root, state?.collapsed && 'collapsed')}>
      <Header
        icon={icon}
        title={title}
        locale={state?.localeCode}
        onClick={() => onHeaderClick(!state?.collapsed)}
        onContextMenu={(anchor) => onHeaderButtonClick(anchor, 'options')}
        onLanguageMenu={
          siteLocales?.localeCodes?.length
            ? (anchor) => onHeaderButtonClick(anchor, 'language')
            : null
        }
      />
      <div {...(state?.collapsed ? { hidden: true } : {})} className={clsx(props.classes?.body)}>
        <Breadcrumbs
          keyword={state?.keyword}
          breadcrumb={state?.breadcrumb.map(
            (path) => itemsByPath[path] ?? itemsByPath[withIndex(path)]
          )}
          onMenu={onCurrentParentMenu}
          onSearch={(keyword) => onSearch(keyword)}
          onCrumbSelected={onBreadcrumbSelected}
          classes={{ searchRoot: props.classes?.searchRoot }}
        />
        <SuspenseWithEmptyState
          resource={resource}
          loadingStateProps={{
            graphicProps: { className: classes.stateGraphics }
          }}
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
            fallback: <MyLoader />
          }}
        >
          <Nav
            leafs={state?.leafs}
            locale={state?.localeCode}
            resource={resource}
            onSelectItem={onSelectItem}
            onPathSelected={onPathSelected}
            onPreview={onPreview}
            onOpenItemMenu={onOpenItemMenu}
            onItemClicked={onItemClicked}
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
          count={state?.count}
          rowsPerPage={state?.limit}
          page={state && Math.ceil(state.offset / state.limit)}
          backIconButtonProps={{ 'aria-label': formatMessage(translations.previousPage) }}
          nextIconButtonProps={{ 'aria-label': formatMessage(translations.nextPage) }}
          onChangePage={(e, page: number) => onPageChanged(page)}
        />
      </div>
      {Boolean(itemMenu.anchorEl) && (
        <ItemMenu
          path={itemMenu.path}
          open={true}
          loaderItems={itemMenu.loaderItems}
          anchorEl={itemMenu.anchorEl}
          onClose={onCloseItemMenu}
          onItemMenuActionSuccessCreator={onItemMenuActionSuccessCreator}
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
    </section>
  );
}
