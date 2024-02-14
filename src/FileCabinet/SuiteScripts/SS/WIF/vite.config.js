import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        app: './wif-index.html',
      },
      output: {
        entryFileNames: 'wif-index.js',
        assetFileNames: 'wif-index.css',
      }
    }
  }
})
