build-and-deploy
failed now in 1m 45s

2s
1s
4s
1m 34s
1s
Run npm run build

> melotwo-safety@1.0.0 prebuild
> node -e "const fs = require('fs'); if (!fs.existsSync('firebase-applet-config.json')) fs.writeFileSync('firebase-applet-config.json', '{}');"


> melotwo-safety@1.0.0 build
> vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs

vite v5.4.21 building for production...
transforming...
✓ 31 modules transformed.
x Build failed in 572ms
error during build:
Could not resolve "./pages/SafetyInspectorPage" from "src/App.tsx"
file: /home/runner/work/melotwo-mine-safety-audit-engine-/melotwo-mine-safety-audit-engine-/src/App.tsx
    at getRollupError (file:///home/runner/work/melotwo-mine-safety-audit-engine-/melotwo-mine-safety-audit-engine-/node_modules/rollup/dist/es/shared/parseAst.js:317:41)
    at error (file:///home/runner/work/melotwo-mine-safety-audit-engine-/melotwo-mine-safety-audit-engine-/node_modules/rollup/dist/es/shared/parseAst.js:313:42)
    at ModuleLoader.handleInvalidResolvedId (file:///home/runner/work/melotwo-mine-safety-audit-engine-/melotwo-mine-safety-audit-engine-/node_modules/rollup/dist/es/shared/node-entry.js:22167:24)
    at file:///home/runner/work/melotwo-mine-safety-audit-engine-/melotwo-mine-safety-audit-engine-/node_modules/rollup/dist/es/shared/node-entry.js:22127:26
Error: Process completed with exit code 1.
0s
0s
0s
0s
0s
0s
