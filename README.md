# PhysiStep

Bilingual (বাংলা / English) high-school physics solver: step-by-step math, simulators, quizzes, unit converter, formula sheet, PDF export. Installable as an app on Android, iOS/iPadOS, Windows, macOS, Linux and ChromeOS, and **works fully offline**.

**Cost: $0.** Static site on GitHub Pages + (optional) AI proxy on Cloudflare Workers free tier + Gemini free tier.

```
Browser (PWA, GitHub Pages) ──► offline physics engine (always available)
        │
        └─ optional ──► Cloudflare Worker (holds Gemini key) ──► Gemini
                         └─ if Gemini fails/quota ends → same offline engine
```

## 1. Deploy the app (5 minutes, no accounts besides GitHub)
1. Create a GitHub repo (e.g. `PhysiStep`), push this folder to the `main` branch.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. Push. The **CI/CD** workflow lints, tests, audits, builds and deploys. Site: `https://<user>.github.io/<repo>/`.
   * Repo named `<user>.github.io` or using a custom domain? Add repository variable `VITE_BASE` = `/`.

That's a complete, working app. The AI buttons use the built-in deterministic engine.

## 2. (Optional) Turn on Gemini AI — still free
1. Get a key at <https://aistudio.google.com/apikey>. **Do not enable billing** on it (so it can never charge you).
2. Create a free Cloudflare account. Create an API token (template *Edit Cloudflare Workers*) and note your Account ID.
3. In the GitHub repo → **Settings → Secrets and variables → Actions**:
   * Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `GEMINI_API_KEY`
   * Variables: `DEPLOY_WORKER` = `true`, `ALLOWED_ORIGINS` = `https://<user>.github.io` (origin only, no path)
4. Push once so the Worker deploys, copy its URL (`https://physistep-api.<sub>.workers.dev`), then add variable `API_URL` = that URL and re-run the workflow.
5. Recommended: Cloudflare dashboard → *Security → WAF → Rate limiting rules* → limit `/api/*` (free plan includes 1 rule).

## 3. Install on devices
| Device | How |
|---|---|
| Android (Chrome) | Menu ⋮ → **Install app** |
| iPhone / iPad (Safari) | Share → **Add to Home Screen** |
| Windows / macOS / Linux / ChromeOS (Chrome, Edge) | Install icon in the address bar |

Updates download in the background and apply on next launch.

## 4. Logs
* **In the app:** footer → **Download log** saves `physistep-<timestamp>.log` (JSON lines: starts, solves, API timing, errors, SW events). Also offered on the crash screen. Stored only on the device; contains no problem text.
* **Worker:** structured JSON per request (id, route, status, ms, model, fallback) — Cloudflare dashboard → Workers → *Logs*, or `npx wrangler tail -c worker/wrangler.toml`. No user text, keys or IPs are logged.
* **CI:** full build/test logs in the GitHub *Actions* tab.

## Develop
```bash
npm ci
npm run dev        # app on http://localhost:5173/PhysiStep/
npm test           # unit tests (engine, logger, worker)
npm run lint       # type-check app + worker
npm run build
# optional local AI proxy: put GEMINI_API_KEY=... in worker/.dev.vars, then
npm run worker:dev # and run the app with VITE_API_URL=http://localhost:8787
```
See [SECURITY.md](SECURITY.md) for the threat model and known limits.
