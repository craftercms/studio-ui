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
import string from './string';
import ajax from './ajax';
import path from './path';
import auth from './auth';
import state from './state';
import contentUtil from './content';
import configuration from '../services/configuration';
import sites from '../services/sites';
import marketplace from '../services/marketplace';
import publishing from '../services/publishing';
import content from '../services/content';
import { forkJoin, fromEvent, Subject } from 'rxjs';
import { debounceTime, filter, map, switchMap, take } from 'rxjs/operators';
import { IntlShape } from 'react-intl/src/types';
import messages, { translateElements } from './i18n-legacy';
import { nou } from './object';
import babel from './babelHelpers-legacy';
import security from '../services/security';
import authService from '../services/auth';
import translation from '../services/translation';
import { jssPreset, makeStyles, ThemeOptions } from '@material-ui/core/styles';
import { generateClassName, defaultThemeOptions } from '../styles/theme';
import createStore, { CrafterCMSStore } from '../state/store';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { GenerateId } from 'jss';
import palette from '../styles/palette';
import { getCurrentIntl, intl$ } from './i18n';

const ErrorState = lazy(() => import('../components/SystemStatus/ErrorState'));

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
      operators: { debounceTime, filter, map, switchMap, take }
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
      BulkUpload: lazy(() => import('../components/Dialogs/BulkUploadDialog')),
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

    system: { generateClassName, defaultThemeOptions, palette, store: null },

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
      translation
    },

    // Mechanics
    render(
      container: string | Element,
      component: string | JSXElementConstructor<any>,
      props: object = {},
      isLegacy = true
    ): Promise<any> {
      if (typeof component !== 'string' && !Object.values(Bridge.components).includes(component)) {
        console.warn('The supplied module is not a know component of CrafterCMSNext.');
      } else if (!(component in Bridge.components)) {
        console.warn(`The supplied component name ('${component}') is not a know component of CrafterCMSNext.`);
      }

      const element = typeof container === 'string' ? document.querySelector(container) : container;

      let Component: JSXElementConstructor<any> =
        typeof component === 'string' ? Bridge.components[component] : component;

      if (nou(Component)) {
        Component = function() {
          return (
            <ErrorState
              graphicUrl="/studio/static-assets/images/warning_state.svg"
              error={{
                code: '',
                message: `The supplied component name ('${component}') is not a know component of CrafterCMSNext`,
                remedialAction: `Please re-check supplied name ('${component}'), make sure you've build the app and created the component.`
              }}
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
            <CrafterCMSNextBridge mountGlobalDialogManager={!isLegacy}>
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

    renderBackgroundUI() {
      const element = document.createElement('div');
      // document.body.appendChild(element);
      return new Promise((resolve, reject) => {
        try {
          const unmount = () => {
            ReactDOM.unmountComponentAtNode(element);
            // document.body.removeChild(element);
          };
          ReactDOM.render(<CrafterCMSNextBridge />, element, () =>
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

  createStore().subscribe((store) => {
    Bridge.system.store = store;
  });
}

intl$.subscribe(updateIntl);
