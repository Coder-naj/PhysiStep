# Security Policy

## Reporting a vulnerability
Please open a **private** report via GitHub → *Security → Report a vulnerability*. Do not file public issues for security problems.

## Design summary
| Area | Control |
|---|---|
| Secrets | Gemini key exists only as a Cloudflare Worker secret. Nothing secret is in the repo or the browser bundle. |
| Frontend | Strict CSP (`script-src 'self'`, no inline scripts, `object-src 'none'`), self-hosted fonts/KaTeX, KaTeX `trust:false`, no `eval`, AI text rendered as escaped text. |
| API proxy | Fail-closed CORS allow-list, mandatory `Origin`, JSON-only, 8 KB body cap, field length caps, per-IP rate limit, generic error messages, prompt-injection-aware prompts, no user text/IP/keys in logs. |
| Supply chain | Locked installs (`npm ci`), `npm audit` gate, Dependabot, CodeQL, least-privilege workflow permissions. |
| Privacy | No accounts, no analytics, no cookies. Preferences and logs stay in the browser's localStorage. |

## Known limits (be aware)
* GitHub Pages cannot send HTTP response headers, so CSP is delivered via `<meta>`. `frame-ancestors` (clickjacking protection) is not enforceable there. If this matters, put the site behind Cloudflare (free) and add headers, or use Cloudflare Pages.
* The Worker URL is public by nature. Origin checks stop casual cross-site use; the rate limiter is in-memory per isolate (best effort). Add a Cloudflare WAF rate-limit rule for a hard cap, and use a Gemini key **without billing enabled** so abuse can only exhaust the free quota, never create a bill.
