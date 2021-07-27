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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import LookupTable from '../../models/LookupTable';
import { fetchItemsByPath } from '../../services/content';
import ItemActionsSnackbar from '../ItemActionsSnackbar';
import { ListItem, ListItemSecondaryAction, ListItemText } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { generateMultipleItemOptions, generateSingleItemOptions, itemActionDispatcher } from '../../utils/itemActions';
import { FormattedMessage, useIntl } from 'react-intl';
import translations from './translations';
import { createLookupTable } from '../../utils/object';
import { AllItemActions, DetailedItem } from '../../models/Item';
import useStyles from './styles';
import { completeDetailedItem } from '../../state/actions/content';
import { showItemMegaMenu } from '../../state/actions/dialogs';
import { getNumOfMenuOptionsForItem, getSystemTypeFromPath } from '../../utils/content';
import { useDispatch } from 'react-redux';
import { itemsApproved, itemsDeleted, itemsRejected, itemsScheduled } from '../../state/actions/system';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
import { filter } from 'rxjs/operators';
import { createPresenceTable } from '../../utils/array';
import { renderWidgets } from '../Widget';
import EmptyState from '../SystemStatus/EmptyState';
import { useSelection } from '../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useEnv } from '../../utils/hooks/useEnv';
import { useActiveUser } from '../../utils/hooks/useActiveUser';
import { useSpreadState } from '../../utils/hooks/useSpreadState';
import { useSiteUIConfig } from '../../utils/hooks/useSiteUIConfig';
import { initDashboardConfig } from '../../state/actions/dashboard';
import { useDashboardState } from '../../utils/hooks/useDashboardState';

interface DashboardAppProps {}

const actionsToBeShown: AllItemActions[] = [
  'edit',
  'delete',
  'publish',
  'rejectPublish',
  'duplicate',
  'duplicateAsset',
  'dependencies',
  'history'
];

export default function Dashboard(props: DashboardAppProps) {
  const site = useActiveSiteId();
  const user = useActiveUser();
  const userRoles = user.rolesBySite[site];
  const [selectedLookup, setSelectedLookup] = useState<LookupTable<boolean>>({});
  const [itemsByPath, setItemsByPath] = useSpreadState({});
  const selectedLength = useMemo(() => Object.values(selectedLookup).filter(Boolean).length, [selectedLookup]);
  const loadedRef = useRef([]);
  const { formatMessage } = useIntl();
  const classes = useStyles();
  const dispatch = useDispatch();
  const { authoringBase } = useEnv();
  const clipboard = useSelection((state) => state.content.clipboard);
  const uiConfig = useSiteUIConfig();
  const dashboard = useDashboardState();

  const selectionOptions = useMemo(() => {
    const selected = Object.keys(selectedLookup).filter((path) => selectedLookup[path]);
    if (selected.length === 0) {
      return null;
    } else if (selected.length) {
      if (selected.length === 1) {
        const path = selected[0];
        const item = itemsByPath[path];
        return generateSingleItemOptions(item, formatMessage, { includeOnly: actionsToBeShown }).flat();
      } else {
        let items = [];
        selected.forEach((itemPath) => {
          const item = itemsByPath[itemPath];
          if (item) {
            items.push(item);
          }
        });
        return generateMultipleItemOptions(items, formatMessage).filter((option) =>
          actionsToBeShown.includes(option.id as AllItemActions)
        );
      }
    }
  }, [formatMessage, itemsByPath, selectedLookup]);

  const fetchItems = (paths) => {
    const filteredPaths = paths.filter((path) => !loadedRef.current.includes(path));
    if (filteredPaths.length) {
      fetchItemsByPath(site, filteredPaths, { preferContent: false }).subscribe((items) => {
        setItemsByPath(createLookupTable(items, 'path'));
        items.forEach((item) => {
          loadedRef.current.push(item.path);
        });
      });
    }
  };

  const onItemChecked = (paths: string[], forceChecked?: boolean) => {
    const lookup = {};
    paths.forEach((path) => {
      lookup[path] = forceChecked ?? !selectedLookup[path];
    });
    fetchItems(paths);
    setSelectedLookup({ ...selectedLookup, ...lookup });
  };

  const onActionClicked = (option: AllItemActions, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const selected = Object.keys(selectedLookup).filter((path) => selectedLookup[path]);
    if (selected.length > 1) {
      const detailedItems = [];
      selected.forEach((path) => {
        itemsByPath[path] && detailedItems.push(itemsByPath[path]);
      });
      itemActionDispatcher({
        site,
        item: detailedItems,
        option,
        authoringBase,
        dispatch,
        formatMessage,
        clipboard,
        event
      });
    } else {
      const path = selected[0];
      const item = itemsByPath[path];
      itemActionDispatcher({
        site,
        item,
        option,
        authoringBase,
        dispatch,
        formatMessage,
        clipboard,
        event
      });
    }
  };

  const handleClearSelected = () => {
    setSelectedLookup({});
  };

  const onItemMenuClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, item: DetailedItem) => {
    const path = item.path;
    dispatch(completeDetailedItem({ path }));
    dispatch(
      showItemMegaMenu({
        path,
        anchorReference: 'anchorPosition',
        anchorPosition: { top: event.clientY, left: event.clientX },
        numOfLoaderItems: getNumOfMenuOptionsForItem({
          path: item.path,
          systemType: getSystemTypeFromPath(item.path)
        } as DetailedItem)
      })
    );
  };

  useEffect(() => {
    if (uiConfig.xml && !dashboard) {
      dispatch(initDashboardConfig({ configXml: uiConfig.xml, references: uiConfig.references }));
    }
  }, [uiConfig.xml, uiConfig.references, dashboard, dispatch]);

  // region Item Updates Propagation
  useEffect(() => {
    const events = [itemsDeleted.type, itemsRejected.type, itemsApproved.type, itemsScheduled.type];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => events.includes(e.type))).subscribe(({ type, payload }) => {
      switch (type) {
        case itemsApproved.type:
        case itemsScheduled.type:
        case itemsDeleted.type:
        case itemsRejected.type: {
          if (payload.targets.some((path) => selectedLookup[path])) {
            setSelectedLookup({ ...selectedLookup, ...createPresenceTable(payload.targets, false) });
          }
          break;
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [selectedLookup]);
  // endregion

  return (
    <section className={classes.root}>
      {dashboard &&
        renderWidgets(dashboard.widgets, userRoles, {
          selectedLookup,
          onItemChecked,
          onItemMenuClick
        })}
      {!Boolean(dashboard?.widgets?.length) && (
        <>
          <EmptyState
            title={<FormattedMessage id="dashboard.emptyStateMessageTitle" defaultMessage="No widgets to display" />}
            subtitle={
              <FormattedMessage
                id="dashboard.emptyStateMessageSubtitle"
                defaultMessage="Add widgets at your site's User Interface Configuration"
              />
            }
          />
        </>
      )}
      <ItemActionsSnackbar
        open={selectedLength > 0}
        options={selectionOptions}
        onActionClicked={onActionClicked}
        append={
          <ListItem>
            <ListItemText
              style={{ textAlign: 'center', minWidth: '65px' }}
              primaryTypographyProps={{ variant: 'caption' }}
              primary={formatMessage(translations.selectionCount, { count: selectedLength })}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" size="small" onClick={handleClearSelected}>
                <HighlightOffIcon color="primary" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        }
      />
    </section>
  );
}
