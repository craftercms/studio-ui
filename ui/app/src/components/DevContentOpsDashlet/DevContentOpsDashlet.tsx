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
import React, { useEffect, useMemo } from 'react';
import useSpreadState from '../../hooks/useSpreadState';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { fetchPublishingStats } from '../../services/dashboard';
import { PublishingStats } from '../../models';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

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
  const onRefresh = useMemo(
    () => () => {
      setState({ stats: null, loading: true });
      fetchPublishingStats(site, 30).subscribe((stats) => {
        setState({ stats, loading: false });
      });
    },
    [site, setState]
  );
  useEffect(() => {
    onRefresh();
  }, [onRefresh]);
  return (
    <DashletCard {...props} sxs={{ content: { pt: 2 }, ...props.sxs }} borderLeftColor={borderLeftColor}>
      {loading && (
        <>
          <Skeleton />
          <Skeleton />
        </>
      )}
      {stats && (
        <>
          <FormattedMessage id="devContentOpsDashlet.widgetTitle" defaultMessage="DevContentOps" />
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
        </>
      )}
    </DashletCard>
  );
}

export default DevContentOpsDashlet;
