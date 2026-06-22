import { copyFile, mkdir } from 'node:fs/promises'

await mkdir('dist/chrome-extension', { recursive: true })
await copyFile('extension/static/manifest.json', 'dist/chrome-extension/manifest.json')
await copyFile('logo.png', 'dist/chrome-extension/logo.png')
