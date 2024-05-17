import { defineConfig } from 'vite';
import reactSwc from '@vitejs/plugin-react-swc';
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
    mode === 'development'
      ? react({
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
      : reactSwc()
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
        main: 'index.html',
        login: 'login.html',
        preview: 'preview.html'
      }
    }
  }
}));
