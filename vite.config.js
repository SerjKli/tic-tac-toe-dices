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
        classic: resolve(__dirname, 'src/styles/theme.classic.js'),
        'dark-pixel': resolve(__dirname, 'src/styles/theme.dark-pixel.js'),
      },
      output: {
        assetFileNames: (info) =>
          ['pixel.css', 'classic.css', 'dark-pixel.css'].includes(info.name)
            ? `themes/${info.name}`
            : 'assets/[name]-[hash][extname]',
        entryFileNames: (chunk) =>
          ['pixel', 'classic', 'dark-pixel'].includes(chunk.name)
            ? `themes/${chunk.name}.js`
            : 'assets/[name]-[hash].js',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
})
