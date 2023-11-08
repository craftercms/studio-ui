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

import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import treeshaking from 'rollup-plugin-ts-treeshaking';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';

const isNpm = process.env.NPM === 'true';
const isProd = isNpm || process.env.PRODUCTION === 'true';

const globals = {};

const external = Object.keys(globals);

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const plugins = [
  typescript(),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': isProd ? '"production"' : '"development"',
    'process.env.PRODUCTION': isProd ? '"production"' : '"development"'
  }),
  treeshaking(),
  resolve({
    extensions,
    mainFields: ['module', 'main', 'browser']
  }),
  commonjs({ include: /node_modules/ })
];

const config = [
  {
    input: './src/shared-worker.ts',
    external,
    plugins,
    output: {
      file: `./${isNpm ? 'build_tsc' : isProd ? 'build' : 'public'}/shared-worker.js`,
      sourcemap: isProd ? false : 'inline',
      format: isProd ? 'iife' : 'es',
      globals,
      plugins: [
        isProd &&
          terser({
            output: {
              comments: () => false
            }
          })
      ].filter(Boolean)
    },
    context: 'this'
  }
];

export default config;
