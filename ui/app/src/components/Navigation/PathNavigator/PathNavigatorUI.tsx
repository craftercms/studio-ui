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

import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import TablePagination from '@material-ui/core/TablePagination';
import { DetailedItem } from '../../../models/Item';
import clsx from 'clsx';
import { useLogicResource } from '../../../utils/hooks';
import { SuspenseWithEmptyState } from '../../SystemStatus/Suspencified';
import { withIndex } from '../../../utils/path';
import { useStyles } from './styles';
import { translations } from './translations';
import Header from './PathNavigatorHeader';
import Breadcrumbs from './PathNavigatorBreadcrumbs';
import NavItem from './PathNavigatorItem';
import ItemList from './PathNavigatorList';
import LookupTable from '../../../models/LookupTable';
import { StateStylingProps } from '../../../models/UiConfig';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import List from '@material-ui/core/List';
import PathNavigatorSkeletonItem from './PathNavigatorSkeletonItem';
import GlobalState from '../../../models/GlobalState';

export type PathNavigatorUIClassKey =
  | 'root'
  | 'body'
  | 'searchRoot'
  | 'breadcrumbsRoot'
  | 'breadcrumbsSearch'
  | 'paginationRoot';

// export type PathNavigatorUIStyles = Partial<Record<PathNavigatorUIClassKey, CSSProperties>>;

export interface PathNavigatorStateProps {
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

export interface PathNavigatorUIProps {
  state: PathNavigatorStateProps;
  /**
   * Item lookup table (indexed by path)
   **/
  itemsByPath: LookupTable<DetailedItem>;
  /**
   * Styling props (classes and/or styles) applied to the widget's header icon element
   **/
  icon?: Partial<StateStylingProps & { id: string }>;
  /**
   * Styling props (classes and/or styles) applied to the widget's container element
   **/
  container?: Partial<StateStylingProps>;
  /**
   * Widget's top title/label
   **/
  title: string;
  /**
   * Indents all items of the widget wrapping them with a border on the left of the widget
   **/
  showChildrenRail?: boolean;
  /**
   *
   **/
  classes?: Partial<Record<PathNavigatorUIClassKey, string>>;
  /**
   *
   **/
  siteLocales?: GlobalState['translation']['siteLocales'];
  /**
   * Prop called to determine which items are highlighted as active/selected
   **/
  computeActiveItems?: (items: DetailedItem[]) => string[];
  /**
   * Prop fired when the widget's accordion header is clicked
   **/
  onChangeCollapsed: (collapsed: boolean) => void;
  /**
   * Prop fired when either button of the widget header is clicked (language or options button)
   **/
  onHeaderButtonClick?: (element: Element, type: 'options' | 'language') => void;
  /**
   * Prop fired when the current directory item menu is clicked
   */
  onCurrentParentMenu?: (element: Element) => void;
  /**
   * Prop fired when the search button is clicked. Omit to hide search button.
   **/
  onSearch?: (keyword: string) => void;
  /**
   * Prop fired when a breadcrumb item is clicked
   **/
  onBreadcrumbSelected: (item: DetailedItem) => void;
  /**
   * Prop fired when an item is checked in when the widget is in "selection" mode
   **/
  onSelectItem?: (item: DetailedItem, checked: boolean) => void;
  /**
   *
   **/
  onPathSelected: (item: DetailedItem) => void;
  /**
   * Prop fired when the widget determines the clicked item is "previewable".
   * It may be fired by the widget's default onItemClicked handler or via the "view"
   * button of each item when the clicked item is not a folder
   **/
  onPreview?: (item: DetailedItem) => void;
  /**
   * Prop fired when a list item options button is clicked
   **/
  onOpenItemMenu?: (element: Element, item: DetailedItem) => void;
  /**
   * Prop fired when a list item itself is clicked (anywhere but it's buttons)
   **/
  onItemClicked?: (item: DetailedItem) => void;
  /**
   *
   **/
  onPageChanged?: (page: number) => void;
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

export function PathNavigatorUI(props: PathNavigatorUIProps) {
  const classes = useStyles();
  // region consts {...} = props
  const {
    state,
    itemsByPath,
    icon,
    container,
    title,
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
    <Accordion
      expanded={!state.collapsed}
      onChange={() => onChangeCollapsed(!state.collapsed)}
      className={clsx(
        classes.accordion,
        props.classes?.root,
        container?.baseClass,
        container ? (state.collapsed ? container.collapsedClass : container.expandedClass) : void 0
      )}
      style={{
        ...container?.baseStyle,
        ...(container ? (state.collapsed ? container.collapsedStyle : container.expandedStyle) : void 0)
      }}
    >
      <Header
        iconClassName={clsx(
          icon?.baseClass,
          icon ? (state.collapsed ? icon.collapsedClass : icon.expandedClass) : null
        )}
        iconStyle={{
          ...icon?.baseStyle,
          ...(icon ? (state.collapsed ? icon.collapsedStyle : icon.expandedStyle) : null)
        }}
        title={title}
        locale={state.localeCode}
        onContextMenu={onHeaderButtonClick ? (anchor) => onHeaderButtonClick(anchor, 'options') : null}
        onLanguageMenu={
          onHeaderButtonClick && siteLocales?.localeCodes?.length
            ? (anchor) => onHeaderButtonClick(anchor, 'language')
            : null
        }
      />
      <AccordionDetails
        className={clsx(classes.accordionDetails, showChildrenRail && classes.childrenRail, props.classes?.body)}
      >
        <Breadcrumbs
          keyword={state.keyword}
          breadcrumb={state.breadcrumb.map((path) => itemsByPath[path] ?? itemsByPath[withIndex(path)])}
          onMenu={onCurrentParentMenu}
          onSearch={onSearch}
          onCrumbSelected={onBreadcrumbSelected}
          classes={{ root: props.classes?.breadcrumbsRoot, searchRoot: props.classes?.breadcrumbsSearch }}
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
        {state.count !== null && (
          <TablePagination
            classes={{
              root: clsx(classes.pagination, props.classes?.paginationRoot),
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
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default PathNavigatorUI;
