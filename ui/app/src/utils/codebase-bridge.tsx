/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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

import CrafterCMSNextBridge, { intl } from '../components/CrafterCMSNextBridge';
import string from './string';
import ajax from './ajax';
import path from './path';
import auth from './auth';
import configuration from '../services/configuration';
import sites from '../services/sites';
import marketplace from '../services/marketplace';
import publishing from '../services/publishing';
import content from '../services/content';
import { forkJoin, fromEvent, Subject } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { IntlShape } from 'react-intl/src/types';
import messages, { translateElements } from './i18n-legacy';
import babel from '../utils/babelHelpers-legacy';

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
  rxjs: object;
  i18n: {
    intl: IntlShape;
    messages: object;
    translateElements: Function;
  }
  services: object;
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
      operators: { filter, map, take }
    },

    components: {
      AsyncVideoPlayer: lazy(() => import('../components/AsyncVideoPlayer')),
      GraphiQL: lazy(() => import('../components/GraphiQL')),
      SingleFileUpload: lazy(() => import('../components/SingleFileUpload')),
      DependencySelection: lazy(() => import('../components/DependencySelection')),
      DependecySelectionDelete: lazy(() => (
        import('../components/DependencySelection')
        .then(module => ({
          default: module.DependencySelectionDelete
        }))
      )),
      CreateSiteDialog: lazy(() => import('../components/CreateSiteDialog')),
      PublishingQueue: lazy(() => import('../components/PublishingQueue')),
      EncryptTool: lazy(() => import('../components/EncryptTool'))
    },

    assets: {
      logoIcon: require('../assets/crafter-icon.svg')
    },

    util: {
      ajax,
      path,
      string,
      auth,
      babel
    },

    i18n: {
      intl,
      messages,
      translateElements
    },

    services: {
      configuration,
      sites,
      marketplace,
      publishing,
      content
    },

    // Mechanics
    render(
      container: (string | Element),
      component: string | JSXElementConstructor<any>,
      props: object = {}): Promise<any> {

      if (
        typeof component !== 'string' &&
        !Object.values(Bridge.components).includes(component)
      ) {
        throw new Error('The supplied module is not a know component of CrafterCMSNext.');
      } else if (!(component in Bridge.components)) {
        throw new Error(`The supplied component name ('${component}') is not a know component of CrafterCMSNext.`);
      }

      if (typeof container === 'string') {
        container = document.querySelector(container);
      }

      const Component: JSXElementConstructor<any> = (typeof component === 'string')
        ? Bridge.components[component]
        : component;

      return (
        new Promise((resolve, reject) => {
          try {
            // @ts-ignore
            ReactDOM
              .render(
                // @ts-ignore
                <CrafterCMSNextBridge>
                  <Component {...props} />
                </CrafterCMSNextBridge>,
                container,
                () => resolve()
              );
          } catch (e) {
            reject(e);
          }
        })
      );
    }

  };

  // @ts-ignore
  window.CrafterCMSNext = Bridge;

}
