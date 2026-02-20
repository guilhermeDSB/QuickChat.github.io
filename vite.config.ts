import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/QuickChat.github.io/',
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    }
  },
  server: {
    port: 3000
  }
});