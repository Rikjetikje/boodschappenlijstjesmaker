import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// base must match the GitHub Pages sub-path: https://<user>.github.io/boodschappenlijstjesmaker/
export default defineConfig({
  base: '/boodschappenlijstjesmaker/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Boodschappenlijstjesmaker',
        short_name: 'Boodschappen',
        description: 'Samen boodschappenlijstjes maken',
        lang: 'nl',
        theme_color: '#059669',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/boodschappenlijstjesmaker/',
        scope: '/boodschappenlijstjesmaker/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/boodschappenlijstjesmaker/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
