import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables. The 3rd parameter '' loads all env variables regardless of the prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Resolve key from environment sources
  const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || env.API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || '';

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiApiKey)
    }
  };
});
