import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// Helper to find a file path case-insensitively to prevent Git casing mismatch issues on case-sensitive filesystems
function findFileCaseInsensitive(baseDir: string, relativePath: string): string | null {
  const parts = relativePath.split(/[\\/]/);
  let currentDir = baseDir;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].toLowerCase();
    if (!fs.existsSync(currentDir)) return null;
    const files = fs.readdirSync(currentDir);
    const found = files.find(f => f.toLowerCase() === part);
    if (!found) return null;
    currentDir = path.join(currentDir, found);
  }
  return currentDir;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables. The 3rd parameter '' loads all env variables regardless of the prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Resolve key from environment sources
  const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || env.API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  const gaMeasurementId = env.VITE_GA_MEASUREMENT_ID || env.GA_MEASUREMENT_ID || process.env.VITE_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID || 'G-MELOSAFE77';

  const baseDir = process.cwd();
  const resolvedPath = 
    findFileCaseInsensitive(baseDir, 'src/pages/safetyinspectorpage.tsx') ||
    findFileCaseInsensitive(baseDir, 'src/components/safetyinspectorpage.tsx');

  const alias: Record<string, string> = {};
  if (resolvedPath) {
    alias['/src/pages/SafetyInspectorPage'] = resolvedPath;
    alias['/src/Pages/SafetyInspectorPage'] = resolvedPath;
    alias['./pages/SafetyInspectorPage'] = resolvedPath;
    alias['./Pages/SafetyInspectorPage'] = resolvedPath;
    alias['pages/SafetyInspectorPage'] = resolvedPath;
    alias['Pages/SafetyInspectorPage'] = resolvedPath;
    alias['./pages/safetyInspectorPage'] = resolvedPath;
    alias['/src/pages/safetyInspectorPage'] = resolvedPath;
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias
    },
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

