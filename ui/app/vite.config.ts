import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import requireTransform from 'vite-plugin-require-transform';

export default ({ mode }) => {
  // https://vitejs.dev/config/
  return defineConfig({
    plugins: [react(), viteTsconfigPaths(), svgrPlugin(), splitVendorChunkPlugin(), requireTransform({})],
    build: {
      outDir: 'build_vite',
      commonjsOptions: {
        include: [/uppy/, /node_modules/]
      },
      emptyOutDir: true,
      chunkSizeWarningLimit: 2000,
      reportCompressedSize: false
    },
    base: mode === 'production' ? '/studio/static-assets/next/' : '/',
    server: {
      open: true,
      port: 3000,
      proxy: {
        '/studio/api': 'http://localhost:8080',
        '/studio/refresh': 'http://localhost:8080',
        '/studio/static-assets/': 'http://localhost:8080',
        '/studio/authType': 'http://localhost:8080'
      }
    }
  });
};
