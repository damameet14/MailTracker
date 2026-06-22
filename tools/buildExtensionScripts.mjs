import { build } from 'esbuild'

const sharedBuildOptions = {
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['chrome120'],
  sourcemap: false,
  minify: true,
}

await Promise.all([
  build({
    ...sharedBuildOptions,
    entryPoints: ['extension/background/backgroundMain.ts'],
    outfile: 'dist/chrome-extension/background.js',
  }),
  build({
    ...sharedBuildOptions,
    entryPoints: ['extension/contentScript/contentScriptMain.ts'],
    outfile: 'dist/chrome-extension/contentScript.js',
  }),
])
