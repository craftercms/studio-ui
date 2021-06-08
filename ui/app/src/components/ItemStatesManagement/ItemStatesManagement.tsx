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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ApiResponse from '../../models/ApiResponse';
import { useActiveSiteId, useDebouncedInput, useLogicResource, useSpreadState } from '../../utils/hooks';
import { fetchItemStates, setItemStates, setItemStatesByQuery, StatesToUpdate } from '../../services/workflow';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage, useIntl } from 'react-intl';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import ItemStatesGridUI, { drawerWidth, ItemStatesGridSkeletonTable, states } from '../ItemStatesGrid';
import SetItemStateDialog from '../SetWorkflowStateDialog';
import Button from '@material-ui/core/Button';
import FilterListRoundedIcon from '@material-ui/icons/FilterListRounded';
import { useStyles } from './styles';
import LookupTable from '../../models/LookupTable';
import { createPresenceTable } from '../../utils/array';
import { getStateMask } from './utils';
import { ItemStateMap, SandboxItem } from '../../models/Item';
import { PagedArray } from '../../models/PagedArray';
import Box from '@material-ui/core/Box';
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { Divider } from '@material-ui/core';
import ItemPublishingTargetIcon from '../ItemPublishingTargetIcon';
import { getItemPublishingTargetText, getItemStateText } from '../ItemDisplay/utils';
import ItemStateIcon from '../ItemStateIcon';
import ActionsBar from '../ActionsBar';
import translations from './translations';
import ResizeableDrawer from '../../modules/Preview/ResizeableDrawer';

interface ItemStatesManagementProps {
  embedded?: boolean;
}

export default function ItemStatesManagement(props: ItemStatesManagementProps) {
  const { embedded } = props;
  const [fetching, setFetching] = useState(false);
  const [items, setItems] = useState<PagedArray<SandboxItem>>(null);
  const [error, setError] = useState<ApiResponse>();
  const siteId = useActiveSiteId();
  const [openSetStateDialog, setOpenSetStateDialog] = useState(false);
  const [openFiltersDrawer, setOpenFiltersDrawer] = useState(false);
  const [filtersLookup, setFiltersLookup] = useSpreadState<LookupTable<boolean>>(createPresenceTable(states, false));
  const [pathRegex, setPathRegex] = useState('');
  const [debouncePathRegex, setDebouncePathRegex] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [drawerTopPosition, setDrawerTopPosition] = useState(64);
  const [selectedItems, setSelectedItems] = useState<LookupTable<SandboxItem>>({});
  const [selectedItem, setSelectedItem] = useState<SandboxItem>(null);
  const [isSelectedItemsOnAllPages, setIsSelectedItemsOnAllPages] = useState(false);
  const classes = useStyles();
  const { formatMessage } = useIntl();

  const hasSelectedItems = useMemo(() => Object.values(selectedItems).some((value) => value), [selectedItems]);
  const selectedItemsLength = useMemo(() => Object.values(selectedItems).filter((value) => value).length, [
    selectedItems
  ]);
  const isThisPageIndeterminate = useMemo(() => items?.some((item) => !selectedItems[item.path]), [
    items,
    selectedItems
  ]);
  const hasThisPageItemsChecked = useMemo(() => items?.some((item) => selectedItems[item.path]), [
    items,
    selectedItems
  ]);

  const rootRef = useRef<HTMLDivElement>();

  const fetchStates = useCallback(() => {
    let stateMask = getStateMask(filtersLookup as ItemStateMap);

    setFetching(true);
    fetchItemStates(siteId, debouncePathRegex, stateMask ? stateMask : null, { limit, offset }).subscribe(
      (states) => {
        setItems(states);
        setFetching(false);
      },
      ({ response }) => {
        setError(response);
        setFetching(false);
      }
    );
  }, [debouncePathRegex, filtersLookup, siteId, limit, offset]);

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  const resource = useLogicResource<
    PagedArray<SandboxItem>,
    { states: PagedArray<SandboxItem>; error: ApiResponse; fetching: boolean }
  >(
    useMemo(() => ({ states: items, error, fetching }), [items, error, fetching]),
    {
      shouldResolve: (source) => Boolean(source.states) && !fetching,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => fetching && resource.complete,
      resultSelector: (source) => source.states,
      errorSelector: () => error
    }
  );

  const onPathRegex$ = useDebouncedInput(
    useCallback(
      (keyword: string) => {
        clearSelectedItems();
        setDebouncePathRegex(keyword);
      },
      [setDebouncePathRegex]
    ),
    400
  );

  const onPathRegexInputChanges = (value: string) => {
    setPathRegex(value);
    onPathRegex$.next(value);
  };

  const onFilterChecked = (id: string, value: boolean) => {
    clearSelectedItems();
    if (id === 'all') {
      setFiltersLookup(createPresenceTable(states, value));
    } else {
      setFiltersLookup({ [id]: value });
    }
  };

  const onClearFilters = () => {
    setFiltersLookup(createPresenceTable(states, false));
    setDebouncePathRegex('');
    setPathRegex('');
  };

  const onChangePage = (page: number) => {
    setOffset(page * limit);
  };

  const onChangeRowsPerPage = (e) => {
    setLimit(e.target.value);
  };

  const onItemSelected = (item: SandboxItem, value: boolean) => {
    setSelectedItems({ ...selectedItems, [item.path]: value ? item : null });
  };

  const onRowSelected = (item: SandboxItem) => {
    setSelectedItem(item);
    setOpenSetStateDialog(true);
  };

  const onOptionClicked = (option: string) => {
    if (option === 'editStates') {
      setSelectedItem(null);
      setOpenSetStateDialog(true);
    } else if (option === 'clearSelected') {
      clearSelectedItems();
      setIsSelectedItemsOnAllPages(false);
    } else if ('selectAll') {
      clearSelectedItems();
      setIsSelectedItemsOnAllPages(true);
    }
  };

  const clearSelectedItems = () => {
    setSelectedItems({});
  };

  const onToggleSelectAllItems = () => {
    const selectedItemsOnPage = {};
    if (isThisPageIndeterminate) {
      items.forEach((item) => (selectedItemsOnPage[item.path] = true));
    } else {
      items.forEach((item) => (selectedItemsOnPage[item.path] = null));
    }
    setSelectedItems({ ...selectedItems, ...selectedItemsOnPage });
  };

  const onToggleSelectedItemsOnPage = () => {
    const selectedItemsOnPage = {};
    items.forEach((item) => (selectedItemsOnPage[item.path] = true));
    setSelectedItems({ ...selectedItems, ...selectedItemsOnPage });
  };

  const onSetItemStateDialogConfirm = (update: StatesToUpdate) => {
    if (selectedItem) {
      setItemStates(siteId, [selectedItem.path], update).subscribe(() => {
        fetchStates();
      });
    } else if (isSelectedItemsOnAllPages) {
      let stateMask = getStateMask(filtersLookup as ItemStateMap);
      setItemStatesByQuery(siteId, stateMask ? stateMask : null, update, debouncePathRegex).subscribe(() => {
        fetchStates();
      });
    } else {
      setItemStates(
        siteId,
        Object.values(selectedItems).map((item) => item.path),
        update
      ).subscribe(() => {
        fetchStates();
      });
    }

    setOpenSetStateDialog(false);
  };

  const onSetItemStateDialogClose = () => {
    setSelectedItem(null);
    setOpenSetStateDialog(false);
  };

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.onscroll = () => {
        setDrawerTopPosition(rootRef.current.scrollTop > 64 ? 0 : 64 - rootRef.current.scrollTop);
      };
    }
  }, []);

  useEffect(() => {
    if (selectedItemsLength) {
      setIsSelectedItemsOnAllPages(false);
    }
  }, [selectedItemsLength]);

  return (
    <section ref={rootRef} className={classes.root}>
      <GlobalAppToolbar
        title={!embedded && <FormattedMessage id="siteTools.itemStates" defaultMessage="Item States" />}
        rightContent={
          <Button
            className={!embedded && classes.filterButton}
            endIcon={<FilterListRoundedIcon />}
            variant="outlined"
            color={pathRegex || Object.values(filtersLookup).some((value) => value) ? 'primary' : 'default'}
            onClick={() => setOpenFiltersDrawer(!openFiltersDrawer)}
          >
            <FormattedMessage id="words.filters" defaultMessage="Filters" />
          </Button>
        }
        showHamburgerMenuButton={!embedded}
        showAppsButton={!embedded}
      />

      <Box
        display="flex"
        flexDirection="column"
        flexGrow={1}
        width={`calc(100% - ${openFiltersDrawer ? drawerWidth : 0}px)`}
        className={classes.wrapper}
        position="relative"
      >
        {(hasSelectedItems || isSelectedItemsOnAllPages) && (
          <ActionsBar
            classes={{
              root: classes.actionsBarRoot,
              checkbox: classes.actionsBarCheckbox
            }}
            options={[
              {
                id: 'editStates',
                label: formatMessage(translations.editStates, {
                  count: isSelectedItemsOnAllPages ? items.total : selectedItemsLength
                })
              },
              {
                id: 'clearSelected',
                label: formatMessage(translations.clearSelected)
              },
              ...(isSelectedItemsOnAllPages
                ? []
                : [
                    {
                      id: 'selectAll',
                      label: formatMessage(translations.selectAll, { count: items.total })
                    }
                  ])
            ]}
            isIndeterminate={hasThisPageItemsChecked ? isThisPageIndeterminate : false}
            isChecked={hasThisPageItemsChecked}
            onOptionClicked={onOptionClicked}
            toggleSelectAll={onToggleSelectAllItems}
          />
        )}
        <SuspenseWithEmptyState
          resource={resource}
          withEmptyStateProps={{
            emptyStateProps: {
              title: <FormattedMessage id="itemStates.emptyStateMessage" defaultMessage="No results found" />,
              styles: {
                root: {
                  height: '100%',
                  margin: 0
                }
              }
            }
          }}
          suspenseProps={{
            fallback: <ItemStatesGridSkeletonTable />
          }}
        >
          <ItemStatesGridUI
            resource={resource}
            rowsPerPageOptions={[5, 10, 15]}
            selectedItems={selectedItems}
            onItemSelected={onItemSelected}
            onToggleSelectedItems={onToggleSelectedItemsOnPage}
            onChangePage={onChangePage}
            onChangeRowsPerPage={onChangeRowsPerPage}
            onRowSelected={onRowSelected}
          />
        </SuspenseWithEmptyState>
        <ResizeableDrawer
          open={openFiltersDrawer}
          belowToolbar
          width={drawerWidth}
          anchor="right"
          styles={{
            drawerBody: {
              overflowY: 'inherit'
            },
            drawerPaper: {
              overflow: 'inherit'
            },
            drawerPaperBelowToolbar: {
              top: drawerTopPosition,
              transition: 'top 250ms ease-out 0ms'
            }
          }}
          classes={{
            drawerPaper: classes.drawerPaper
          }}
        >
          <form noValidate autoComplete="off">
            <Button
              disabled={pathRegex === '' && !Object.values(filtersLookup).some((value) => value)}
              endIcon={<CloseIcon />}
              variant="outlined"
              onClick={onClearFilters}
              fullWidth
            >
              <FormattedMessage id="itemStates.clearFilters" defaultMessage="Clear Filters" />
            </Button>
            <TextField
              value={pathRegex}
              className={classes.inputPath}
              onChange={(e) => onPathRegexInputChanges(e.target.value)}
              label={<FormattedMessage id="itemStates.pathRegex" defaultMessage="Path (regex)" />}
              fullWidth
              variant="outlined"
              FormHelperTextProps={{
                className: classes.helperText
              }}
              helperText={
                <FormattedMessage id="itemStates.pathRegexHelperText" defaultMessage="Use a path-matching regex" />
              }
            />
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend" className={classes.formLabel}>
                <FormattedMessage id="itemStates.showItemsIn" defaultMessage="Show Items In" />
              </FormLabel>
              <FormGroup className={classes.formGroup}>
                <FormControlLabel
                  classes={{ label: classes.iconLabel }}
                  control={
                    <Checkbox
                      checked={Object.values(filtersLookup).some((value) => value)}
                      indeterminate={
                        Object.values(filtersLookup).every((value) => value)
                          ? null
                          : Object.values(filtersLookup).some((value) => value)
                      }
                      name="all"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        onFilterChecked(event.target.name, !Object.values(filtersLookup).every((value) => value));
                      }}
                    />
                  }
                  label={<FormattedMessage id="itemStates.allStates" defaultMessage="All states" />}
                />
                <Divider />
                {states.map((id) => (
                  <FormControlLabel
                    key={id}
                    classes={{ label: classes.iconLabel }}
                    control={
                      <Checkbox
                        checked={filtersLookup[id]}
                        name={id}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                          onFilterChecked(event.target.name, event.target.checked);
                        }}
                      />
                    }
                    label={
                      ['staged', 'live'].includes(id) ? (
                        <>
                          <ItemPublishingTargetIcon item={{ stateMap: { [id]: true } } as SandboxItem} />
                          {getItemPublishingTargetText({ [id]: true } as ItemStateMap)}
                        </>
                      ) : (
                        <>
                          <ItemStateIcon item={{ stateMap: { [id]: true } } as SandboxItem} />
                          {getItemStateText({ [id]: true } as ItemStateMap)}
                        </>
                      )
                    }
                  />
                ))}
              </FormGroup>
            </FormControl>
          </form>
        </ResizeableDrawer>
      </Box>
      <SetItemStateDialog
        title={
          <FormattedMessage
            id="workflowStates.setState"
            defaultMessage='{count, plural, one {Set State for "{name}"} other {Set State for Items}}'
            values={{
              count: selectedItem ? 1 : selectedItemsLength,
              name: selectedItem?.label
            }}
          />
        }
        open={openSetStateDialog}
        onClose={onSetItemStateDialogClose}
        onConfirm={onSetItemStateDialogConfirm}
      />
    </section>
  );
}
