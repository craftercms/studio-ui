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

import DashletCard, { DashletCardProps } from '../DashletCard/DashletCard';
import palette from '../../styles/palette';
import { FormattedMessage } from 'react-intl';
import React, { useEffect, useMemo, useState } from 'react';
import useSpreadState from '../../hooks/useSpreadState';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { fetchPublishingStats } from '../../services/dashboard';
import { PublishingStats } from '../../models';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export interface DevContentOpsDashletProps extends Omit<Partial<DashletCardProps>, 'contentHeight'> {}

interface DevContentOpsDashletState {
  stats: PublishingStats;
  loading: boolean;
}

export function DevContentOpsDashlet(props: DevContentOpsDashletProps) {
  const { borderLeftColor = palette.teal.main } = props;
  const site = useActiveSiteId();
  const [{ stats, loading }, setState] = useSpreadState<DevContentOpsDashletState>({
    stats: null,
    loading: false
  });
  const [days, setDays] = useState(30);
  const onRefresh = useMemo(
    () => () => {
      setState({ stats: null, loading: true });
      fetchPublishingStats(site, days).subscribe((stats) => {
        setState({ stats, loading: false });
      });
    },
    [site, setState, days]
  );
  useEffect(() => {
    onRefresh();
  }, [onRefresh]);
  return (
    <DashletCard {...props} sxs={{ content: { pt: 2 }, ...props.sxs }} borderLeftColor={borderLeftColor}>
      <>
        <Box display="flex" justifyContent="space-between">
          <FormattedMessage id="devContentOpsDashlet.widgetTitle" defaultMessage="DevContentOps" />
          <Select variant="standard" disableUnderline value={days} onChange={(e) => setDays(e.target.value as number)}>
            <MenuItem value={3}>3 days ago</MenuItem>
            <MenuItem value={7}>7 days ago</MenuItem>
            <MenuItem value={30}>1 month ago</MenuItem>
            <MenuItem value={90}>3 months ago</MenuItem>
            <MenuItem value={365}>1 year ago</MenuItem>
          </Select>
        </Box>
        {stats && (
          <Stack direction="row" spacing={2} mt={2}>
            <Box>
              <Typography
                component="span"
                children={stats.numberOfPublishes}
                lineHeight={1}
                sx={{ fontWeight: (theme) => theme.typography.fontWeightMedium }}
              />{' '}
              <Typography component="span" children="Publishes" />
            </Box>
            <Box>
              <Typography
                component="span"
                children={stats.numberOfNewAndPublishedItems}
                lineHeight={1}
                sx={{ fontWeight: (theme) => theme.typography.fontWeightMedium }}
              />{' '}
              <Typography component="span" children="Created & Published" />
            </Box>
            <Box>
              <Typography
                component="span"
                children={stats.numberOfEditedAndPublishedItems}
                lineHeight={1}
                sx={{ fontWeight: (theme) => theme.typography.fontWeightMedium }}
              />{' '}
              <Typography component="span" children="Edited & Published" />
            </Box>
          </Stack>
        )}
      </>
      {loading && (
        <>
          <Skeleton />
        </>
      )}
    </DashletCard>
  );
}

export default DevContentOpsDashlet;
