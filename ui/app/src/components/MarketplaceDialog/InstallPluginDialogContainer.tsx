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

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import { InstallPluginDialogProps } from './utils';
import { useActiveSiteId, useLogicResource, useSpreadState, useSubject } from '../../hooks';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MarketplacePlugin, PagedArray } from '../../models';
import { useDispatch } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import LookupTable from '../../models/LookupTable';
import { fetchMarketplacePlugins, installMarketplacePlugin } from '../../services/marketplace';
import { debounceTime } from 'rxjs/operators';
import { popTab, pushTab } from '../../state/reducers/dialogs/minimizedTabs';
import { translations } from './translations';
import { batchActions } from '../../state/actions/misc';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import DialogHeader from '../DialogHeader';
import SearchIcon from '@mui/icons-material/SearchRounded';
import DialogBody from '../DialogBody/DialogBody';
import PluginDetailsView from '../PluginDetailsView';
import SearchBar from '../SearchBar/SearchBar';
import { SuspenseWithEmptyState } from '../Suspencified';
import DialogFooter from '../DialogFooter/DialogFooter';
import Pagination from '../Pagination';
import { PluginList } from './PluginList';
import { PluginParametersForm } from '../PluginParametersForm';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';

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
export function InstallPluginDialogContainer(props: InstallPluginDialogProps) {
  const siteId = useActiveSiteId();
  const { installPermission = false, onInstall, installedPlugins = {} } = props;
  const [keyword, setKeyword] = useState('');
  const [debounceKeyword, setDebounceKeyword] = useState('');
  const [plugins, setPlugins] = useState<PagedArray<MarketplacePlugin>>(null);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [selectedDetailsPlugin, setSelectedDetailsPlugin] = useState<MarketplacePlugin>(null);
  const [formPluginState, setFormPluginState] = useSpreadState<{
    plugin: MarketplacePlugin;
    fields: LookupTable<string>;
    submitted: boolean;
    error: LookupTable<boolean>;
  }>({
    plugin: null,
    fields: {},
    submitted: false,
    error: {}
  });
  const classes = useStyles();
  const onSearch$ = useSubject<string>();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [installingLookup, setInstallingLookup] = useSpreadState<LookupTable<boolean>>({});

  const fetchPlugins = useCallback(() => {
    setIsFetching(true);
    fetchMarketplacePlugins({ type: 'site', keywords: debounceKeyword, limit, offset }).subscribe((plugins) => {
      setPlugins(plugins);
      setIsFetching(false);
    });
  }, [debounceKeyword, limit, offset]);

  useEffect(() => {
    fetchPlugins();
  }, [fetchPlugins]);

  useEffect(() => {
    const subscription = onSearch$.pipe(debounceTime(400)).subscribe((keywords) => {
      setDebounceKeyword(keywords);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [onSearch$]);

  const resource = useLogicResource<
    PagedArray<MarketplacePlugin>,
    { plugins: PagedArray<MarketplacePlugin>; isFetching: boolean }
  >(
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

  const onInstallPlugin = (plugin: MarketplacePlugin, parameters?: LookupTable<string>) => {
    setInstallingLookup({ [plugin.id]: true });
    dispatch(
      pushTab({
        minimized: true,
        id: plugin.id,
        status: 'indeterminate',
        title: formatMessage(translations.installing, { name: plugin.name })
      })
    );
    installMarketplacePlugin(siteId, plugin.id, plugin.version, parameters).subscribe(
      () => {
        setInstallingLookup({ [plugin.id]: false });
        onInstall(plugin);
        onPluginFormClose();
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

  const onPluginFieldChange = (key: string, value: string) => {
    const error =
      formPluginState.plugin.parameters.find((parameter) => parameter.name === key).required && value === '';
    setFormPluginState({
      fields: { ...formPluginState.fields, [key]: value },
      error: { ...formPluginState.error, [key]: error }
    });
  };

  const onPluginDetailsSelected = (plugin: MarketplacePlugin) => {
    if (plugin.parameters.length) {
      setFormPluginState({ plugin, submitted: false, fields: {} });
      onPluginDetailsClose();
    } else {
      onInstallPlugin(plugin);
    }
  };

  const onPluginFormClose = () => {
    setFormPluginState({ plugin: null, submitted: false, fields: {} });
  };

  const onPageChange = (page: number) => {
    setOffset(page * limit);
  };

  const onRowsPerPageChange = (e) => {
    setLimit(e.target.value);
  };

  useEffect(() => {
    if (formPluginState.plugin) {
      const lookup = {};
      formPluginState.plugin.parameters.forEach((parameter) => {
        if (parameter.required) {
          lookup[parameter.name] = true;
        }
      });
      setFormPluginState({ error: lookup });
    }
  }, [formPluginState.plugin, setFormPluginState]);

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
            icon: { id: '@mui/icons-material/SearchRounded' },
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
      ) : formPluginState.plugin ? (
        <DialogBody style={{ minHeight: '60vh', padding: 0 }}>
          <PluginParametersForm
            plugin={formPluginState.plugin}
            submitted={formPluginState.submitted}
            fields={formPluginState.fields}
            onPluginFieldChange={onPluginFieldChange}
            onCancel={onPluginFormClose}
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
      {!selectedDetailsPlugin && (
        <DialogFooter>
          {!formPluginState.plugin && plugins ? (
            <Pagination
              rowsPerPageOptions={[5, 10, 15]}
              sx={{
                root: {
                  marginLeft: 'auto',
                  marginRight: '20px',
                  minHeight: '40px'
                },
                selectRoot: {
                  background: 'red'
                }
              }}
              count={plugins.total}
              rowsPerPage={plugins.limit}
              page={plugins && Math.ceil(plugins.offset / plugins.limit)}
              onPageChange={(page: number) => onPageChange(page)}
              onRowsPerPageChange={onRowsPerPageChange}
            />
          ) : (
            <>
              <SecondaryButton
                onClick={onPluginFormClose}
                sx={{
                  mr: '8px'
                }}
              >
                <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
              </SecondaryButton>
              <PrimaryButton
                disabled={
                  Object.values(formPluginState.error).some((value) => value) ||
                  (formPluginState.plugin && installingLookup[formPluginState.plugin.id])
                }
                onClick={() => onInstallPlugin(formPluginState.plugin, formPluginState.fields)}
              >
                <FormattedMessage id="words.install" defaultMessage="Install" />
              </PrimaryButton>
            </>
          )}
        </DialogFooter>
      )}
    </>
  );
}

export default InstallPluginDialogContainer;
