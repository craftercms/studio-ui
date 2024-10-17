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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ApiResponse from '../../models/ApiResponse';
import { fetchItemStates, setItemStates, setItemStatesByQuery, StatesToUpdate } from '../../services/workflow';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage, useIntl } from 'react-intl';
import ItemStatesGridUI, { ItemStatesGridSkeletonTable } from '../ItemStatesGrid';
import SetItemStateDialog from '../SetWorkflowStateDialog';
import Button from '@mui/material/Button';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import { useStyles } from './styles';
import LookupTable from '../../models/LookupTable';
import { createPresenceTable } from '../../utils/array';
import { getStateBitmap } from './utils';
import { ItemStateMap, ItemStates, SandboxItem } from '../../models/Item';
import { PagedArray } from '../../models/PagedArray';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Divider } from '@mui/material';
import ItemPublishingTargetIcon from '../ItemPublishingTargetIcon';
import { getItemPublishingTargetText, getItemStateText } from '../ItemDisplay/utils';
import ItemStateIcon from '../ItemStateIcon';
import translations from './translations';
import ResizeableDrawer from '../ResizeableDrawer/ResizeableDrawer';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useDebouncedInput } from '../../hooks/useDebouncedInput';
import { useSpreadState } from '../../hooks/useSpreadState';
import ItemActionsSnackbar from '../ItemActionsSnackbar';
import SecondaryButton from '../SecondaryButton';
import { onSubmittingAndOrPendingChangeProps } from '../../hooks/useEnhancedDialogState';
import useUpdateRefs from '../../hooks/useUpdateRefs';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../state/actions/system';
import { defineMessages } from 'react-intl';
import useMount from '../../hooks/useMount';
import { fetchPublishingTargets } from '../../services/publishing';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { EmptyState } from '../EmptyState';

const workflowStateManagementMessages = defineMessages({
  statesUpdatedMessage: {
    id: 'workflowStateManagementMessages.statesUpdatedMessage',
    defaultMessage: 'State for {count} {count, plural, one {item} other {items}} updated successfully'
  }
});

export interface WorkflowStateManagementProps {
  embedded?: boolean;
  showAppsButton?: boolean;
  onSubmittingAndOrPendingChange?(value: onSubmittingAndOrPendingChangeProps): void;
}

const drawerWidth = 260;

const initialStates: ItemStates[] = [
  'new',
  'modified',
  'deleted',
  'locked',
  'systemProcessing',
  'submitted',
  'scheduled',
  'staged',
  'live'
];

export function WorkflowStateManagement(props: WorkflowStateManagementProps) {
  const { embedded, showAppsButton = !embedded, onSubmittingAndOrPendingChange } = props;
  const [fetching, setFetching] = useState(false);
  const [items, setItems] = useState<PagedArray<SandboxItem>>(null);
  const [error, setError] = useState<ApiResponse>();
  const siteId = useActiveSiteId();
  const [openSetStateDialog, setOpenSetStateDialog] = useState(false);
  const [openFiltersDrawer, setOpenFiltersDrawer] = useState(false);
  const [filtersLookup, setFiltersLookup] = useSpreadState<LookupTable<boolean>>(
    createPresenceTable(initialStates, false)
  );
  const [pathRegex, setPathRegex] = useState('');
  const [debouncePathRegex, setDebouncePathRegex] = useState('');
  const [invalidPathRegex, setInvalidPathRegex] = useState(false);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [selectedItems, setSelectedItems] = useState<LookupTable<SandboxItem>>({});
  const [selectedItem, setSelectedItem] = useState<SandboxItem>(null);
  const [isSelectedItemsOnAllPages, setIsSelectedItemsOnAllPages] = useState(false);
  const [hasStaging, setHasStaging] = useState(false);
  const states = useMemo(
    () => (hasStaging ? initialStates : initialStates.filter((state) => state !== 'staged')),
    [hasStaging]
  );
  const { classes } = useStyles();
  const { formatMessage } = useIntl();
  const fnRefs = useUpdateRefs({ onSubmittingAndOrPendingChange });
  const dispatch = useDispatch();

  const hasSelectedItems = useMemo(() => Object.values(selectedItems).some(Boolean), [selectedItems]);
  const selectedItemsLength = useMemo(() => Object.values(selectedItems).filter(Boolean).length, [selectedItems]);
  const isThisPageIndeterminate = useMemo(
    () => items?.some((item) => !selectedItems[item.path]),
    [items, selectedItems]
  );
  const hasThisPageItemsChecked = useMemo(
    () => items?.some((item) => selectedItems[item.path]),
    [items, selectedItems]
  );

  const rootRef = useRef<HTMLDivElement>();

  const fetchStates = useCallback(() => {
    let stateBitmap = getStateBitmap(filtersLookup as ItemStateMap);

    setFetching(true);
    fetchItemStates(siteId, debouncePathRegex, stateBitmap ? stateBitmap : null, { limit, offset }).subscribe({
      next(states) {
        setItems(states);
        setFetching(false);
      },
      error({ response }) {
        setError(response);
        setFetching(false);
      }
    });
  }, [debouncePathRegex, filtersLookup, siteId, limit, offset]);

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  useEffect(() => {
    fnRefs.current.onSubmittingAndOrPendingChange?.({
      hasPendingChanges: hasSelectedItems
    });
  }, [hasSelectedItems, fnRefs]);

  useMount(() => {
    const sub = fetchPublishingTargets(siteId).subscribe({
      next({ publishingTargets: targets }) {
        setHasStaging(targets.some((target) => target.name === 'staging'));
      }
    });
    return () => {
      sub.unsubscribe();
    };
  });

  const onPathRegex$ = useDebouncedInput(
    useCallback(
      (keyword: string) => {
        clearSelectedItems();

        try {
          new RegExp(keyword);
          setOffset(0);
          setDebouncePathRegex(keyword);
          setInvalidPathRegex(false);
        } catch (e) {
          // Not a valid regex
          setInvalidPathRegex(true);
        }
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
    setOffset(0);
    if (id === 'any') {
      setFiltersLookup(createPresenceTable(states, !value));
    } else {
      setFiltersLookup({ [id]: value });
    }
  };

  const onClearFilters = () => {
    setOffset(0);
    setFiltersLookup(createPresenceTable(states, false));
    setDebouncePathRegex('');
    setPathRegex('');
  };

  const onPageChange = (page: number) => {
    setOffset(page * limit);
  };

  const onRowsPerPageChange = (e) => {
    setLimit(e.target.value);
  };

  const onItemSelected = (selectedItem: SandboxItem, value: boolean) => {
    if (isSelectedItemsOnAllPages) {
      const selectedItemsOnPage = {};
      setIsSelectedItemsOnAllPages(false);
      items.forEach((item) => {
        if (item.path !== selectedItem.path) {
          selectedItemsOnPage[item.path] = item;
        }
      });
      setSelectedItems({ ...selectedItems, ...selectedItemsOnPage });
    } else {
      setSelectedItems({ ...selectedItems, [selectedItem.path]: value ? selectedItem : null });
    }
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
    if (isSelectedItemsOnAllPages) {
      setIsSelectedItemsOnAllPages(false);
    } else {
      const selectedItemsOnPage = {};
      if (isThisPageIndeterminate) {
        items.forEach((item) => (selectedItemsOnPage[item.path] = item));
      } else {
        items.forEach((item) => (selectedItemsOnPage[item.path] = null));
      }
      setSelectedItems({ ...selectedItems, ...selectedItemsOnPage });
    }
  };

  const showStatesUpdatedNotification = () => {
    const count = selectedItem ? 1 : isSelectedItemsOnAllPages ? items?.total : selectedItemsLength;
    dispatch(
      showSystemNotification({
        message: formatMessage(workflowStateManagementMessages.statesUpdatedMessage, { count })
      })
    );
  };

  const onSetItemStateDialogConfirm = (update: StatesToUpdate) => {
    if (selectedItem) {
      setItemStates(siteId, [selectedItem.path], update).subscribe(() => {
        fetchStates();
        showStatesUpdatedNotification();
      });
    } else if (isSelectedItemsOnAllPages) {
      let stateBitmap = getStateBitmap(filtersLookup as ItemStateMap);
      setItemStatesByQuery(siteId, stateBitmap ? stateBitmap : null, update, debouncePathRegex).subscribe(() => {
        fetchStates();
        showStatesUpdatedNotification();
      });
    } else {
      setItemStates(
        siteId,
        Object.values(selectedItems)
          .filter(Boolean)
          .map((item) => item.path),
        update
      ).subscribe(() => {
        fetchStates();
        showStatesUpdatedNotification();
      });
    }

    setOpenSetStateDialog(false);
  };

  const onSetItemStateDialogClose = () => {
    setSelectedItem(null);
    setOpenSetStateDialog(false);
  };

  return (
    <section ref={rootRef} className={classes.root}>
      <GlobalAppToolbar
        title={!embedded && <FormattedMessage id="workflowStates.title" defaultMessage="Workflow States" />}
        rightContent={
          <SecondaryButton
            className={embedded ? '' : classes.filterButton}
            endIcon={<FilterListRoundedIcon />}
            onClick={() => setOpenFiltersDrawer(!openFiltersDrawer)}
          >
            <FormattedMessage id="words.filters" defaultMessage="Filters" />
          </SecondaryButton>
        }
        showHamburgerMenuButton={!embedded}
        showAppsButton={showAppsButton}
      />

      <Box
        display="flex"
        flexDirection="column"
        flexGrow={1}
        paddingRight={openFiltersDrawer ? `${drawerWidth}px` : 0}
        className={classes.wrapper}
        position="relative"
      >
        {(hasSelectedItems || isSelectedItemsOnAllPages) && (
          <ItemActionsSnackbar
            open={hasSelectedItems || isSelectedItemsOnAllPages}
            options={[
              {
                id: 'editStates',
                label: formatMessage(translations.editStates)
              },
              ...(isSelectedItemsOnAllPages
                ? []
                : [
                    {
                      id: 'selectAll',
                      label: formatMessage(translations.selectAll, { count: items.total })
                    }
                  ]),
              {
                id: 'clearSelected',
                label: formatMessage(translations.clearSelected, {
                  count: isSelectedItemsOnAllPages ? items.total : selectedItemsLength
                })
              }
            ]}
            onActionClicked={onOptionClicked}
          />
        )}

        {fetching && <ItemStatesGridSkeletonTable />}
        {error && <ApiResponseErrorState error={error} />}
        {items?.length === 0 && (
          <EmptyState
            title={<FormattedMessage id="itemStates.emptyStateMessage" defaultMessage="No results found" />}
          />
        )}
        {Boolean(items?.length) && (
          <ItemStatesGridUI
            itemStates={items}
            selectedItems={selectedItems}
            allItemsSelected={isSelectedItemsOnAllPages}
            hasThisPageItemsChecked={hasThisPageItemsChecked}
            isThisPageIndeterminate={isThisPageIndeterminate}
            onItemSelected={onItemSelected}
            onToggleSelectedItems={onToggleSelectAllItems}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            onRowSelected={onRowSelected}
          />
        )}
        <ResizeableDrawer
          open={openFiltersDrawer}
          width={drawerWidth}
          anchor="right"
          styles={{
            drawerBody: {
              overflowY: 'inherit'
            },
            drawerPaper: {
              overflow: 'inherit',
              position: 'absolute'
            }
          }}
          classes={{
            drawerPaper: classes.drawerPaper
          }}
        >
          <form
            noValidate
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <Button
              disabled={pathRegex === '' && !Object.values(filtersLookup).some(Boolean)}
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
              error={invalidPathRegex}
              slotProps={{
                formHelperText: { className: classes.helperText }
              }}
              helperText={
                invalidPathRegex ? (
                  <FormattedMessage
                    id="itemStates.invalidPathRegexHelperText"
                    defaultMessage="The regular expression is invalid"
                  />
                ) : (
                  <FormattedMessage id="itemStates.pathRegexHelperText" defaultMessage="Use a path-matching regex" />
                )
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
                      checked={!Object.values(filtersLookup).some(Boolean)}
                      name="any"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        onFilterChecked(event.target.name, !Object.values(filtersLookup).every(Boolean));
                      }}
                    />
                  }
                  label={<FormattedMessage id="itemStates.anyState" defaultMessage="Any state" />}
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
            defaultMessage='{count, plural, one {Set State for "{name}"} other {Set State for Items ({count})}}'
            values={{
              count: selectedItem ? 1 : isSelectedItemsOnAllPages ? items?.total : selectedItemsLength,
              name: selectedItem?.label ?? Object.values(selectedItems)[0]?.label
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

export default WorkflowStateManagement;
