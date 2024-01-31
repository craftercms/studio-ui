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

import babel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-copy';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

const input = 'src/index.tsx';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const plugins = [
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.VERSION': JSON.stringify(pkg.version)
  }),
  babel({
    exclude: 'node_modules/**',
    // TODO: @babel/preset-env breaks the build of AMD-style third party libs (e.g. jQuery, js-cookie)
    presets: ['@babel/preset-react', '@babel/preset-typescript'],
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
    dedupe: ['react', 'react-dom', 'react-is'],
    mainFields: ['module', 'main', 'browser']
  }),
  commonjs({ include: /node_modules/ }),
  copy({
    targets: [
      { src: 'build/*.umd.js', dest: '../app/public' },
      { src: 'build/*.umd.js', dest: '../../static-assets/scripts' }
    ],
    hook: 'writeBundle'
  }),
  {
    name: 'rollup-plugin-adjust-studio-ui-imports',
    transform(code, id) {
      if (id.includes('ui/guest')) {
        const regEx = /import\s+[\w$*\s{},]*\s+from\s+['"](@craftercms\/studio-ui(?!\/models).*?)['"]/g;
        const match = code.match(regEx);
        if (match) {
          return code.replace(regEx, (match) =>
            match.replace('@craftercms/studio-ui', '@craftercms/studio-ui/build_tsc')
          );
        }
      }
      return null;
    }
  }
];

const globals = {
  // '@craftercms/content': 'craftercms.content',
  // '@craftercms/search': 'craftercms.search'
  prettier: 'prettier',
  'regexp-to-ast': 'RegExpParser',
  '@prettier/plugin-xml': 'prettierPluginXml',
  'prettier/standalone': 'prettierStandalone'
};

const external = Object.keys(globals);

const baseConfig = {
  // TODO: Without @babel/preset-env this error doesn't occur.
  // Addresses rollup's this replaced to undefined
  context: 'this',
  onwarn: function (warning, next) {
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return; // you can do this now btw
    next(warning);
  }
};

export default [
  /* UMD build */
  {
    input,
    external,
    plugins,
    output: {
      name: 'craftercms.xb',
      file: 'build/craftercms-xb.umd.js',
      format: 'umd',
      amd: { id: pkg.craftercms.id },
      globals
    },
    ...baseConfig
  },

  /* UMD build for preview landing controller */
  {
    input: 'src/preview.ts',
    external,
    plugins,
    output: {
      name: 'craftercms.previewLanding',
      file: 'build/preview-landing.umd.js',
      format: 'umd',
      amd: { id: 'craftercms.previewLanding' },
      globals
    },
    ...baseConfig
  }
];
