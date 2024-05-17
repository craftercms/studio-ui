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

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import pkg from './package.json' assert { type: 'json' };
import { swc } from 'rollup-plugin-swc3';

/** @type {import('rollup').InputPluginOption} */
const plugins = [
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.VERSION': JSON.stringify(pkg.version)
  }),
  swc(),
  resolve({
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    dedupe: ['react', 'react-dom', 'react-is'],
    mainFields: ['module', 'main', 'browser']
  }),
  commonjs({ include: /node_modules|jquery/ }),
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

/** @type {import('rollup').OutputOptions['globals']} */
const globals = {
  // '@craftercms/content': 'craftercms.content',
  // '@craftercms/search': 'craftercms.search'
  prettier: 'prettier',
  'regexp-to-ast': 'RegExpParser',
  '@prettier/plugin-xml': 'prettierPluginXml',
  'prettier/standalone': 'prettierStandalone'
};

/** @type {import('rollup').RollupOptions['external']} */
const external = Object.keys(globals);

/** @type {Partial<import('rollup').RollupOptions>} */
const commonConfig = {
  context: 'this', // Addresses Rollup's "this replaced to undefined" warning
  onwarn(warning, next) {
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
    next(warning);
  }
};

/** @type {import('rollup').RollupOptions[]} */
export default [
  /* UMD build */
  {
    ...commonConfig,
    input: 'src/index.tsx',
    external,
    plugins,
    output: {
      name: 'craftercms.xb',
      file: '../../static-assets/scripts/craftercms-xb.umd.js',
      format: 'umd',
      amd: { id: pkg.craftercms.id },
      globals
    }
  },

  /* UMD build for preview landing controller */
  {
    ...commonConfig,
    input: 'src/preview.ts',
    external,
    plugins,
    output: {
      name: 'craftercms.previewLanding',
      file: '../../static-assets/scripts/preview-landing.umd.js',
      format: 'umd',
      amd: { id: 'craftercms.previewLanding' },
      globals
    }
  }
];
