import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// Helper to find a file path case-insensitively by walking the directory tree from the workspace root
function resolvePathCaseInsensitive(targetPath: string): string | null {
  try {
    const baseDir = process.cwd();
    // Get relative path from workspace root
    const relative = path.relative(baseDir, targetPath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      // If it's outside the workspace, don't attempt case-insensitive resolution
      return fs.existsSync(targetPath) ? targetPath : null;
    }

    const segments = relative.split(/[\\/]/);
    let current = baseDir;

    for (const segment of segments) {
      if (!segment || segment === '.') continue;
      if (!fs.existsSync(current)) return null;
      
      const stat = fs.statSync(current);
      if (!stat.isDirectory()) return null;

      const files = fs.readdirSync(current);
      const matched = files.find(f => f.toLowerCase() === segment.toLowerCase());
      if (!matched) return null;
      current = path.join(current, matched);
    }
    return current;
  } catch (err) {
    return fs.existsSync(targetPath) ? targetPath : null;
  }
}

// Custom plugin to resolve imports case-insensitively
const caseInsensitiveResolver = () => {
  return {
    name: 'case-insensitive-resolver',
    resolveId(source: string, importer: string) {
      if (!importer) return null;

      // We only care about resolving local/relative file imports
      if (source.startsWith('.') || source.startsWith('/')) {
        // Resolve target candidate path relative to importer
        const importerDir = path.dirname(importer);
        const targetPath = path.resolve(importerDir, source);

        // Try standard React/TypeScript extensions
        const extensions = ['.tsx', '.ts', '.jsx', '.js', ''];
        for (const ext of extensions) {
          const candidate = targetPath + ext;
          const resolved = resolvePathCaseInsensitive(candidate);
          if (resolved && fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
            return resolved;
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
