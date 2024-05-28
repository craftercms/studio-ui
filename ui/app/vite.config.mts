/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import { defineConfig } from 'vite';
// import reactSwc from '@vitejs/plugin-react-swc';
import react from '@vitejs/plugin-react';

const proxyConfig = {
  target: 'http://localhost:8080/',
  changeOrigin: true,
  secure: true
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'development' ? '/studio' : '/studio/static-assets/app',
  plugins: [
    // TODO: SWC is faster, but can't use the formatjs transformer with it.
    // mode === 'development' ? react({ ... }) : reactSwc()
    react({
      babel: {
        plugins: [
          [
            'formatjs',
            {
              removeDefaultMessage: false,
              idInterpolationPattern: '[sha512:contenthash:base64:6]',
              ast: true
            }
          ]
        ]
      }
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/studio/api': proxyConfig,
      '/studio/static-assets': proxyConfig,
      '/studio/refresh.json': proxyConfig
    }
  },
  build: {
    minify: false,
    outDir: '../../static-assets/app',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'pages/index.html',
        login: 'pages/login.html',
        preview: 'pages/preview.html',
        legacy: 'pages/legacy.html'
      }
    }
  }
}));
