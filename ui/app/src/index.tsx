import './styles/index.scss';

import React, {  } from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

const elem = document.getElementById('studioSPARoot');

if (elem) {
  // Path through which using normal react development will render.
  ReactDOM.render(<App/>, elem);
} else {
  // Alternative path to use on current studio UI
  require('./utils/codebase-bridge').createCodebaseBridge();
}
