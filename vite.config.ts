import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Custom Workbox-style PWA build plugin that injects the hashed production bundle
 * paths into dist/sw.js for offline App Shell precaching alongside CacheFirst GLB caching.
 */
function ithbPwaPlugin(): Plugin {
  return {
    name: 'ithb-pwa-manifest-injector',
    apply: 'build',
    generateBundle(_, bundle) {
      const precacheList = [
        '/',
        '/index.html',
        '/manifest.webmanifest',
        '/icons/icon-192.svg',
        '/icons/icon-512.svg',
        '/models/manifest.json',
      ];
      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith('.js') || fileName.endsWith('.css')) {
          precacheList.push(`/${fileName}`);
        }
      }

      const swTemplatePath = resolve('public/sw.js');
      const swTemplate = readFileSync(swTemplatePath, 'utf8');
      const injectedSw = swTemplate.replace(
        'self.__ITHB_PRECACHE_MANIFEST',
        JSON.stringify(precacheList, null, 2),
      );

      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: injectedSw,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), ithbPwaPlugin()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-three': ['three', 'three-mesh-bvh'],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
