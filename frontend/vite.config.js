// PATH: frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// NOTE: Run `npm install vite-plugin-pwa workbox-window` to enable PWA
let pwaPlugin = null;
try {
  const { VitePWA } = require('vite-plugin-pwa');
  pwaPlugin = VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    manifest: {
      name: 'Portfolio | Full-Stack Developer',
      short_name: 'Portfolio',
      description: 'Full-stack developer portfolio',
      theme_color: '#6366f1',
      background_color: '#060612',
      display: 'standalone',
      start_url: '/',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
      shortcuts: [
        { name: 'Projects', url: '/projects', description: 'View my projects' },
        { name: 'Blog',     url: '/blog',     description: 'Read my blog' },
        { name: 'Contact',  url: '/contact',  description: 'Get in touch' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
          handler: 'CacheFirst',
          options: { cacheName: 'cloudinary-images', expiration: { maxEntries: 60, maxAgeSeconds: 30*24*60*60 } },
        },
        {
          urlPattern: /\/api\/v1\/(profile|site-settings|skills|testimonials)/,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'api-cache', expiration: { maxEntries: 20, maxAgeSeconds: 60*60 } },
        },
      ],
    },
  });
} catch(e) {
  // vite-plugin-pwa not installed yet — run: npm install vite-plugin-pwa workbox-window
  console.warn('PWA plugin not installed. Run: npm install vite-plugin-pwa workbox-window');
}

export default defineConfig({
  plugins: [react(), ...(pwaPlugin ? [pwaPlugin] : [])],
  resolve: {
    alias: {
      '@':           path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages':      path.resolve(__dirname, './src/pages'),
      '@hooks':      path.resolve(__dirname, './src/hooks'),
      '@services':   path.resolve(__dirname, './src/services'),
      '@utils':      path.resolve(__dirname, './src/utils'),
      '@contexts':   path.resolve(__dirname, './src/contexts'),
      '@styles':     path.resolve(__dirname, './src/styles'),
      '@lib':        path.resolve(__dirname, './src/lib'),
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://127.0.0.1:5001', changeOrigin: true }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          forms:  ['react-hook-form'],
        }
      }
    }
  }
});
