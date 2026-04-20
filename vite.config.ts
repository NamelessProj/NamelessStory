import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Precache only small app-shell assets; large media files use runtime caching below
        globPatterns: ['**/*.{js,css,html}'],
        runtimeCaching: [
          {
            // Cache story JSON files with a cache-first strategy
            urlPattern: /\/story\/.*\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'story-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            // Cache audio files
            urlPattern: /\/audio\/.*\.(mp3|ogg|wav)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            // Cache image assets
            urlPattern: /\/assets\/.*\.(png|jpg|jpeg|webp|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'asset-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      },
      manifest: {
        name: 'NamelessStory',
        short_name: 'NamelessStory',
        description: 'Visual Novel Engine',
        theme_color: '#ffffff',
        background_color: '#000000',
        display: 'standalone',
        icons: []
      }
    })
  ],
})
