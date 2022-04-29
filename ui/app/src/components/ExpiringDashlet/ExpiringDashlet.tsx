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
import { CommonDashletProps } from '../SiteDashboard/utils';
import DashletCard from '../DashletCard/DashletCard';
import { DashletEmptyMessage, getItemSkeleton, List, ListItem, ListSubheader } from '../DashletCard/dashletCommons';
import palette from '../../styles/palette';
import { FormattedMessage } from 'react-intl';
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

interface ExpiringDashletProps extends CommonDashletProps {
  days?: number;
}

interface ExpiringDashletState {
  loading: boolean;
  expired: ExpiredItem[];
  expiring: ExpiredItem[];
  refresh: number;
}

const renderExpiredItems = (items: ExpiredItem[], locale: GlobalState['uiConfig']['locale']) =>
  items.map((item, index) => (
    <ListItem key={index}>
      <ListItemText
        primary={item.itemName}
        secondary={
          <Typography color="text.error" variant="body2">
            <FormattedMessage
              id="expiringDashlet.expiredOn"
              defaultMessage="Expiration on {date}"
              values={{
                date: asLocalizedDateTime(item.expireDateTime, locale.localeCode, locale.dateTimeFormatOptions)
              }}
            />
          </Typography>
        }
      />
    </ListItem>
  ));

export function ExpiringDashlet(props: ExpiringDashletProps) {
  const { borderLeftColor = palette.purple.tint, days = 30 } = props;
  const site = useActiveSiteId();
  const locale = useLocale();
  const [state, setState] = useSpreadState<ExpiringDashletState>({
    expiring: null,
    expired: null,
    refresh: 0,
    loading: false
  });
  const onRefresh = () => setState({ refresh: ++state.refresh });
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
            {renderExpiredItems(state.expired, locale)}
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
                <FormattedMessage id="words.expiring" defaultMessage="Expiring (next {days} days)" values={{ days }} />
              </ListSubheader>
            }
          >
            {renderExpiredItems(state.expiring, locale)}
          </List>
        ))}
    </DashletCard>
  );
}

export default ExpiringDashlet;
