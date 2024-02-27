import { sentryVitePlugin } from "@sentry/vite-plugin";
import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3003
  },
  plugins: [vue(), vueJsx(), sentryVitePlugin({
    org: "individual-ik",
    project: "javascript-vue"
  }), sentryVitePlugin({
    org: "individual-ik",
    project: "javascript-vue"
  })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        mobileStudy: resolve(__dirname, 'mobileStudy.html')
      }
    },

    sourcemap: true
  }
})