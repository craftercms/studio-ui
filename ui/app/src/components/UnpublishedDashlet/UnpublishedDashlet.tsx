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

import { CommonDashletProps, useSpreadStateWithSelected, WithSelectedState } from '../SiteDashboard/utils';
import DashletTemplate from '../SiteDashboard/DashletTemplate';
import palette from '../../styles/palette';
import { FormattedMessage } from 'react-intl';
import React, { useEffect, useMemo } from 'react';
import IconButton from '@mui/material/IconButton';
import { RefreshRounded } from '@mui/icons-material';
import { useActiveSiteId, useLocale } from '../../hooks';
import { fetchUnpublished } from '../../services/dashboard';
import {
  DashletEmptyMessage,
  DenseCheckbox,
  getItemSkeleton,
  List,
  ListItem,
  ListItemIcon
} from '../SiteDashboard/dashletCommons';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { asLocalizedDateTime } from '../../utils/datetime';
import ItemDisplay from '../ItemDisplay';
import { SandboxItem } from '../../models';

interface UnpublishedDashletProps extends CommonDashletProps {}

interface UnpublishedDashletState extends WithSelectedState<SandboxItem> {
  total: number;
  loading: boolean;
}

export function UnpublishedDashlet(props: UnpublishedDashletProps) {
  const { borderLeftColor = palette.blue.tint } = props;
  const site = useActiveSiteId();
  const locale = useLocale();
  const [{ loading, total, items, isAllSelected }, setState, onSelectItem, onSelectAll, isSelected] =
    useSpreadStateWithSelected<UnpublishedDashletState>({
      loading: false,
      items: null,
      total: null,
      selected: {},
      isAllSelected: false
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
  useEffect(() => {
    onRefresh();
  }, [onRefresh]);
  return (
    <DashletTemplate
      {...props}
      borderLeftColor={borderLeftColor}
      title={<FormattedMessage id="unpublishedDashlet.widgetTitle" defaultMessage="Unpublished Work" />}
      headerAction={
        <IconButton onClick={onRefresh}>
          <RefreshRounded />
        </IconButton>
      }
      actionsBar={
        <>
          <DenseCheckbox disabled={loading} checked={isAllSelected} onChange={onSelectAll} />
        </>
      }
    >
      {loading && getItemSkeleton({ numOfItems: 3, showAvatar: true, showCheckbox: true })}
      {items && (
        <List>
          {items.map((item, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Checkbox edge="start" checked={isSelected(item)} onChange={(e) => onSelectItem(e, item)} />
              </ListItemIcon>
              <ListItemText
                primary={<ItemDisplay item={item} showPublishingTarget={false} />}
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
            </ListItem>
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
    </DashletTemplate>
  );
}

export default UnpublishedDashlet;
