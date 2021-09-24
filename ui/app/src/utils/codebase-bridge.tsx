/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import React, { JSXElementConstructor, lazy } from 'react';
import ReactDOM from 'react-dom';

import CrafterCMSNextBridge from '../components/CrafterCMSNextBridge';
import * as string from './string';
import * as object from './object';
import { nou } from './object';
import * as system from './system';
import * as ajax from './ajax';
import * as path from './path';
import * as auth from './auth';
import * as state from './state';
import * as contentUtil from './content';
import * as configuration from '../services/configuration';
import * as sites from '../services/sites';
import * as marketplace from '../services/marketplace';
import * as publishing from '../services/publishing';
import * as content from '../services/content';
import * as users from '../services/users';
import * as groups from '../services/groups';
import * as clusters from '../services/clusters';
import * as audit from '../services/audit';
import * as logs from '../services/logs';
import * as repositories from '../services/repositories';
import * as contentTypes from '../services/contentTypes';
import * as environment from '../services/environment';
import * as dashboard from '../services/dashboard';
import * as aws from '../services/aws';
import * as cmis from '../services/cmis';
import * as webdav from '../services/webdav';
import * as box from '../services/box';
import * as babel from './babelHelpers-legacy';
import * as security from '../services/security';
import * as authService from '../services/auth';
import * as translation from '../services/translation';
import * as monitoring from '../services/monitoring';
import { forkJoin, fromEvent, Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, pluck, switchMap, take, tap } from 'rxjs/operators';
import { IntlShape } from 'react-intl/src/types';
import * as messages from './i18n-legacy';
import { translateElements } from './i18n-legacy';
import { DeprecatedThemeOptions as ThemeOptions } from '@mui/material/styles';
import * as mui from '@mui/material';
import { defaultThemeOptions, generateClassName } from '../styles/theme';
import getStore, { CrafterCMSStore } from '../state/store';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { GenerateId } from 'jss';
import palette from '../styles/palette';
import {
  buildStoredLanguageKey,
  dispatchLanguageChange,
  getCurrentIntl,
  getStoredLanguage,
  intl$,
  setStoredLanguage
} from './i18n';
import { getHostToHostBus } from '../modules/Preview/previewContext';
import { StandardAction } from '../models/StandardAction';
import { createCustomDocumentEventListener } from './dom';

const ErrorState = lazy(() => import('../components/ErrorState/ErrorState'));

/**
 *
 * To use from existing studio-ui code:
 *
 * Example 1 - Using components
 *
 * CrafterCMSNext
 *   .render(someElementOrSelector, 'AsyncVideoPlayer', { nonPlayableMessage })
 *   .then(() => {
 *     // Optional callback - you don't call .then(...) if you don't need a callback
 *     console.log('The AsyncVideoPlayer (react component) is now rendered.')
 *   });
 *
 * Example 2 - Using assets
 *
 * img.src = CrafterCMSNext.Asset.logoIcon
 *
 */

interface CodebaseBridge {
  React: typeof React;
  ReactDOM: typeof ReactDOM;
  components: { [key: string]: JSXElementConstructor<any> };
  assets: { [key: string]: () => Promise<any> };
  util: object;
  render: Function;
  renderBackgroundUI: Function;
  createLegacyCallbackListener: Function;
  rxjs: object;
  i18n: {
    intl: IntlShape;
    messages: object;
    translateElements: typeof translateElements;
    getStoredLanguage: typeof getStoredLanguage;
    setStoredLanguage: typeof setStoredLanguage;
    buildStoredLanguageKey: typeof buildStoredLanguageKey;
    dispatchLanguageChange: typeof dispatchLanguageChange;
  };
  services: object;
  mui: object;
  system: {
    generateClassName: GenerateId;
    defaultThemeOptions: ThemeOptions;
    palette: any;
    store: CrafterCMSStore;
    getHostToHostBus(): Subject<StandardAction>;
    getStore(): Observable<CrafterCMSStore>;
  };
}

export function updateIntl(nextIntl: IntlShape) {
  // @ts-ignore
  if (window.CrafterCMSNext) {
    // @ts-ignore
    window.CrafterCMSNext.i18n.intl = nextIntl;
  }
}

export function createCodebaseBridge() {
  const Bridge: CodebaseBridge = {
    // React
    React,
    ReactDOM,

    rxjs: {
      Subject,
      fromEvent,
      forkJoin,
      operators: { debounceTime, filter, map, switchMap, take, tap, pluck }
    },

    components: {
      ErrorState,
      CrafterCMSNextBridge,
      AsyncVideoPlayer: lazy(() => import('../components/AsyncVideoPlayer')),
      GraphiQL: lazy(() => import('../components/GraphiQL/GraphiQL')),
      SingleFileUpload: lazy(() => import('../components/Controls/SingleFileUpload')),
      DependencySelection: lazy(() => import('../modules/Content/Dependencies/DependencySelection')),
      CreateSiteDialog: lazy(() => import('../modules/System/Sites/Create/CreateSiteDialog')),
      PublishingQueue: lazy(() => import('../modules/System/Publishing/Queue/PublishingQueue')),
      Search: lazy(() => import('../pages/Search')),
      Global: lazy(() => import('../pages/Global')),
      Preview: lazy(() => import('../pages/Preview')),
      SiteTools: lazy(() => import('../pages/SiteTools')),
      PublishDialog: lazy(() => import('../components/PublishDialog/PublishDialog')),
      DependenciesDialog: lazy(() => import('../components/DependenciesDialog')),
      DeleteDialog: lazy(() => import('../components/DeleteDialog/DeleteDialog')),
      LauncherOpenerButton: lazy(() => import('../components/LauncherOpenerButton/LauncherOpenerButton')),
      EncryptTool: lazy(() => import('../components/EncryptTool')),
      SiteEncryptTool: lazy(() => import('../components/SiteEncryptTool')),
      AuthMonitor: lazy(() => import('../components/SystemStatus/AuthMonitor')),
      Login: lazy(() => import('../pages/Login')),
      BulkUpload: lazy(() => import('../components/UploadDialog/UploadDialog')),
      ConfirmDialog: lazy(() => import('../components/ConfirmDialog')),
      GlobalDialogManager: lazy(() => import('../components/SystemStatus/GlobalDialogManager')),
      PagesWidget: lazy(() => import('../components/PathNavigator/PathNavigator')),
      QuickCreateMenu: lazy(() => import('../pages/QuickCreateMenu')),
      NewContentDialog: lazy(() => import('../components/NewContentDialog/NewContentDialog')),
      PreviewCompatDialog: lazy(() => import('../components/Dialogs/PreviewCompatibilityDialog')),
      PathSelectionDialog: lazy(() => import('../components/Dialogs/PathSelectionDialog')),
      SplitButton: lazy(() => import('../components/Controls/SplitButton')),
      CharCountStatusContainer: lazy(() =>
        import('../components/CharCountStatus').then((module) => ({
          default: module.CharCountStatusContainer
        }))
      ),
      TokenManagement: lazy(() => import('../components/TokenManagement')),
      PluginManagement: lazy(() => import('../components/PluginManagement')),
      PublishingStatusDialogBody: lazy(() =>
        import('../components/PublishingStatusDialog/PublishingStatusDialogContainer')
      ),
      LogoAndMenuBundleButton: lazy(() => import('../components/LogoAndMenuBundleButton')),
      CrafterIcon: lazy(() => import('../components/Icons/CrafterIcon')),
      LauncherGlobalNav: lazy(() => import('../components/LauncherGlobalNav/LauncherGlobalNav')),
      DeleteContentTypeButton: lazy(() => import('../pages/DeleteContentTypeButton')),
      UsersGrid: lazy(() => import('../components/UsersGrid')),
      SitesManagement: lazy(() => import('../components/SitesManagement')),
      UsersManagement: lazy(() => import('../components/UsersManagement')),
      GroupsManagement: lazy(() => import('../components/GroupsManagement')),
      ClustersManagement: lazy(() => import('../components/ClustersManagement')),
      AuditManagement: lazy(() => import('../components/AuditManagement')),
      SiteAuditManagement: lazy(() => import('../components/SiteAuditManagement')),
      LoggingLevelsManagement: lazy(() => import('../components/LoggingLevelsManagement')),
      LogConsole: lazy(() => import('../components/LogConsole')),
      GlobalConfigManagement: lazy(() => import('../components/GlobalConfigManagement')),
      AccountManagement: lazy(() => import('../components/AccountManagement')),
      About: lazy(() => import('../components/AboutCrafterCMSView')),
      ContentTypesManagement: lazy(() => import('../components/AccountManagement')),
      ConfigurationManagement: lazy(() => import('../components/AccountManagement')),
      ItemStatesManagement: lazy(() => import('../components/ItemStatesManagement')),
      RemotesManagement: lazy(() => import('../components/RemoteRepositoriesManagement')),
      GraphQLPlayground: lazy(() => import('../components/AccountManagement')),
      PublishingDashboard: lazy(() => import('../components/PublishingDashboard')),
      SiteConfigurationManagement: lazy(() => import('../components/SiteConfigurationManagement'))
    },

    system: {
      generateClassName,
      defaultThemeOptions,
      palette,
      store: null,
      getHostToHostBus,
      getStore
    },

    mui,

    assets: {
      logoIcon: require('../assets/crafter-icon.svg')
    },

    util: {
      ajax,
      path,
      string,
      object,
      auth,
      babel,
      state,
      system,
      content: contentUtil,
      redux: { useDispatch, useSelector, useStore }
    },

    i18n: {
      intl: getCurrentIntl(),
      messages,
      translateElements,
      getStoredLanguage,
      setStoredLanguage,
      dispatchLanguageChange,
      buildStoredLanguageKey
    },

    services: {
      configuration,
      sites,
      marketplace,
      publishing,
      content,
      auth: authService,
      security,
      translation,
      monitoring,
      users,
      groups,
      clusters,
      audit,
      logs,
      repositories,
      contentTypes,
      environment,
      dashboard,
      aws,
      cmis,
      webdav,
      box
    },

    render(
      container: string | Element,
      component: string | JSXElementConstructor<any>,
      props: object = {},
      isLegacy = true
    ): Promise<any> {
      if (typeof component === 'string') {
        if (!Boolean(Bridge.components[component])) {
          console.warn(`The supplied component name ('${component}') is not a know component of CrafterCMSNext.`);
        }
      } else if (!Object.values(Bridge.components).includes(component)) {
        console.warn('The supplied module is not a know component of CrafterCMSNext.');
      }

      const element = typeof container === 'string' ? document.querySelector(container) : container;

      let Component: JSXElementConstructor<any> =
        typeof component === 'string' ? Bridge.components[component] : component;

      if (nou(Component)) {
        Component = function () {
          return (
            <ErrorState
              imageUrl="/studio/static-assets/images/warning_state.svg"
              message={`The supplied component name ('${component}') is not a know component of CrafterCMSNext. Please re-check supplied name ('${component}'), make sure you've build the app and created the component.`}
            />
          );
        };
      }

      return new Promise((resolve, reject) => {
        try {
          const unmount = (options) => {
            ReactDOM.unmountComponentAtNode(element);
            options.removeContainer && element.parentNode.removeChild(element);
          };
          ReactDOM.render(
            <CrafterCMSNextBridge
              mountGlobalDialogManager={!isLegacy}
              mountSnackbarProvider={!isLegacy}
              suspenseFallback={isLegacy ? '' : void 0}
            >
              <Component {...props} />
            </CrafterCMSNextBridge>,
            element,
            () =>
              resolve({
                unmount: (options) => {
                  options = Object.assign(
                    {
                      delay: false,
                      removeContainer: false
                    },
                    options || {}
                  );
                  if (options.delay) {
                    setTimeout(() => unmount(options), options.delay);
                  } else {
                    unmount(options);
                  }
                }
              })
          );
        } catch (e) {
          reject(e);
        }
      });
    },

    renderBackgroundUI(options) {
      const { mountLegacyConcierge = false } = options ?? {};
      const element = document.createElement('div');
      element.setAttribute('class', 'craftercms-background-ui');
      document.body.appendChild(element);
      return new Promise((resolve, reject) => {
        try {
          const unmount = () => {
            ReactDOM.unmountComponentAtNode(element);
            document.body.removeChild(element);
          };
          ReactDOM.render(
            <CrafterCMSNextBridge mountLegacyConcierge={mountLegacyConcierge} suspenseFallback="" />,
            element,
            () =>
              resolve({
                unmount: (options) => {
                  options = Object.assign({ delay: false }, options || {});
                  if (options.delay) {
                    setTimeout(unmount, options.delay);
                  } else {
                    unmount();
                  }
                }
              })
          );
        } catch (e) {
          reject(e);
        }
      });
    },

    createLegacyCallbackListener: createCustomDocumentEventListener
  };

  // @ts-ignore
  window.CrafterCMSNext = Bridge;

  // The login screen 1. doesn't need redux at all 2. there's no token yet (i.e. not loggeed in)
  // and the store creation is dependant on successfully retrieving the JWT.
  if (!window.location.pathname.includes('/studio/login')) {
    getStore().subscribe((store) => {
      Bridge.system.store = store;
    });
  }
}

intl$.subscribe(updateIntl);
