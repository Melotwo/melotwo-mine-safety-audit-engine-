import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables. The 3rd parameter '' loads all env variables regardless of the prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Resolve key from environment sources
  const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || env.API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || '';

  // Bulletproof casing resolution for SafetyInspectorPage
  let safetyInspectorPath = '';
  const possiblePaths = [
    'src/pages/SafetyInspectorPage.tsx',
    'src/Pages/SafetyInspectorPage.tsx',
    'src/pages/safetyInspectorPage.tsx',
    'src/Pages/safetyInspectorPage.tsx',
    'src/pages/SafetyInspectorPage',
    'src/Pages/SafetyInspectorPage',
  ];

  for (const p of possiblePaths) {
    const absoluteP = path.resolve(__dirname, p);
    if (fs.existsSync(absoluteP)) {
      safetyInspectorPath = absoluteP;
      break;
    }
  }

  // Fallback to default if not found (to prevent compile issues)
  if (!safetyInspectorPath) {
    safetyInspectorPath = path.resolve(__dirname, 'src/pages/SafetyInspectorPage.tsx');
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '/src/pages/SafetyInspectorPage': safetyInspectorPath,
        '/src/Pages/SafetyInspectorPage': safetyInspectorPath,
        './pages/SafetyInspectorPage': safetyInspectorPath,
        './Pages/SafetyInspectorPage': safetyInspectorPath,
        'pages/SafetyInspectorPage': safetyInspectorPath,
        'Pages/SafetyInspectorPage': safetyInspectorPath,
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiApiKey)
    }
  };
});
