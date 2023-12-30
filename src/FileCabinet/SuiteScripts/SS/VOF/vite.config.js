import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        app: './vof-index.html',
      },
      output: {
        entryFileNames: 'vof-index.js',
        assetFileNames: 'vof-index.css',
      }
    }
  }
})
