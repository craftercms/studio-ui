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

import React, { ChangeEvent, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import TablePagination from '@mui/material/TablePagination';
import { DetailedItem } from '../../models/Item';
import clsx from 'clsx';
import { SuspenseWithEmptyState } from '../Suspencified/Suspencified';
import { useStyles } from './styles';
import { translations } from './translations';
import Header from './PathNavigatorHeader';
import Breadcrumbs from './PathNavigatorBreadcrumbs';
import NavItem from './PathNavigatorItem';
import ItemList from './PathNavigatorList';
import LookupTable from '../../models/LookupTable';
import { StateStylingProps } from '../../models/UiConfig';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import GlobalState from '../../models/GlobalState';
import { PathNavigatorStateProps } from './PathNavigator';
import { SystemIconDescriptor } from '../SystemIcon';
import { lookupItemByPath } from '../../utils/content';
import { useLogicResource } from '../../hooks/useLogicResource';
import { createFakeResource } from '../../utils/resource';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import NavLoader from './NavLoader';

export type PathNavigatorUIClassKey =
  | 'root'
  | 'body'
  | 'searchRoot'
  | 'breadcrumbsRoot'
  | 'breadcrumbsSearch'
  | 'paginationRoot';

// export type PathNavigatorUIStyles = Partial<Record<PathNavigatorUIClassKey, CSSProperties>>;

export interface PathNavigatorUIProps {
  state: PathNavigatorStateProps;
  /**
   * Item lookup table (indexed by path)
   **/
  itemsByPath: LookupTable<DetailedItem>;
  /**
   * Styling props (classes and/or styles) applied to the widget's header icon element
   **/
  icon?: SystemIconDescriptor;
  /**
   * Styling props (classes and/or styles) applied to the widget's container element
   **/
  container?: Partial<StateStylingProps>;
  /**
   * Widget's top title/label
   **/
  title: string;
  /**
   * Widget's search keyword
   **/
  keyword: string;
  /**
   *
   **/
  classes?: Partial<Record<PathNavigatorUIClassKey, string>>;
  /**
   *
   **/
  siteLocales?: GlobalState['uiConfig']['siteLocales'];
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
  onBreadcrumbSelected: (item: DetailedItem, event: React.SyntheticEvent) => void;
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
  onItemClicked?(item: DetailedItem, event?: React.MouseEvent): void;
  /**
   *
   **/
  onPageChanged?: (page: number) => void;
  onRowsPerPageChange?: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
}

export function PathNavigatorUI(props: PathNavigatorUIProps) {
  const classes = useStyles();
  // region consts {...} = props
  const {
    state,
    itemsByPath,
    icon,
    container,
    title,
    onChangeCollapsed,
    onHeaderButtonClick,
    onCurrentParentMenu,
    siteLocales,
    onSearch,
    keyword,
    onBreadcrumbSelected,
    onSelectItem,
    onPathSelected,
    onPreview,
    onOpenItemMenu,
    onItemClicked,
    onPageChanged,
    computeActiveItems,
    onRowsPerPageChange
  } = props;
  // endregion
  const { formatMessage } = useIntl();

  const resource = useLogicResource<
    DetailedItem[],
    { itemsInPath: string[]; itemsByPath: LookupTable<DetailedItem>; isFetching: boolean; error: any }
  >(
    useMemo(
      () => ({
        itemsByPath,
        itemsInPath: state.itemsInPath,
        isFetching: state.isFetching,
        error: state.error
      }),
      // We only want to renew the state when itemsInPath changes.
      // Note: This only works whilst `itemsByPath` updates prior to `itemsInPath`.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [state.itemsInPath, state.isFetching, state.error]
    ),
    {
      shouldResolve: ({ itemsInPath, itemsByPath, isFetching, error }) => {
        return !isFetching && Boolean(itemsInPath) && !itemsInPath.some((path) => !lookupItemByPath(path, itemsByPath));
      },
      shouldRenew: ({ isFetching }, resource) => isFetching && resource.complete,
      shouldReject: ({ error }) => Boolean(error),
      resultSelector: ({ itemsInPath, itemsByPath }) => itemsInPath.map((path) => itemsByPath[path]),
      errorSelector: ({ error }) => error.response
    }
  );

  const itemsResource = useMemo(
    () => createFakeResource(state.itemsInPath ? state.itemsInPath.map((path) => itemsByPath[path]) : []),
    [itemsByPath, state.itemsInPath]
  );

  const levelDescriptor = useMemo(() => {
    if (itemsByPath && state.levelDescriptor) {
      return itemsByPath[state.levelDescriptor];
    }
    return null;
  }, [state.levelDescriptor, itemsByPath]);

  return (
    <Accordion
      square
      disableGutters
      elevation={0}
      TransitionProps={{ unmountOnExit: true }}
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
        icon={icon}
        title={title}
        locale={state.localeCode}
        // @see https://github.com/craftercms/craftercms/issues/5360
        menuButtonIcon={<RefreshRounded />}
        onMenuButtonClick={onHeaderButtonClick ? (anchor) => onHeaderButtonClick(anchor, 'options') : null}
        onLanguageMenu={
          onHeaderButtonClick && siteLocales?.localeCodes?.length
            ? (anchor) => onHeaderButtonClick(anchor, 'language')
            : null
        }
        collapsed={state.collapsed}
      />
      <AccordionDetails className={clsx(classes.accordionDetails, props.classes?.body)}>
        <Breadcrumbs
          keyword={keyword}
          breadcrumb={state.breadcrumb.map((path) => lookupItemByPath(path, itemsByPath)).filter(Boolean)}
          onSearch={onSearch}
          onCrumbSelected={onBreadcrumbSelected}
          classes={{ root: props.classes?.breadcrumbsRoot, searchRoot: props.classes?.breadcrumbsSearch }}
        />
        {lookupItemByPath(state.currentPath, itemsByPath) && (
          <NavItem
            item={lookupItemByPath(state.currentPath, itemsByPath)}
            locale={state.localeCode}
            isLevelDescriptor={false}
            onOpenItemMenu={onCurrentParentMenu}
            onItemClicked={onItemClicked}
            showItemNavigateToButton={false}
            isCurrentPath
          />
        )}
        <SuspenseWithEmptyState
          resource={resource}
          errorBoundaryProps={{
            errorStateProps: { imageUrl: null }
          }}
          withEmptyStateProps={{
            /* If there are no children and no level descriptor => empty */
            isEmpty: (children) => children.length === 0 && !Boolean(levelDescriptor),
            emptyStateProps: {
              title: (
                <FormattedMessage id="pathNavigator.noItemsAtLocation" defaultMessage="No items at this location" />
              ),
              image: null
            }
          }}
          suspenseProps={{
            fallback: <NavLoader numOfItems={state.itemsInPath?.length > 0 ? state.itemsInPath.length : state.limit} />
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
            classes={{ root: classes.childrenList }}
            isSelectMode={false}
            locale={state.localeCode}
            resource={itemsResource}
            onSelectItem={onSelectItem}
            onPathSelected={onPathSelected}
            onPreview={onPreview}
            onOpenItemMenu={onOpenItemMenu}
            onItemClicked={onItemClicked}
            computeActiveItems={computeActiveItems}
          />
        </SuspenseWithEmptyState>
        {state.total !== null && state.total > 0 && (
          <TablePagination
            classes={{
              root: clsx(classes.pagination, props.classes?.paginationRoot),
              toolbar: clsx(classes.paginationToolbar, classes.widgetSection)
            }}
            component="div"
            labelRowsPerPage=""
            count={state.total}
            rowsPerPage={state.limit}
            page={state && Math.ceil(state.offset / state.limit)}
            backIconButtonProps={{ 'aria-label': formatMessage(translations.previousPage) }}
            nextIconButtonProps={{ 'aria-label': formatMessage(translations.nextPage) }}
            onRowsPerPageChange={onRowsPerPageChange}
            onPageChange={(e, page: number) => onPageChanged(page)}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default PathNavigatorUI;
