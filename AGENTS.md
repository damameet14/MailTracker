# MailTracker Agent Guide

## Current Direction

- Rebuild from a clean base.
- First product goal: a Chrome extension for Gmail that can send tracked emails and show whether the tracking image was loaded.
- No dashboard for now.
- The extension should only work when `https://mail.google.com` is open.
- Reuse existing Firebase, Vercel, and Google credentials/configuration where appropriate.
- Reuse the existing color palette reference from `ui_example/`.

## Product Language

- Prefer "Open detected" or "tracking image loaded."
- Do not claim an email was read.

## Security Boundaries

- Never expose Gmail refresh tokens, extension tokens, tracking tokens, Firebase Admin credentials, raw IP addresses, or full email bodies.
- Keep privileged server access server-side.
- Validate external input at boundaries.
- Keep Gmail DOM selectors and parsing isolated in Gmail-specific extension modules.

## Code Style

- Keep the code module based.
- Use camel casing for variables, functions, and package names.
- Use descriptive names, even when they are long.
- Prefer one class per file.
- If a module needs multiple classes, split it into a package/folder.
- Keep files under 300 lines where practical.
- Name files, classes, functions, constants, and folders so their purpose is obvious from the name.
- Optimize readability and future AI comprehension over terseness.

