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

import { PluginListProps } from './utils';
import Grid from '@mui/material/Grid2';
import PluginCard from '../PluginCard';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import EmptyState from '../EmptyState/EmptyState';

export function PluginList(props: PluginListProps) {
  const {
    plugins,
    onPluginDetails,
    onPluginSelected,
    installedPlugins = {},
    installPermission,
    installingLookup = {}
  } = props;

  return (
    <Grid container spacing={3}>
      {plugins.length === 0 ? (
        <EmptyState
          styles={{
            root: {
              flexGrow: 1,
              justifyContent: 'center'
            }
          }}
          title={<FormattedMessage id="InstallPluginDialog.empty" defaultMessage="No plugins found." />}
        />
      ) : (
        plugins.map((plugin) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={plugin.id}>
            <PluginCard
              plugin={plugin}
              inUse={Boolean(installedPlugins[plugin.id])}
              usePermission={installPermission}
              disableCardActionClick
              useLabel={
                Boolean(installedPlugins[plugin.id]) ? (
                  <FormattedMessage id="words.installed" defaultMessage="Installed" />
                ) : (
                  <FormattedMessage id="words.install" defaultMessage="Install" />
                )
              }
              beingInstalled={installingLookup[plugin.id]}
              onDetails={onPluginDetails}
              onPluginSelected={onPluginSelected}
            />
          </Grid>
        ))
      )}
    </Grid>
  );
}

export default PluginList;
