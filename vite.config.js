import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Output directly into the PHP project so one server serves everything.
    outDir: '../phpRecordManagement',
    emptyOutDir: false,   // don't wipe PHP files — only overwrites index.html + assets/
  },

  server: {
    port: 5174,
    open: true,   // auto-open browser on npm run dev
    host: true,   // expose on local network

    // Proxy /api/* → PHP dev server so the React app never sends cross-origin requests.
    // Start PHP with: php -S localhost:8080   (from phpRecordManagement/)
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path,   // keep /api/records.php as-is
      },
    },
  },
})
