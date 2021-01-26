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
import { useLogicResource, useMount, useSubject } from '../../utils/hooks';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { Resource } from '../../models/Resource';
import { fetchMarketplacePlugins } from '../../services/marketplace';
import PluginCard from '../PluginCard';
import { PagedArray } from '../../models/PagedArray';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/SearchRounded';
import SearchBar from '../Controls/SearchBar';
import { debounceTime } from 'rxjs/operators';
import PluginDetailsView from '../PluginDetailsView';

const useStyles = makeStyles((theme) =>
  createStyles({
    searchWrapper: {
      marginBottom: '16px'
    },
    loadingWrapper: {
      flexGrow: 1,
      justifyContent: 'center'
    }
  })
);

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
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="md">
      <MarketplaceDialogUI {...props} />
    </Dialog>
  );
}

function MarketplaceDialogUI(props: MarketplaceDialogProps) {
  const [keyword, setKeyword] = useState('');
  const [plugins, setPlugins] = useState<PagedArray<MarketplacePlugin>>(null);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(null);
  const [selectedDetailsPlugin, setSelectedDetailsPlugin] = useState<MarketplacePlugin>(null);
  const classes = useStyles();
  const onSearch$ = useSubject<string>();

  useMount(() => {
    setIsFetching(true);
    fetchMarketplacePlugins('blueprint').subscribe((plugins) => {
      setIsFetching(false);
      setPlugins(plugins);
    });
  });

  useEffect(() => {
    const subscription = onSearch$.pipe(debounceTime(400)).subscribe((keyword) => {
      setIsFetching(true);
      fetchMarketplacePlugins('blueprint', keyword).subscribe((plugins) => {
        setIsFetching(false);
        setPlugins(plugins);
      });
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [onSearch$]);

  const resource = useLogicResource<MarketplacePlugin[], { plugins: MarketplacePlugin[]; isFetching: boolean }>(
    useMemo(() => ({ plugins, isFetching }), [plugins, isFetching]),
    {
      shouldResolve: (source) => Boolean(source.plugins) && source.isFetching === false,
      shouldReject: (source) => false,
      shouldRenew: (source, resource) => source.isFetching === false && resource.complete,
      resultSelector: (source) => source.plugins,
      errorSelector: (source) => null
    }
  );

  const onToggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
  };

  const onSearch = (keyword) => {
    onSearch$.next(keyword);
    setKeyword(keyword);
  };

  const onPluginDetails = (plugin: MarketplacePlugin) => {
    setSelectedDetailsPlugin(plugin);
  };

  const onPluginDetailsClose = () => {
    setSelectedDetailsPlugin(null);
  };

  const onPluginDetailsSelected = (plugin: MarketplacePlugin) => {
    console.log(plugin);
  };

  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="MarketplaceDialog.title" defaultMessage="Search & install plugin" />}
        onDismiss={props.onClose}
        rightActions={[
          {
            icon: SearchIcon,
            disabled: isFetching === null || plugins === null,
            onClick: onToggleSearchBar
          }
        ]}
      />
      {selectedDetailsPlugin ? (
        <DialogBody style={{ minHeight: '60vh' }}>
          <PluginDetailsView
            plugin={selectedDetailsPlugin}
            onCloseDetails={onPluginDetailsClose}
            onBlueprintSelected={onPluginDetailsSelected}
          />
        </DialogBody>
      ) : (
        <DialogBody style={{ minHeight: '60vh' }}>
          {showSearchBar && (
            <SearchBar
              showActionButton={Boolean(keyword)}
              keyword={keyword}
              onChange={onSearch}
              autoFocus={true}
              classes={{ root: classes.searchWrapper }}
            />
          )}
          <SuspenseWithEmptyState
            resource={resource}
            withEmptyStateProps={{
              emptyStateProps: {
                title: <FormattedMessage id="MarketplaceDialog.empty" defaultMessage="No plugins found." />,
                classes: { root: classes.loadingWrapper }
              }
            }}
            loadingStateProps={{ classes: { root: classes.loadingWrapper } }}
          >
            <PluginList resource={resource} onPluginDetails={onPluginDetails} />
          </SuspenseWithEmptyState>
        </DialogBody>
      )}
    </>
  );
}

interface PluginListProps {
  resource: Resource<MarketplacePlugin[]>;
  onPluginDetails(plugin: MarketplacePlugin): void;
}

function PluginList(props: PluginListProps) {
  const { resource, onPluginDetails } = props;
  const plugins = resource.read();

  return (
    <Grid container spacing={3}>
      {plugins.map((plugin) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={plugin.id}>
          <PluginCard plugin={plugin} onDetails={onPluginDetails} onPluginSelected={() => {}} />
        </Grid>
      ))}
    </Grid>
  );
}
