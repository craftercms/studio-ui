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

import React, { JSXElementConstructor, lazy } from 'react';
import ReactDOM from 'react-dom';

import CrafterCMSNextBridge from '../components/CrafterCMSNextBridge/CrafterCMSNextBridge';
import { nou } from '../utils/object';
import * as rxjs from 'rxjs';
import { Observable, Subject } from 'rxjs';
import { IntlShape } from 'react-intl/src/types';
import * as messages from './i18n-legacy';
import { translateElements } from './i18n-legacy';
import * as mui from '@mui/material';
import { createDefaultThemeOptions, generateClassName } from '../styles/theme';
import getStore, { CrafterCMSStore } from '../state/store';
import { GenerateId } from 'jss';
import palette from '../styles/palette';
import {
  buildStoredLanguageKey,
  dispatchLanguageChange,
  getCurrentIntl,
  getStoredLanguage,
  intl$,
  setStoredLanguage
} from '../utils/i18n';
import { getHostToHostBus } from '../utils/subjects';
import { StandardAction } from '../models/StandardAction';
import { createCustomDocumentEventListener } from '../utils/dom';
import { components as studioUIComponents, services, utils } from './studioUI';

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
    createDefaultThemeOptions: typeof createDefaultThemeOptions;
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

    rxjs,

    components: {
      ...studioUIComponents,
      ErrorState,
      CrafterCMSNextBridge,
      SearchPage: lazy(() => import('../pages/Search')),
      Global: lazy(() => import('../pages/Global')),
      Preview: lazy(() => import('../pages/Preview')),
      SiteTools: lazy(() => import('../pages/SiteTools')),
      Login: lazy(() => import('../pages/Login')),
      PagesWidget: lazy(() => import('../components/PathNavigator/PathNavigator')),
      QuickCreateMenu: lazy(() => import('../pages/QuickCreateMenu')),
      DeleteContentTypeButton: lazy(() => import('../pages/DeleteContentTypeButton')),
      PreviewCompatDialog: lazy(() => import('../components/PreviewCompatibilityDialog/PreviewCompatibilityDialog'))
    },

    system: {
      generateClassName,
      createDefaultThemeOptions,
      palette,
      store: null,
      getHostToHostBus,
      getStore
    },

    mui,

    assets: {
      logoIcon: require('../assets/crafter-icon.svg')
    },

    util: utils,

    i18n: {
      intl: getCurrentIntl(),
      messages,
      translateElements,
      getStoredLanguage,
      setStoredLanguage,
      dispatchLanguageChange,
      buildStoredLanguageKey
    },

    services,

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
