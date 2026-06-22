import { readFile, writeFile } from 'node:fs/promises'

const popupHtmlPath = 'dist/chrome-extension/popup.html'
const originalPopupHtml = await readFile(popupHtmlPath, 'utf8')

const sanitizedPopupHtml = originalPopupHtml
  .replace(/\s+on[a-z]+="[^"]*"/gi, '')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/\smedia="print"/gi, '')

await writeFile(popupHtmlPath, sanitizedPopupHtml)
