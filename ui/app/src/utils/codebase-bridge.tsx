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
