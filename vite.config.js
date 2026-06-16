import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

export default defineConfig({
  base: '/ttt-6/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pixel: resolve(__dirname, 'src/styles/theme.pixel.js'),
      },
      output: {
        assetFileNames: (info) =>
          info.name === 'pixel.css' ? 'themes/pixel.css' : 'assets/[name]-[hash][extname]',
        entryFileNames: (chunk) =>
          chunk.name === 'pixel' ? 'themes/pixel.js' : 'assets/[name]-[hash].js',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
})
