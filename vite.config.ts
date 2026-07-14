import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// Custom plugin to resolve SafetyInspectorPage case-insensitively
const caseInsensitiveResolver = () => {
  return {
    name: 'case-insensitive-resolver',
    resolveId(source: string, importer: string) {
      if (source.includes('SafetyInspectorPage') || source.toLowerCase().includes('safetyinspectorpage')) {
        const baseDir = process.cwd();
        const possiblePaths = [
          'src/pages/SafetyInspectorPage.tsx',
          'src/pages/safetyinspectorpage.tsx',
          'src/pages/safetyInspectorPage.tsx',
          'src/components/SafetyInspectorPage.tsx',
          'src/components/safetyinspectorpage.tsx'
        ];
        for (const relPath of possiblePaths) {
          const absPath = path.resolve(baseDir, relPath);
          if (fs.existsSync(absPath)) {
            return absPath;
          }
        }
      }
      return null;
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables. The 3rd parameter '' loads all env variables regardless of the prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Resolve key from environment sources
  const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || env.API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  const gaMeasurementId = env.VITE_GA_MEASUREMENT_ID || env.GA_MEASUREMENT_ID || process.env.VITE_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID || 'G-MELOSAFE77';

  return {
    plugins: [
      react(),
      tailwindcss(),
      caseInsensitiveResolver()
    ],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiApiKey),
      'import.meta.env.VITE_GA_MEASUREMENT_ID': JSON.stringify(gaMeasurementId)
    }
  };
});

