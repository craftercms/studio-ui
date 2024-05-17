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
import { swc } from 'rollup-plugin-swc3';

const isNpm = process.env.NPM === 'true';
const isProd = isNpm || process.env.PRODUCTION === 'true';

/** @type {import('rollup').RollupOptions} */
const config = {
  input: './src/shared-worker.ts',
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': isProd ? '"production"' : '"development"',
      'process.env.PRODUCTION': isProd ? '"production"' : '"development"'
    }),
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      mainFields: ['module', 'main', 'browser']
    }),
    commonjs({ include: /node_modules/ }),
    swc({
      sourceMaps: true
    })
  ],
  output: {
    file: `./${isNpm ? 'build_tsc' : 'public'}/shared-worker.js`,
    sourcemap: true,
    format: 'es'
  },
  context: 'this'
};

export default config;
