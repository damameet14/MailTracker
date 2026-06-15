# d14.app Domain Setup

MailTracker keeps the apex `d14.app` available for the owner's personal website.

## Production subdomains

| Purpose | URL |
|---|---|
| Dashboard and CRM APIs | `https://crm.d14.app` |
| Gmail OAuth callback | `https://crm.d14.app/api/integrations/gmail/callback` |
| Public tracking images | `https://track.d14.app/t/<token>/pixel.gif` |

Both subdomains have already been added to the Vercel `mailtracker` project.

## Name.com DNS changes

1. Sign in to Name.com.
2. Open **My Domains** and select `d14.app`.
3. Open **DNS Records**.
4. Add this record:

```text
Type: A
Host: crm
Answer: 76.76.21.21
TTL: 300 or provider default
```

5. Add this record:

```text
Type: A
Host: track
Answer: 76.76.21.21
TTL: 300 or provider default
```

6. Remove conflicting `crm` or `track` A, AAAA, or CNAME records if any exist.
7. Do not change the apex `d14.app` records or Name.com nameservers.
8. Wait for DNS propagation and TLS certificate issuance.

## Verification

Run:

```powershell
Resolve-DnsName crm.d14.app
Resolve-DnsName track.d14.app
vercel domains inspect crm.d14.app
vercel domains inspect track.d14.app
```

Both DNS responses should resolve to Vercel and both Vercel domains should report valid configuration.

Then verify:

```powershell
Invoke-RestMethod https://crm.d14.app/api/health
Invoke-WebRequest https://track.d14.app/t/test-invalid-token/pixel.gif
```

The health endpoint should return `status: ok`. The tracking request must return an image even for an invalid token.
