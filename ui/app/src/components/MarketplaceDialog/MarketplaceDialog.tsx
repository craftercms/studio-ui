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

import Dialog from '@material-ui/core/Dialog';
import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { MarketplacePlugin } from '../../models/MarketplacePlugin';
import DialogHeader from '../Dialogs/DialogHeader';
import { FormattedMessage } from 'react-intl';
import DialogBody from '../Dialogs/DialogBody';
import { useLogicResource, useMount } from '../../utils/hooks';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { Resource } from '../../models/Resource';
import { fetchMarketplacePlugins } from '../../services/marketplace';
import PluginCard from '../PluginCard';
import { PagedArray } from '../../models/PagedArray';
import Grid from '@material-ui/core/Grid';

interface MarketplaceDialogBaseProps {
  open: boolean;
}

export type MarketplaceDialogProps = PropsWithChildren<
  MarketplaceDialogBaseProps & {
    onInstall(plugin: MarketplacePlugin): void;
    onClose(): void;
    onClosed?(): void;
  }
>;

export default function MarketplaceDialog(props: MarketplaceDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} maxWidth="md">
      <MarketplaceDialogUI {...props} />
    </Dialog>
  );
}

function MarketplaceDialogUI(props: MarketplaceDialogProps) {
  const [keyword, setKeyword] = useState('');
  const [plugins, setPlugins] = useState<PagedArray<MarketplacePlugin>>(null);
  const [isFetching, setIsFetching] = useState<boolean>(null);

  useMount(() => {
    setIsFetching(true);
    fetchMarketplacePlugins('blueprint').subscribe((plugins) => {
      setIsFetching(false);
      setPlugins(plugins);
    });
  });

  useEffect(() => {}, []);

  const resource = useLogicResource<MarketplacePlugin[], { plugins: MarketplacePlugin[]; isFetching: boolean }>(
    useMemo(() => ({ plugins, isFetching }), [plugins, isFetching]),
    {
      shouldResolve: (source) => Boolean(source.plugins) && source.isFetching === false,
      shouldReject: (source) => false,
      shouldRenew: (source, resource) => source.isFetching && resource.complete,
      resultSelector: (source) => source.plugins,
      errorSelector: (source) => null
    }
  );

  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="MarketplaceDialog.title" defaultMessage="Search & install plugin" />}
        onDismiss={props.onClose}
      />
      <DialogBody style={{ minHeight: '60vh' }}>
        <SuspenseWithEmptyState resource={resource}>
          <PluginList resource={resource} />
        </SuspenseWithEmptyState>
      </DialogBody>
    </>
  );
}

interface PluginListProps {
  resource: Resource<MarketplacePlugin[]>;
}

function PluginList(props: PluginListProps) {
  const plugins = props.resource.read();

  return (
    <Grid container spacing={3}>
      {plugins.map((plugin) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={plugin.id}>
          <PluginCard plugin={plugin} onDetails={() => {}} onPluginSelected={() => {}} />
        </Grid>
      ))}
    </Grid>
  );
}
