import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: 'popup.html',
        background: 'src/background/index.ts',
        content: 'src/content/index.ts',
      },
      output: { entryFileNames: '[name].js' },
    },
  },
})
