import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindPlugin from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindPlugin()],
  base: '/QuickChat.github.io/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})
