import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://facturation-617f.onrender.com',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React et React DOM
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor';
          }
          // TanStack Query
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'query';
          }
          // Formulaires
          if (id.includes('node_modules/react-hook-form') || 
              id.includes('node_modules/zod') || 
              id.includes('node_modules/@hookform/resolvers')) {
            return 'forms';
          }
          // Utilitaires
          if (id.includes('node_modules/axios') || 
              id.includes('node_modules/dompdf') || 
              id.includes('node_modules/html2canvas') || 
              id.includes('node_modules/jspdf')) {
            return 'utils';
          }
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }
})