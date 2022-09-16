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

import React, { ChangeEvent, MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import useSpreadState from '../../hooks/useSpreadState';
import useEnv from '../../hooks/useEnv';
import { CreateSiteMeta, MarketplacePlugin, MarketplaceSite, SiteState, Views } from '../../models';
import {
  createSite as createSiteFromMarketplace,
  fetchBlueprints as fetchMarketplaceBlueprintsService
} from '../../services/marketplace';
import { setRequestForgeryToken, setSiteCookie } from '../../utils/auth';
import { Subscription } from 'rxjs';
import { create, exists, fetchBlueprints as fetchBuiltInBlueprints } from '../../services/sites';
import gitLogo from '../../assets/git-logo.svg';
import { getSystemLink } from '../../utils/system';
import Grid from '@mui/material/Grid';
import PluginCard from '../PluginCard';
import ConfirmDialog from '../ConfirmDialog';
import LoadingState from '../LoadingState';
import ApiResponseErrorState from '../ApiResponseErrorState';
import PluginDetailsView from '../PluginDetailsView';
import DialogHeader from '../DialogHeader';
import DialogBody from '../DialogBody';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import SearchBar from '../SearchBar';
import Box from '@mui/material/Box';
import SignalWifiBadRounded from '@mui/icons-material/SignalWifiBadRounded';
import Button from '@mui/material/Button';
import EmptyState from '../EmptyState';
import BlueprintForm from './BlueprintForm';
import BlueprintReview from './BlueprintReview';
import Spinner from '../Spinner';
import DialogFooter from '../DialogFooter';
import PrimaryButton from '../PrimaryButton';
import { useStyles } from './styles';
import messages from './translations';

interface CreateSiteDialogContainerProps {
  site: SiteState;
  setSite(site): void;
  search: {
    searchKey: string;
    searchSelected: boolean;
  };
  setSearch(search): void;
  handleClose(event?, reason?): void;
  dialog: {
    open: boolean;
    inProgress: boolean;
  };
  setDialog(dialog): void;
  disableEnforceFocus: boolean;
}

export function CreateSiteDialogContainer(props: CreateSiteDialogContainerProps) {
  const { site, setSite, search, setSearch, handleClose, dialog, setDialog, disableEnforceFocus } = props;
  const { classes, cx } = useStyles();

  const [blueprints, setBlueprints] = useState(null);
  const [marketplace, setMarketplace] = useState(null);
  const [apiState, setApiState] = useSpreadState({
    creatingSite: false,
    error: false,
    global: false,
    errorResponse: null,
    fetchingMarketplace: false,
    marketplaceError: false
  });

  const finishRef = useRef(null);
  const { current: refts } = useRef<any>({});
  refts.setSite = setSite;
  const { formatMessage } = useIntl();
  const { authoringBase, useBaseDomain } = useEnv();

  const views: Views = {
    0: {
      title: formatMessage(messages.createSite)
    },
    1: {
      title: formatMessage(messages.createSite),
      subtitle: formatMessage(messages.nameAndDescription),
      btnText: formatMessage(messages.review)
    },
    2: {
      title: formatMessage(messages.finish),
      subtitle: formatMessage(messages.reviewSite),
      btnText: formatMessage(messages.createSite)
    }
  };

  function filterBlueprints(blueprints: MarketplacePlugin[], searchKey: string) {
    searchKey = searchKey.toLowerCase();
    return searchKey && blueprints
      ? blueprints.filter((blueprint) => blueprint.name.toLowerCase().includes(searchKey))
      : blueprints;
  }

  const filteredMarketplace: MarketplacePlugin[] = filterBlueprints(marketplace, search.searchKey);

  const fetchMarketplaceBlueprints = useCallback(() => {
    setApiState({ fetchingMarketplace: true });
    return fetchMarketplaceBlueprintsService({
      showIncompatible: site.showIncompatible
    }).subscribe({
      next: (plugins) => {
        setApiState({ marketplaceError: false, fetchingMarketplace: false });
        setMarketplace(plugins);
      },
      error: ({ response }) => {
        if (response) {
          setApiState({
            creatingSite: false,
            error: true,
            marketplaceError: response.response,
            fetchingMarketplace: false
          });
        }
      }
    });
  }, [setApiState, site?.showIncompatible]);

  setRequestForgeryToken();

  function handleCloseDetails() {
    setSite({ details: { blueprint: null, index: null } });
  }

  function handleErrorBack() {
    setApiState({ error: false, global: false });
  }

  function handleSearchClick() {
    setSearch({ ...search, searchSelected: !search.searchSelected, searchKey: '' });
  }

  function handleOnSearchChange(searchKey: string) {
    setSearch({ ...search, searchKey });
  }

  function handleBlueprintSelected(blueprint: MarketplacePlugin, view: number) {
    if (blueprint.id === 'GIT') {
      setSite({
        selectedView: view,
        submitted: false,
        blueprint: blueprint,
        pushSite: false,
        createAsOrphan: false,
        details: { blueprint: null, index: null }
      });
    } else if (blueprint.source === 'GIT') {
      setSite({
        selectedView: view,
        submitted: false,
        blueprint: blueprint,
        pushSite: false,
        createAsOrphan: true,
        details: { blueprint: null, index: null }
      });
    } else {
      setSite({
        selectedView: view,
        submitted: false,
        blueprint: blueprint,
        createAsOrphan: true,
        details: { blueprint: null, index: null }
      });
    }
  }

  function handleBack() {
    let back = site.selectedView - 1;
    setSite({ selectedView: back });
  }

  function handleGoTo(step: number) {
    setSite({ selectedView: step });
  }

  function handleFinish(e: MouseEvent) {
    e && e.preventDefault();
    if (site.selectedView === 1) {
      if (validateForm() && !site.siteIdExist) {
        setSite({ selectedView: 2 });
      } else {
        setSite({ submitted: true });
      }
    }
    if (site.selectedView === 2) {
      setApiState({ creatingSite: true });
      // it is a marketplace plugin
      if (site.blueprint.source === 'GIT') {
        const marketplaceParams: MarketplaceSite = createMarketplaceParams();
        createNewSiteFromMarketplace(marketplaceParams);
      } else {
        const blueprintParams = createParams();
        createSite(blueprintParams);
      }
    }
  }

  function handleShowIncompatibleChange(e: ChangeEvent<HTMLInputElement>) {
    setMarketplace(null);
    setSite({ showIncompatible: e.target.checked });
  }

  function checkAdditionalFields() {
    let valid = true;
    if (site.blueprint.parameters) {
      site.blueprint.parameters.forEach((parameter: any) => {
        if (parameter.required && !site.blueprintFields[parameter.name]) {
          valid = false;
        }
      });
    }
    return valid;
  }

  function validateForm() {
    if (!site.siteId || site.siteIdExist || !site.siteName || site.siteNameExist || site.invalidSiteId) {
      return false;
    } else if (!site.repoUrl && site.blueprint.id === 'GIT') {
      return false;
    } else if (site.pushSite || site.blueprint.id === 'GIT') {
      if (!site.repoUrl) return false;
      else if (site.repoAuthentication === 'basic' && (!site.repoUsername || !site.repoPassword)) return false;
      else if (site.repoAuthentication === 'token' && (!site.repoUsername || !site.repoToken)) return false;
      else return !(site.repoAuthentication === 'key' && !site.repoKey);
    } else {
      return checkAdditionalFields();
    }
  }

  function createMarketplaceParams() {
    const params: MarketplaceSite = {
      siteId: site.siteId,
      name: site.siteName,
      description: site.description,
      blueprintId: site.blueprint.id,
      blueprintVersion: {
        major: site.blueprint.version.major,
        minor: site.blueprint.version.minor,
        patch: site.blueprint.version.patch
      }
    };
    if (site.gitBranch) params.sandboxBranch = site.gitBranch as string;
    if (site.blueprintFields) params.siteParams = site.blueprintFields;
    return params;
  }

  function createParams() {
    if (site.blueprint) {
      const params: CreateSiteMeta = {
        siteId: site.siteId,
        singleBranch: false,
        createAsOrphan: site.createAsOrphan,
        siteName: site.siteName
      };
      if (site.blueprint.id !== 'GIT') {
        params.blueprint = site.blueprint.id;
      } else {
        params.useRemote = true;
      }
      if (site.gitBranch) params.sandboxBranch = site.gitBranch as string;
      if (site.description) params.description = site.description;
      if (site.pushSite || site.blueprint.id === 'GIT') {
        params.authenticationType = site.repoAuthentication;
        if (site.repoRemoteName) params.remoteName = site.repoRemoteName;
        if (site.repoUrl) params.remoteUrl = site.repoUrl;
        if (site.gitBranch) {
          params.remoteBranch = site.gitBranch as string;
        }
        if (site.repoAuthentication === 'basic') {
          params.remoteUsername = site.repoUsername;
          params.remotePassword = site.repoPassword;
        }
        if (site.repoAuthentication === 'token') {
          params.remoteUsername = site.repoUsername;
          params.remoteToken = site.repoToken;
        }
        if (site.repoAuthentication === 'key') params.remotePrivateKey = site.repoKey;
      }
      if (Object.keys(site.blueprintFields).length) params.siteParams = site.blueprintFields;
      params.createOption = site.pushSite ? 'push' : 'clone';
      return params;
    }
  }

  function createSite(site: CreateSiteMeta | MarketplaceSite, fromMarketplace = false) {
    const success = () => {
      setApiState({ creatingSite: false });
      handleClose();
      // Prop differs between regular site and marketplace site due to API versions 1 vs 2 differences
      setSiteCookie(site.siteId, useBaseDomain);
      window.location.href = getSystemLink({
        systemLinkId: 'preview',
        authoringBase,
        site: site.siteId,
        page: '/'
      });
    };
    const error = ({ response }) => {
      if (response) {
        if (fromMarketplace) {
          setApiState({
            creatingSite: false,
            error: true,
            errorResponse: response,
            global: true
          });
        } else {
          // TODO: I'm wrapping the API response as a API2 response, change it when create site is on API2
          const _response = { ...response, code: '', documentationUrl: '', remedialAction: '' };
          setApiState({
            creatingSite: false,
            error: true,
            errorResponse: _response,
            global: true
          });
        }
      }
    };
    if (fromMarketplace) {
      createSiteFromMarketplace(site as MarketplaceSite).subscribe(success, error);
    } else {
      create(site as CreateSiteMeta).subscribe(success, error);
    }
  }

  function createNewSiteFromMarketplace(site: MarketplaceSite) {
    createSite(site, true);
  }

  function checkNameExist(siteId: string) {
    if (siteId) {
      exists(siteId).subscribe(
        (exists) => {
          if (exists) {
            refts.setSite({ siteIdExist: exists, selectedView: 1 });
          } else {
            refts.setSite({ siteIdExist: false });
          }
        },
        ({ response }) => {
          // TODO: I'm wrapping the API response as a API2 response, change it when create site is on API2
          const _response = { ...response, code: '', documentationUrl: '', remedialAction: '' };
          setApiState({ creatingSite: false, error: true, errorResponse: _response });
        }
      );
    }
  }

  function onDetails(blueprint: MarketplacePlugin, index: number) {
    setSite({ details: { blueprint: blueprint, index: index } });
  }

  function renderBlueprints(list: MarketplacePlugin[], isMarketplace: boolean = false) {
    return list.map((item: MarketplacePlugin) => {
      const isGitItem = item.id === 'GIT';
      return (
        <Grid item xs={12} sm={isGitItem ? 12 : 6} md={isGitItem ? 12 : 4} lg={isGitItem ? 12 : 3} key={item.id}>
          <PluginCard
            plugin={item}
            onPluginSelected={handleBlueprintSelected}
            changeImageSlideInterval={5000}
            isMarketplacePlugin={isMarketplace}
            onDetails={onDetails}
          />
        </Grid>
      );
    });
  }

  function onConfirmOk() {
    handleClose(null, null);
  }

  function onConfirmCancel() {
    setDialog({ inProgress: false });
  }

  useEffect(() => {
    let subscriptions: Subscription[] = [];
    if (blueprints === null && !apiState.error) {
      subscriptions.push(
        fetchBuiltInBlueprints().subscribe({
          next: (blueprints) => {
            setBlueprints([
              {
                id: 'GIT',
                name: formatMessage(messages.gitBlueprintName),
                description: formatMessage(messages.gitBlueprintDescription),
                documentation: null,
                media: {
                  screenshots: [
                    {
                      description: '',
                      title: formatMessage(messages.gitBlueprintName),
                      url: gitLogo
                    }
                  ],
                  videos: []
                }
              },
              ...blueprints.map((bp) => bp.plugin)
            ]);
          },
          error: ({ response }) => {
            if (response) {
              setApiState({ creatingSite: false, errorResponse: response.response });
            }
          }
        })
      );
    }
    if (finishRef && finishRef.current && site.selectedView === 2) {
      finishRef.current.focus();
    }
    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [apiState.error, blueprints, formatMessage, setApiState, site.selectedView]);

  useEffect(() => {
    let subscriptions: Subscription[] = [];
    if (marketplace === null && !apiState.error) {
      subscriptions.push(fetchMarketplaceBlueprints());
    }
    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [apiState.error, fetchMarketplaceBlueprints, marketplace]);

  return (
    <>
      <ConfirmDialog
        open={dialog.inProgress}
        onOk={onConfirmOk}
        onCancel={onConfirmCancel}
        body={formatMessage(messages.dialogCloseMessage)}
        title={formatMessage(messages.dialogCloseTitle)}
        disableEnforceFocus={disableEnforceFocus}
      />
      {apiState.creatingSite || (apiState.error && apiState.global) || site.details.blueprint ? (
        (apiState.creatingSite && (
          <div className={classes.statePaper}>
            <LoadingState
              title={formatMessage(messages.creatingSite)}
              subtitle={formatMessage(messages.pleaseWait)}
              classes={{
                root: classes.loadingStateRoot,
                graphicRoot: classes.loadingStateGraphicRoot,
                graphic: classes.loadingStateGraphic
              }}
            />
          </div>
        )) ||
        (apiState.error && (
          <ApiResponseErrorState
            classes={{ root: classes.errorPaperRoot }}
            error={apiState.errorResponse}
            onButtonClick={handleErrorBack}
          />
        )) ||
        (site.details && (
          <PluginDetailsView
            plugin={site.details.blueprint}
            selectedImageSlideIndex={site.details.index}
            onBlueprintSelected={handleBlueprintSelected}
            onCloseDetails={handleCloseDetails}
            changeImageSlideInterval={5000}
            isMarketplacePlugin={Boolean(site?.details.blueprint.url)}
          />
        ))
      ) : (
        <div className={classes.dialogContainer}>
          <DialogHeader
            title={views[site.selectedView].title}
            subtitle={views[site.selectedView].subtitle}
            id="create-site-dialog"
            onCloseButtonClick={handleClose}
          />

          {blueprints ? (
            <DialogBody classes={{ root: classes.dialogContent }}>
              {site.selectedView === 0 && (
                <div className={cx(classes.slide, classes.fadeIn)}>
                  <Grid container spacing={3} className={classes.containerGrid}>
                    {renderBlueprints(blueprints)}
                    <Grid item xs={12}>
                      <Divider sx={{ ml: -3, mr: -3 }} />
                    </Grid>
                    <Grid item xs={12} className={classes.marketplaceActions}>
                      <Typography color="text.secondary" variant="overline" sx={{ mr: 2 }}>
                        {formatMessage(messages.publicMarketplaceBlueprints)}
                      </Typography>
                      <IconButton size="small" onClick={handleSearchClick}>
                        <SearchIcon />
                      </IconButton>
                      <FormControlLabel
                        className={classes.showIncompatible}
                        control={
                          <Checkbox
                            checked={site.showIncompatible}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleShowIncompatibleChange(e)}
                            color="primary"
                            className={classes.showIncompatibleCheckbox}
                          />
                        }
                        label={
                          <Typography className={classes.showIncompatibleInput}>
                            {formatMessage(messages.showIncompatible)}
                          </Typography>
                        }
                        labelPlacement="start"
                      />
                    </Grid>
                    {search.searchSelected && site.selectedView === 0 && (
                      <Grid item xs={12}>
                        <div className={classes.searchContainer}>
                          <SearchBar
                            showActionButton={Boolean(search.searchKey)}
                            onChange={handleOnSearchChange}
                            keyword={search.searchKey}
                            autoFocus={true}
                          />
                        </div>
                      </Grid>
                    )}
                    {apiState.marketplaceError ? (
                      <Box className={classes.marketplaceUnavailable}>
                        <SignalWifiBadRounded className={classes.marketplaceUnavailableIcon} />
                        <Typography variant="body1" color="text.secondary">
                          {formatMessage(messages.marketplaceUnavailable)}
                        </Typography>
                        <Button variant="text" onClick={fetchMarketplaceBlueprints}>
                          {formatMessage(messages.retry)}
                        </Button>
                      </Box>
                    ) : apiState?.fetchingMarketplace ? (
                      <Box sx={{ width: '100%' }}>
                        <LoadingState />
                      </Box>
                    ) : !filteredMarketplace || filteredMarketplace?.length === 0 ? (
                      <EmptyState
                        title={formatMessage(messages.noMarketplaceBlueprints)}
                        subtitle={formatMessage(messages.changeQuery)}
                        classes={{ root: classes.emptyStateRoot }}
                      />
                    ) : (
                      renderBlueprints(filteredMarketplace, true)
                    )}
                  </Grid>
                </div>
              )}
              {site.selectedView === 1 && (
                <div className={cx(classes.slide, classes.fadeIn)}>
                  {site.blueprint && (
                    <BlueprintForm
                      inputs={site}
                      setInputs={setSite}
                      onCheckNameExist={checkNameExist}
                      onSubmit={handleFinish}
                      blueprint={site.blueprint}
                      classes={{ root: classes.blueprintFormRoot }}
                    />
                  )}
                </div>
              )}
              {site.selectedView === 2 && (
                <div className={cx(classes.slide, classes.fadeIn)}>
                  {site.blueprint && <BlueprintReview onGoTo={handleGoTo} inputs={site} blueprint={site.blueprint} />}
                </div>
              )}
            </DialogBody>
          ) : apiState.error ? (
            <ApiResponseErrorState classes={{ root: classes.errorPaperRoot }} error={apiState.errorResponse} />
          ) : (
            <div className={classes.loading}>
              <Spinner background="none" />
            </div>
          )}
          {site.selectedView !== 0 && (
            <DialogFooter classes={{ root: classes.fadeIn }}>
              <Button color="primary" variant="outlined" onClick={handleBack} children={formatMessage(messages.back)} />
              <PrimaryButton ref={finishRef} onClick={handleFinish} children={views[site.selectedView].btnText} />
            </DialogFooter>
          )}
        </div>
      )}
    </>
  );
}

export default CreateSiteDialogContainer;
