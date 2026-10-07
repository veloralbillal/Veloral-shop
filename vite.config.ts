import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ command }) => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]'
        }
      }
    },
    server: {
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Dynamically configure HMR based on environment to support secure cloud proxies and local development
      hmr: process.env.DISABLE_HMR === 'true' ? false : (
        process.env.APP_URL && process.env.APP_URL.startsWith('https://')
          ? {
              protocol: 'wss',
              host: new URL(process.env.APP_URL).hostname,
              clientPort: 443
            }
          : true
      ),
    },
  };
});
