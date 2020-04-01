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

import babel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-copy';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

import pkg from './package.json';

const input = 'src/index.tsx';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const plugins = [
  replace({ 'process.env.NODE_ENV': '"production"' }),
  babel({
    exclude: 'node_modules/**',
    presets: [
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/preset-typescript'
    ],
    plugins: [
      'babel-plugin-transform-react-remove-prop-types',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-class-properties'
    ],
    extensions
  }),
  resolve({
    extensions,
    mainFields: ['module', 'main', 'browser']
  }),
  commonjs({
    include: /node_modules/,
    namedExports: {
      'react-dom': ['createPortal', 'findDOMNode', 'hydrate', 'render', 'unmountComponentAtNode', 'flushSync'],
      'react-is': ['isValidElementType', 'ForwardRef'],
      'prop-types': ['elementType'],
      'react': [
        'Children',
        'createRef',
        'Component',
        'PureComponent',
        'createContext',
        'forwardRef',
        'lazy',
        'memo',
        'useCallback',
        'useContext',
        'useEffect',
        'useImperativeHandle',
        'useDebugValue',
        'useLayoutEffect',
        'useMemo',
        'useReducer',
        'useRef',
        'useState',
        'Fragment',
        'Profiler',
        'StrictMode',
        'Suspense',
        'createElement',
        'cloneElement',
        'createFactory',
        'isValidElement',
        'version'
      ]
    }
  }),
  copy({
    targets: [
      { src: 'dist/*.umd.js', dest: '../app/public' },
      { src: 'dist/*.umd.js', dest: '../../static-assets/scripts' }
    ],
    hook: 'writeBundle'
  })
];

const external = [];

const globals = {};

export default [

  /* UMD build */
  {
    input,
    external,
    plugins,
    output: {
      sourcemap: 'inline',
      name: 'craftercms-guest',
      file: pkg.browser,
      format: 'umd',
      amd: { id: pkg.craftercms.id },
      globals
    }
  },
  /* UMD build for preview landing controller */
  {
    input: 'src/index.preview.ts',
    external,
    plugins,
    output: {
      sourcemap: 'inline',
      name: 'preview-landing',
      file: 'dist/preview-landing.umd.js',
      format: 'umd',
      amd: { id: 'org.craftercms.previewLanding' },
      globals
    }
  },

  /*
  // CommonJS & ES module build
  {
    input,
    external,
    plugins,
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ]
  }
  */

];
