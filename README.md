# MailTracker

MailTracker is being rebuilt as a Gmail-only Chrome extension with an Angular popup/sidebar UI and a FastAPI backend.

## Current Scope

- Chrome extension only.
- Works only when Gmail is open.
- User can choose popup mode or sidebar mode.
- Sidebar is toggled explicitly to avoid flicker.
- Tracking language is "Open detected" or "tracking image loaded."
- Backend creates tracking tokens and serves the tracking image endpoint.

## Structure

| Path | Purpose |
| --- | --- |
| `extension/angularPopup` | Angular popup UI. |
| `extension/background` | Chrome extension service worker classes. |
| `extension/contentScript` | Gmail sidebar and Gmail compose integration classes. |
| `extension/shared` | Shared extension request/response types and API client. |
| `server/mailTrackerBackend/application_startup` | FastAPI backend dependency wiring. |
| `server/mailTrackerBackend/modules/tracking_image_loading` | Backend tracking token, tracking image load, and open-detected summary capability. |
| `server/mailTrackerBackend/transport` | Backend transport adapters that are not owned by a business module. |
| `api/index.py` | Vercel Python entrypoint. |
| `tools` | Build helpers for Chrome extension scripts. |
| `ui_example` | Palette and UI reference images. |

## Commands

```bash
pnpm install
pnpm build:extension
```

For the backend:

```bash
pip install -r requirements.txt
uvicorn server.main:app --reload
```

## Chrome Extension Output

After `pnpm build:extension`, load this folder as an unpacked extension:

```text
dist/chrome-extension
```
