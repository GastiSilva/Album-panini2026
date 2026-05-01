/* eslint-env node */

const { configure } = require('quasar/wrappers')

module.exports = configure(function (/* ctx */) {
  return {
    eslint: { fix: true, warnings: true, errors: true },

    boot: ['firebase'],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons', 'material-icons-outlined', 'fontawesome-v6'],

    build: {
      target: { browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'] },
      vueRouterMode: 'hash',
      vitePlugins: []
    },

    devServer: { open: true },

    framework: {
      config: {
        dark: false,
        brand: {
          primary: '#1565C0',
          secondary: '#E53935',
          accent: '#FFD600',
          dark: '#1a1a2e',
          'dark-page': '#121212',
          positive: '#21BA45',
          negative: '#C10015',
          info: '#31CCEC',
          warning: '#F2C037'
        },
        notify: { position: 'top', timeout: 2000 }
      },
      plugins: ['Notify', 'Dialog', 'Loading', 'LocalStorage']
    },

    animations: [],

    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
      manifest: {
        name: 'Álbum Mundial 2026',
        short_name: 'Mundial 2026',
        description: 'Control de figuritas del álbum del Mundial FIFA 2026',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#1a1a2e',
        theme_color: '#1565C0',
        icons: [
          { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
          { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    }
  }
})
