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

const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const publicPath = '/studio/static-assets/libs/monaco/';

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    publicPath,
    path: path.resolve(__dirname, '..', '..', 'static-assets', 'libs', 'monaco'),
    filename: 'monaco.0.20.0.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.ttf$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new MonacoWebpackPlugin({
      publicPath,
      languages: [
        'css',
        'dockerfile',
        'graphql',
        'handlebars',
        'html',
        'java',
        'javascript',
        'json',
        'less',
        'markdown',
        'scss',
        'shell',
        'typescript',
        'xml',
        'yaml'
      ]
    })
  ]
};
