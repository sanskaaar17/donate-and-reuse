import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false
  },
  build: {
    // Increase warning threshold slightly (Supabase SDK is inherently large)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor code into separate chunks for better caching
        manualChunks: {
          // Supabase SDK and its crypto dependencies in their own chunk
          'vendor-supabase': ['@supabase/supabase-js'],
          // React runtime in its own chunk
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Lucide icons in their own chunk
          'vendor-lucide': ['lucide-react'],
        }
      }
    }
  }
});
