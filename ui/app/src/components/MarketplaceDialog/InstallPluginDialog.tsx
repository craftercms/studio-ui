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

import Dialog from '@mui/material/Dialog';
import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { MarketplacePlugin } from '../../models/MarketplacePlugin';
import DialogHeader from '../DialogHeader/DialogHeader';
import { FormattedMessage, useIntl } from 'react-intl';
import DialogBody from '../Dialogs/DialogBody';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { Resource } from '../../models/Resource';
import { fetchMarketplacePlugins, installMarketplacePlugin } from '../../services/marketplace';
import PluginCard from '../PluginCard';
import { PagedArray } from '../../models/PagedArray';
import Grid from '@mui/material/Grid';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import SearchIcon from '@mui/icons-material/SearchRounded';
import SearchBar from '../Controls/SearchBar';
import { debounceTime } from 'rxjs/operators';
import PluginDetailsView from '../PluginDetailsView';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import LookupTable from '../../models/LookupTable';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { useMount } from '../../utils/hooks/useMount';
import { useSubject } from '../../utils/hooks/useSubject';
import { useSpreadState } from '../../utils/hooks/useSpreadState';
import { translations } from './translations';
import { batchActions } from '../../state/actions/misc';
import { popTab, pushTab } from '../../state/reducers/dialogs/minimizedTabs';

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

interface InstallPluginDialogBaseProps {
  open: boolean;
  installedPlugins: LookupTable<boolean>;
  installPermission?: boolean;
}

export type InstallPluginDialogProps = PropsWithChildren<
  InstallPluginDialogBaseProps & {
    onInstall(plugin: MarketplacePlugin): void;
    onClose(): void;
    onClosed?(): void;
  }
>;

export default function InstallPluginDialog(props: InstallPluginDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="md">
      <InstallPluginDialogUI {...props} />
    </Dialog>
  );
}

function InstallPluginDialogUI(props: InstallPluginDialogProps) {
  const siteId = useActiveSiteId();
  const { installPermission = false, onInstall, installedPlugins = {} } = props;
  const [keyword, setKeyword] = useState('');
  const [plugins, setPlugins] = useState<PagedArray<MarketplacePlugin>>(null);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(null);
  const [selectedDetailsPlugin, setSelectedDetailsPlugin] = useState<MarketplacePlugin>(null);
  const classes = useStyles();
  const onSearch$ = useSubject<string>();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [installingLookup, setInstallingLookup] = useSpreadState<LookupTable<boolean>>({});

  useMount(() => {
    setIsFetching(true);
    fetchMarketplacePlugins({ type: 'site' }).subscribe((plugins) => {
      setIsFetching(false);
      setPlugins(plugins);
    });
  });

  useEffect(() => {
    const subscription = onSearch$.pipe(debounceTime(400)).subscribe((keywords) => {
      setIsFetching(true);
      fetchMarketplacePlugins({ type: 'site', keywords }).subscribe((plugins) => {
        // Moving setPlugins above of setIsFetching to avoid resolve the resource with the prev plugins
        setPlugins(plugins);
        setIsFetching(false);
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
      shouldRenew: (source, resource) => resource.complete,
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
    setInstallingLookup({ [plugin.id]: true });
    dispatch(
      pushTab({
        minimized: true,
        id: plugin.id,
        status: 'indeterminate',
        title: formatMessage(translations.installing, { name: plugin.name })
      })
    );
    installMarketplacePlugin(siteId, plugin.id, plugin.version).subscribe(
      () => {
        setInstallingLookup({ [plugin.id]: false });
        onInstall(plugin);
        dispatch(
          popTab({
            id: plugin.id
          })
        );
      },
      ({ response }) => {
        setInstallingLookup({ [plugin.id]: false });
        dispatch(
          batchActions([
            showErrorDialog({
              error: response.response
            }),
            popTab({
              id: plugin.id
            })
          ])
        );
      }
    );
  };

  return (
    <>
      <DialogHeader
        title={
          installPermission ? (
            <FormattedMessage id="InstallPluginDialog.title" defaultMessage="Search & install plugin" />
          ) : (
            <FormattedMessage id="words.search" defaultMessage="Search" />
          )
        }
        onCloseButtonClick={props.onClose}
        rightActions={[
          {
            icon: SearchIcon,
            disabled: isFetching === null || plugins === null || Boolean(selectedDetailsPlugin),
            onClick: onToggleSearchBar
          }
        ]}
      />
      {selectedDetailsPlugin ? (
        <DialogBody style={{ minHeight: '60vh', padding: 0 }}>
          <PluginDetailsView
            plugin={selectedDetailsPlugin}
            usePermission={installPermission}
            inUse={Boolean(installedPlugins[selectedDetailsPlugin.id])}
            useLabel={
              Boolean(installedPlugins[selectedDetailsPlugin.id]) ? (
                <FormattedMessage id="words.installed" defaultMessage="Installed" />
              ) : (
                <FormattedMessage id="words.install" defaultMessage="Install" />
              )
            }
            beingInstalled={installingLookup[selectedDetailsPlugin.id]}
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
                title: <FormattedMessage id="InstallPluginDialog.empty" defaultMessage="No plugins found." />,
                classes: { root: classes.loadingWrapper }
              }
            }}
            loadingStateProps={{ classes: { root: classes.loadingWrapper } }}
          >
            <PluginList
              resource={resource}
              installPermission={installPermission}
              installedPlugins={installedPlugins}
              installingLookup={installingLookup}
              onPluginDetails={onPluginDetails}
              onPluginSelected={onPluginDetailsSelected}
            />
          </SuspenseWithEmptyState>
        </DialogBody>
      )}
    </>
  );
}

interface PluginListProps {
  resource: Resource<MarketplacePlugin[]>;
  installPermission: boolean;
  installedPlugins: LookupTable<boolean>;
  installingLookup: LookupTable<boolean>;
  onPluginDetails(plugin: MarketplacePlugin): void;
  onPluginSelected(plugin: MarketplacePlugin): void;
}

function PluginList(props: PluginListProps) {
  const {
    resource,
    onPluginDetails,
    onPluginSelected,
    installedPlugins = {},
    installPermission,
    installingLookup = {}
  } = props;
  const plugins = resource.read();

  return (
    <Grid container spacing={3}>
      {plugins.map((plugin) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={plugin.id}>
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
      ))}
    </Grid>
  );
}
