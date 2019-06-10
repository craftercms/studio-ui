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

import React, {  } from 'react';
import ReactDOM from 'react-dom';

/*
 *
 * To use from existing studio-ui code:

requirejs(['studio-lib'], function ({ renderComponent, AsyncVideoPlayer }) {
  renderComponent('#asycVideoPlayer', AsyncVideoPlayer, { nonPlayableMessage: '...' });
});

requirejs(['studio-lib'], function ({ renderComponent, AsyncVideoPlayer, ASSETS }) {
  const
    div = document.createElement('div'),
    { logo } = ASSETS;

  div.id = 'someUniqueId';
  document.body.appendChild(div);

  renderComponent(div, AsyncVideoPlayer, { logo });
})

*/

export function createCodebaseBridge() {

  const { define }: any = window;

  define && define('studio-lib', [], function () {
    return {
      // React
      React,
      ReactDOM,
      // Components
      AsyncVideoPlayer: React.lazy(() => import('../components/AsyncVideoPlayer')),
      // Assets
      ASSETS: {
        // e.g. logo: require('../assets/logo.svg'),
      },
      renderComponent: (elem: string | Element, Component: React.FC, props: object) => {
        if (typeof elem === 'string') {
          elem = document.querySelector(elem);
        }
        props = props || {};
        ReactDOM.render(<Component {...props} />, elem);
      }
    };
  });

}
