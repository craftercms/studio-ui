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

import React, { useEffect } from 'react';
import { CommonDashletProps, getItemViewOption, isPage, previewPage } from '../SiteDashboard/utils';
import DashletCard from '../DashletCard/DashletCard';
import { DashletEmptyMessage, getItemSkeleton, List, ListItem, ListSubheader } from '../DashletCard/dashletCommons';
import palette from '../../styles/palette';
import { FormattedMessage, useIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { ExpiredItem, fetchExpired, fetchExpiring } from '../../services/dashboard';
import useSpreadState from '../../hooks/useSpreadState';
import useLocale from '../../hooks/useLocale';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { RefreshRounded } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { asLocalizedDateTime } from '../../utils/datetime';
import Divider from '@mui/material/Divider';
import GlobalState from '../../models/GlobalState';
import { forkJoin } from 'rxjs';
import ItemDisplay from '../ItemDisplay';
import { itemActionDispatcher } from '../../utils/itemActions';
import useEnv from '../../hooks/useEnv';
import { useDispatch } from 'react-redux';
import { SandboxItem } from '../../models';

interface ExpiringDashletProps extends CommonDashletProps {
  days?: number;
}

interface ExpiringDashletState {
  loading: boolean;
  expired: ExpiredItem[];
  expiring: ExpiredItem[];
  refresh: number;
}

const renderExpiredItems = (
  items: ExpiredItem[],
  locale: GlobalState['uiConfig']['locale'],
  onItemClick: (e: React.MouseEvent, item: SandboxItem) => void,
  expired?: boolean
) =>
  items.map((item, index) => {
    const isItemPreviewable = isPage(item.sandboxItem.systemType) || item.sandboxItem.availableActionsMap.view;
    return (
      <ListItem key={index}>
        <ListItemText
          primary={
            <ItemDisplay
              item={item.sandboxItem}
              onClick={(e) => (isItemPreviewable ? onItemClick(e, item.sandboxItem) : null)}
              showNavigableAsLinks={isItemPreviewable}
              styles={{ ...(isItemPreviewable && { root: { cursor: 'pointer' } }) }}
            />
          }
          secondary={
            <Typography color={expired ? 'error.main' : 'text.secondary'} variant="body2">
              <FormattedMessage
                id="expiringDashlet.expiredOn"
                defaultMessage="{expirationText} on {date}"
                values={{
                  date: asLocalizedDateTime(item.expiredDateTime, locale.localeCode, locale.dateTimeFormatOptions),
                  expirationText: expired ? 'Expired' : 'Expires'
                }}
              />
            </Typography>
          }
        />
      </ListItem>
    );
  });

export function ExpiringDashlet(props: ExpiringDashletProps) {
  const { borderLeftColor = palette.purple.tint, days = 30, onMinimize } = props;
  const site = useActiveSiteId();
  const locale = useLocale();
  const [state, setState] = useSpreadState<ExpiringDashletState>({
    expiring: null,
    expired: null,
    refresh: 0,
    loading: false
  });
  const { formatMessage } = useIntl();
  const { authoringBase } = useEnv();
  const dispatch = useDispatch();
  const onRefresh = () => setState({ refresh: ++state.refresh });

  const onItemClick = (e, item) => {
    if (isPage(item.systemType)) {
      e.stopPropagation();
      previewPage(site, authoringBase, item, dispatch, onMinimize);
    } else if (item.availableActionsMap.view) {
      e.stopPropagation();

      itemActionDispatcher({
        site,
        authoringBase,
        dispatch,
        formatMessage,
        option: getItemViewOption(item),
        item
      });
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const foo = state.refresh + 1;
    const oneDay = 8.64e7;
    const now = new Date();
    setState({ loading: true, expiring: null, expired: null });
    forkJoin({
      expiring: fetchExpiring(site, {
        dateFrom: now.toISOString(),
        dateTo: new Date(now.getTime() + oneDay * days).toISOString()
      }),
      expired: fetchExpired(site, { limit: 10 })
    }).subscribe(({ expiring, expired }) => {
      setState({ expiring, expired, loading: false });
    });
  }, [setState, site, days, state.refresh]);
  return (
    <DashletCard
      {...props}
      borderLeftColor={borderLeftColor}
      title={<FormattedMessage id="words.expiring" defaultMessage="Expiring" />}
      headerAction={
        <IconButton onClick={onRefresh}>
          <RefreshRounded />
        </IconButton>
      }
    >
      {state.loading && <List>{getItemSkeleton({ numOfItems: 5, showAvatar: false, showCheckbox: false })}</List>}
      {state.expired &&
        (state.expired.length === 0 ? (
          <DashletEmptyMessage>
            <FormattedMessage
              id="expiringDashlet.noExpiredItems"
              defaultMessage="There are no expired items to display at this time"
            />
          </DashletEmptyMessage>
        ) : (
          <List
            subheader={
              <ListSubheader>
                <FormattedMessage id="words.expired" defaultMessage="Expired" />
              </ListSubheader>
            }
          >
            {renderExpiredItems(state.expired, locale, onItemClick, true)}
          </List>
        ))}
      <Divider sx={{ mt: 1, mb: 1 }} />
      {state.expiring &&
        (state.expiring.length === 0 ? (
          <DashletEmptyMessage sx={{ mt: 0 }}>
            <FormattedMessage
              id="expiringDashlet.noExpiringItems"
              defaultMessage="There are no items expiring in the next {days} days"
              values={{ days }}
            />
          </DashletEmptyMessage>
        ) : (
          <List
            subheader={
              <ListSubheader>
                <FormattedMessage
                  id="expiringDashlet.expiringNextNDays"
                  defaultMessage="Expiring (next {days} days)"
                  values={{ days }}
                />
              </ListSubheader>
            }
          >
            {renderExpiredItems(state.expiring, locale, onItemClick)}
          </List>
        ))}
    </DashletCard>
  );
}

export default ExpiringDashlet;
