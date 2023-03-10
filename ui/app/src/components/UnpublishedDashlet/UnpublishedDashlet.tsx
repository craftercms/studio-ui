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

import {
  CommonDashletProps,
  isPage,
  previewPage,
  useSpreadStateWithSelected,
  WithSelectedState
} from '../SiteDashboard/utils';
import DashletCard from '../DashletCard/DashletCard';
import palette from '../../styles/palette';
import { FormattedMessage, useIntl } from 'react-intl';
import React, { useEffect, useMemo } from 'react';
import IconButton from '@mui/material/IconButton';
import { RefreshRounded } from '@mui/icons-material';
import useLocale from '../../hooks/useLocale';
import useEnv from '../../hooks/useEnv';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { fetchUnpublished } from '../../services/dashboard';
import { DashletEmptyMessage, getItemSkeleton, List, ListItemIcon } from '../DashletCard/dashletCommons';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { asLocalizedDateTime } from '../../utils/datetime';
import ItemDisplay from '../ItemDisplay';
import { SandboxItem } from '../../models';
import ActionsBar from '../ActionsBar';
import { UNDEFINED } from '../../utils/constants';
import { translations } from '../ItemActionsMenu/translations';
import { itemActionDispatcher } from '../../utils/itemActions';
import { useDispatch } from 'react-redux';
import { parseSandBoxItemToDetailedItem } from '../../utils/content';
import ListItemButton from '@mui/material/ListItemButton';
import { useWidgetDialogContext } from '../WidgetDialog';
import { createLookupTable } from '../../utils/object';

interface UnpublishedDashletProps extends CommonDashletProps {}

interface UnpublishedDashletState extends WithSelectedState<SandboxItem> {
  total: number;
  loading: boolean;
}

export function UnpublishedDashlet(props: UnpublishedDashletProps) {
  const { borderLeftColor = palette.blue.tint } = props;
  const site = useActiveSiteId();
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const { authoringBase } = useEnv();
  const dispatch = useDispatch();
  const widgetDialogContext = useWidgetDialogContext();
  const [
    { loading, total, items, isAllSelected, hasSelected, selected, selectedCount },
    setState,
    onSelectItem,
    onSelectAll,
    isSelected
  ] = useSpreadStateWithSelected<UnpublishedDashletState>({
    loading: false,
    total: null
  });
  const onRefresh = useMemo(
    () => () => {
      setState({ loading: true, items: null, selected: {}, isAllSelected: false });
      fetchUnpublished(site, { limit: 10, offset: 0 }).subscribe((items) => {
        setState({ loading: false, items, total: items.total });
      });
    },
    [setState, site]
  );
  const itemsLookup = items ? createLookupTable(items) : {};
  const selectedItems = Object.entries(selected)
    .filter(([, value]) => value)
    .map(([prop]) => {
      return itemsLookup[prop];
    });
  const onOptionClicked = (option) => {
    const clickedItems = items.filter((item) => selected[item.id]).map((item) => parseSandBoxItemToDetailedItem(item));
    return itemActionDispatcher({
      site,
      authoringBase,
      dispatch,
      formatMessage,
      option,
      item: clickedItems.length > 1 ? clickedItems : clickedItems[0]
    });
  };

  const onItemClick = (e, item) => {
    e.stopPropagation();
    previewPage(site, authoringBase, item, dispatch, () => widgetDialogContext?.onClose(e, null));
  };

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);
  return (
    <DashletCard
      {...props}
      borderLeftColor={borderLeftColor}
      title={<FormattedMessage id="unpublishedDashlet.widgetTitle" defaultMessage="Unpublished Work" />}
      headerAction={
        <IconButton onClick={onRefresh}>
          <RefreshRounded />
        </IconButton>
      }
      sxs={{ actionsBar: { padding: 0 }, content: { pl: 0, pr: 0 } }}
      actionsBar={
        <ActionsBar
          disabled={loading}
          isChecked={isAllSelected}
          isIndeterminate={hasSelected && !isAllSelected}
          onCheckboxChange={onSelectAll}
          onOptionClicked={onOptionClicked}
          options={
            hasSelected
              ? [
                  selectedCount === 1 &&
                    selectedItems[0].availableActionsMap.edit && {
                      id: 'edit',
                      label: formatMessage(translations.edit)
                    },
                  { id: 'approvePublish', label: formatMessage(translations.publish) }
                ].filter(Boolean)
              : []
          }
          buttonProps={{ size: 'small' }}
          sxs={{
            root: { flexGrow: 1 },
            container: { bgcolor: hasSelected ? 'action.selected' : UNDEFINED },
            checkbox: { padding: '5px', borderRadius: 0 }
          }}
        />
      }
    >
      {loading && getItemSkeleton({ numOfItems: 3, showAvatar: false, showCheckbox: true })}
      {items && (
        <List>
          {items.map((item, index) => (
            <ListItemButton key={index} onClick={(e) => onSelectItem(e, item)} sx={{ pt: 0, pb: 0 }}>
              <ListItemIcon>
                <Checkbox edge="start" checked={isSelected(item)} onChange={(e) => onSelectItem(e, item)} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <ItemDisplay
                    item={item}
                    showPublishingTarget={false}
                    onClick={(e) => (isPage(item.systemType) ? onItemClick(e, item) : null)}
                    showNavigableAsLinks={isPage(item.systemType)}
                  />
                }
                secondary={
                  <Typography color="text.secondary" variant="body2">
                    <FormattedMessage
                      id="unpublishedDashlet.entrySecondaryText"
                      defaultMessage="Edited by {name} on {date}"
                      values={{
                        name: item.modifier,
                        date: asLocalizedDateTime(item.dateModified, locale.localeCode, locale.dateTimeFormatOptions)
                      }}
                    />
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </List>
      )}
      {/* TODO: remove or statement once backend is fixed (total doesn't match) */}
      {(total === 0 || (total && items?.length === 0)) && (
        <DashletEmptyMessage>
          <FormattedMessage
            id="unpublishedDashlet.noUnpublishedItems"
            defaultMessage="There are no unpublished items"
          />
        </DashletEmptyMessage>
      )}
    </DashletCard>
  );
}

export default UnpublishedDashlet;
