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
import { forkJoin, fromEvent, Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { IntlShape } from 'react-intl/src/types';
import * as messages from './i18n-legacy';
import { translateElements } from './i18n-legacy';
import * as babel from './babelHelpers-legacy';
import * as security from '../services/security';
import * as authService from '../services/auth';
import * as translation from '../services/translation';
import * as monitoring from '../services/monitoring';
import { jssPreset, makeStyles, ThemeOptions } from '@material-ui/core/styles';
import { defaultThemeOptions, generateClassName } from '../styles/theme';
import createStore, { CrafterCMSStore } from '../state/store';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { GenerateId } from 'jss';
import palette from '../styles/palette';
import { getCurrentIntl, intl$ } from './i18n';
import { getHostToHostBus } from '../modules/Preview/previewContext';
import { StandardAction } from '../models/StandardAction';

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
    translateElements: Function;
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
      operators: { debounceTime, filter, map, switchMap, take, tap }
    },

    components: {
      ErrorState,
      CrafterCMSNextBridge,
      AsyncVideoPlayer: lazy(() => import('../components/AsyncVideoPlayer')),
      GraphiQL: lazy(() => import('../components/GraphiQL')),
      SingleFileUpload: lazy(() => import('../components/Controls/SingleFileUpload')),
      DependencySelection: lazy(() => import('../modules/Content/Dependencies/DependencySelection')),
      DependencySelectionDelete: lazy(() =>
        import('../modules/Content/Dependencies/DependencySelection').then((module) => ({
          default: module.DependencySelectionDelete
        }))
      ),
      CreateSiteDialog: lazy(() => import('../modules/System/Sites/Create/CreateSiteDialog')),
      PublishingQueue: lazy(() => import('../modules/System/Publishing/Queue/PublishingQueue')),
      Search: lazy(() => import('../pages/Search')),
      Preview: lazy(() => import('../pages/Preview')),
      PublishDialog: lazy(() => import('../modules/Content/Publish/PublishDialog')),
      DependenciesDialog: lazy(() => import('../modules/Content/Dependencies/DependenciesDialog')),
      DeleteDialog: lazy(() => import('../modules/Content/Delete/DeleteDialog')),
      ToolbarGlobalNav: lazy(() => import('../components/Navigation/ToolbarGlobalNav')),
      EncryptTool: lazy(() => import('../components/EncryptTool')),
      AuthMonitor: lazy(() => import('../components/SystemStatus/AuthMonitor')),
      Login: lazy(() => import('../pages/Login')),
      BulkUpload: lazy(() => import('../components/Dialogs/UploadDialog')),
      ConfirmDialog: lazy(() => import('../components/Dialogs/ConfirmDialog')),
      GlobalDialogManager: lazy(() => import('../components/SystemStatus/GlobalDialogManager')),
      PagesWidget: lazy(() => import('../components/Navigation/PathNavigator/PathNavigator')),
      QuickCreateMenu: lazy(() => import('../pages/QuickCreateMenu')),
      NewContentDialog: lazy(() => import('../modules/Content/Authoring/NewContentDialog')),
      PreviewCompatDialog: lazy(() => import('../components/Dialogs/PreviewCompatibilityDialog')),
      PathSelectionDialog: lazy(() => import('../components/Dialogs/PathSelectionDialog')),
      SplitButton: lazy(() => import('../components/Controls/SplitButton')),
      CharCountStatusContainer: lazy(() =>
        import('../components/CharCountStatus').then((module) => ({
          default: module.CharCountStatusContainer
        }))
      )
    },

    system: {
      generateClassName,
      defaultThemeOptions,
      palette,
      store: null,
      getHostToHostBus,
      getStore: createStore
    },

    mui: {
      core: {
        styles: {
          makeStyles,
          jssPreset
        }
      }
    },

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
      content: contentUtil,
      redux: { useDispatch, useSelector, useStore }
    },

    i18n: {
      intl: getCurrentIntl(),
      messages,
      translateElements
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
        Component = function() {
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
          // @ts-ignore
          ReactDOM.render(
            // @ts-ignore
            <CrafterCMSNextBridge mountGlobalDialogManager={!isLegacy} mountSnackbarProvider={!isLegacy}>
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
          ReactDOM.render(<CrafterCMSNextBridge mountLegacyConcierge={mountLegacyConcierge} />, element, () =>
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

    createLegacyCallbackListener(id: string, listener: EventListener): Function {
      let callback;
      callback = (e) => {
        listener(e.detail);
        document.removeEventListener(id, callback, false);
      };
      document.addEventListener(id, callback, false);
      return () => {
        document.removeEventListener(id, callback, false);
      };
    }
  };

  // @ts-ignore
  window.CrafterCMSNext = Bridge;

  // The login screen 1. doesn't need redux at all 2. there's no token yet (i.e. not loggeed in)
  // and the store creation is dependant on successfully retrieving the JWT.
  if (!window.location.pathname.includes('/studio/login')) {
    createStore().subscribe((store) => {
      Bridge.system.store = store;
    });
  }
}

intl$.subscribe(updateIntl);
