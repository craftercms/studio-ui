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

import { makeStyles } from 'tss-react/mui';
import { InstallPluginDialogProps } from './utils';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import useSpreadState from '../../hooks/useSpreadState';
import useSubject from '../../hooks/useSubject';
import React, { useCallback, useEffect, useState } from 'react';
import { MarketplacePlugin, PagedArray } from '../../models';
import { useDispatch } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import LookupTable from '../../models/LookupTable';
import { fetchMarketplacePlugins, installMarketplacePlugin } from '../../services/marketplace';
import { debounceTime } from 'rxjs/operators';
import { blockUI, unblockUI } from '../../state/actions/system';
import { translations } from './translations';
import { batchActions } from '../../state/actions/misc';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import DialogHeader from '../DialogHeader';
import DialogBody from '../DialogBody/DialogBody';
import PluginDetailsView from '../PluginDetailsView';
import SearchBar from '../SearchBar/SearchBar';
import DialogFooter from '../DialogFooter/DialogFooter';
import Pagination from '../Pagination';
import PluginList from './PluginList';
import PluginParametersForm from '../PluginParametersForm/PluginParametersForm';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { UNDEFINED } from '../../utils/constants';
import LoadingState from '../LoadingState/LoadingState';
import { AjaxError } from 'rxjs/ajax';
import ApiResponseErrorState from '../ApiResponseErrorState/ApiResponseErrorState';
import ApiResponse from '../../models/ApiResponse';

const useStyles = makeStyles()(() => ({
  searchWrapper: {
    marginBottom: '16px'
  }
}));

export function InstallPluginDialogContainer(props: InstallPluginDialogProps) {
  const siteId = useActiveSiteId();
  const { installPermission = false, onInstall, installedPlugins = {} } = props;
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);
  const [plugins, setPlugins] = useState<PagedArray<MarketplacePlugin>>(null);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(null);
  const [error, setError] = useState<ApiResponse>(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(9);
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
  const { classes } = useStyles();
  const onSearch$ = useSubject<string>();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [installingLookup, setInstallingLookup] = useSpreadState<LookupTable<boolean>>({});

  const fetchPlugins = useCallback(() => {
    setError(null);
    setIsFetching(true);
    fetchMarketplacePlugins({ type: 'site', keywords: debouncedKeyword, limit, offset }).subscribe({
      next(plugins) {
        setPlugins(plugins);
        setIsFetching(false);
      },
      error(error: AjaxError) {
        setError(error.response.response);
        setIsFetching(false);
      }
    });
  }, [debouncedKeyword, limit, offset]);

  useEffect(() => {
    fetchPlugins();
  }, [fetchPlugins]);

  useEffect(() => {
    const subscription = onSearch$.pipe(debounceTime(400)).subscribe((keywords) => {
      setDebouncedKeyword(keywords);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [onSearch$]);

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
    dispatch(blockUI({ message: formatMessage(translations.installing, { name: plugin.name }) }));
    installMarketplacePlugin(siteId, plugin.id, plugin.version, parameters).subscribe({
      next() {
        setInstallingLookup({ [plugin.id]: false });
        onInstall(plugin);
        onPluginFormClose();
        dispatch(unblockUI());
      },
      error({ response }) {
        setInstallingLookup({ [plugin.id]: false });
        dispatch(batchActions([showErrorDialog({ error: response.response }), unblockUI()]));
      }
    });
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
      <DialogBody
        style={{ minHeight: '60vh', padding: selectedDetailsPlugin || formPluginState.plugin ? 0 : UNDEFINED }}
      >
        {isFetching ? (
          <LoadingState
            styles={{
              root: {
                flexGrow: 1,
                justifyContent: 'center'
              }
            }}
          />
        ) : selectedDetailsPlugin ? (
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
        ) : formPluginState.plugin ? (
          <PluginParametersForm
            plugin={formPluginState.plugin}
            submitted={formPluginState.submitted}
            fields={formPluginState.fields}
            onPluginFieldChange={onPluginFieldChange}
            onCancel={onPluginFormClose}
          />
        ) : (
          <>
            {showSearchBar && (
              <SearchBar
                showActionButton={Boolean(keyword)}
                keyword={keyword}
                onChange={onSearch}
                autoFocus
                classes={{ root: classes.searchWrapper }}
              />
            )}
            {error ? (
              <ApiResponseErrorState error={error} />
            ) : (
              plugins && (
                <PluginList
                  plugins={plugins}
                  installPermission={installPermission}
                  installedPlugins={installedPlugins}
                  installingLookup={installingLookup}
                  onPluginDetails={onPluginDetails}
                  onPluginSelected={onPluginDetailsSelected}
                />
              )
            )}
          </>
        )}
      </DialogBody>
      {!selectedDetailsPlugin && !error && !isFetching && (
        <DialogFooter>
          {formPluginState.plugin ? (
            <>
              <SecondaryButton onClick={onPluginFormClose} sx={{ mr: 1 }}>
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
          ) : (
            plugins && (
              <Pagination
                rowsPerPageOptions={[6, 9, 15]}
                mode="table"
                count={plugins.total}
                rowsPerPage={plugins.limit}
                page={plugins && Math.ceil(plugins.offset / plugins.limit)}
                onPageChange={(e, page: number) => onPageChange(page)}
                onRowsPerPageChange={onRowsPerPageChange}
              />
            )
          )}
        </DialogFooter>
      )}
    </>
  );
}

export default InstallPluginDialogContainer;
