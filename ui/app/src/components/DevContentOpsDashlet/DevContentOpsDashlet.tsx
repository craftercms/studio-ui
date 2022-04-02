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

import DashletTemplate from '../SiteDashboard/DashletTemplate';
import { CommonDashletProps } from '../SiteDashboard/utils';
import palette from '../../styles/palette';
import { FormattedMessage } from 'react-intl';
import React, { useEffect, useMemo } from 'react';
import { useActiveSiteId, useSpreadState } from '../../hooks';
import IconButton from '@mui/material/IconButton';
import { RefreshRounded } from '@mui/icons-material';
import { fetchPublishingStats } from '../../services/dashboard';
import { PublishingStats } from '../../models';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface DevContentOpsDashletProps extends CommonDashletProps {}

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
    <DashletTemplate
      {...props}
      sx={{ content: { pt: 2 } }}
      borderLeftColor={borderLeftColor}
      title={<FormattedMessage id="devContentOpsDashlet.widgetTitle" defaultMessage="DevContentOps" />}
      headerAction={
        <IconButton onClick={onRefresh}>
          <RefreshRounded />
        </IconButton>
      }
    >
      {loading && (
        <>
          <Skeleton />
          <Skeleton />
        </>
      )}
      {stats && (
        <Stack direction="column" spacing={2}>
          <Box>
            <Typography variant="h2" component="span" children={stats.numberOfPublishes} lineHeight={1} />
            <Typography component="span" children="Publishes" />
          </Box>
          <Box>
            <Typography variant="h2" component="span" children={stats.numberOfNewAndPublishedItems} lineHeight={1} />
            <Typography component="span" children="Created & Published" />
          </Box>
          <Box>
            <Typography variant="h2" component="span" children={stats.numberOfEditedAndPublishedItems} lineHeight={1} />
            <Typography component="span" children="Edited & Published" />
          </Box>
        </Stack>
      )}
    </DashletTemplate>
  );
}

export default DevContentOpsDashlet;
