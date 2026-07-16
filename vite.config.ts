import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// Local case-insensitive path resolver starting from a known directory
function findCaseInsensitivePath(currentDir: string, remainingSegments: string[]): string | null {
  if (remainingSegments.length === 0) {
    return currentDir;
  }
  
  const [nextSegment, ...rest] = remainingSegments;
  if (!nextSegment || nextSegment === '.') {
    return findCaseInsensitivePath(currentDir, rest);
  }
  
  if (nextSegment === '..') {
    return findCaseInsensitivePath(path.dirname(currentDir), rest);
  }
  
  try {
    if (!fs.existsSync(currentDir)) return null;
    const stats = fs.statSync(currentDir);
    if (!stats.isDirectory()) return null;
    
    const files = fs.readdirSync(currentDir);
    
    // Exact match first
    let matched = files.find(f => f === nextSegment);
    
    // Case-insensitive match if exact not found
    if (!matched) {
      matched = files.find(f => f.toLowerCase() === nextSegment.toLowerCase());
    }
    
    if (!matched) {
      // Check if we are at the last segment and it's missing an extension (e.g., .tsx)
      if (rest.length === 0) {
        const matchedWithExt = files.find(f => {
          const withoutExt = f.replace(/\.[^/.]+$/, "");
          return withoutExt.toLowerCase() === nextSegment.toLowerCase();
        });
        if (matchedWithExt) {
          return path.join(currentDir, matchedWithExt);
        }
      }
      return null;
    }
    
    return findCaseInsensitivePath(path.join(currentDir, matched), rest);
  } catch (e) {
    return null;
  }
}

// Vite plugin to resolve imports case-insensitively within the project
const caseInsensitiveResolver = () => {
  return {
    name: 'case-insensitive-resolver',
    enforce: 'pre' as const,
    resolveId(source: string, importer: string | undefined) {
      if (!importer || importer.includes('node_modules')) return null;

      // Only handle local/relative paths
      if (source.startsWith('.') || source.startsWith('/')) {
        const importerDir = path.dirname(importer);
        const resolvedBase = path.resolve(importerDir, source);
        
        // If it already exists exactly as written, let Vite handle it natively
        if (fs.existsSync(resolvedBase)) {
          return null;
        }

        // Split the relative path into segments and find the casing on disk
        const segments = source.split(/[\\/]/);
        // Start resolving from the importer's directory
        const resolved = findCaseInsensitivePath(importerDir, segments);
        
        if (resolved && fs.existsSync(resolved)) {
          return resolved;
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

