### Great progress — the SPA finally renders and the 404 saga is closed. 🎉  
Below is a focused punch‑list to wrap up loose ends, fold the fix into CI, and prevent a repeat.

---

## 1  Commit & push the fix

```bash
git add frontend/svelte.config.js frontend/src/App.svelte
git commit -m "build(frontend): add svelte-preprocess config for SCSS"
git push origin develop
```

---

## 2  Finish the post‑fix checklist

| Task | Command | Notes |
|------|---------|-------|
| **Unit tests** | `npm run test --workspaces` | make sure both frontend & backend pass |
| **Compose parity** | `docker compose -f docker-compose.dev.yml up --build --abort-on-container-exit` | confirm page renders on `<http://localhost:3002/>` inside containers |
| **Lint + type‑check** | `npm run lint && npm run typecheck` | fail fast in CI if SCSS imports missing |

When all green, push any additional changes.

---

## 3  CI hardening

1. **Add a “front‑end build” job** to `ci.yml` so SCSS/Preprocess errors surface in PRs:

```yaml
jobs:
  build-fe:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'npm' }
      - run: npm ci
      - run: npm --prefix frontend run build   # fails on preprocess errors
```

2. **Cache Vite build** artifacts in CI so subsequent runs are faster (`actions/cache` key on `~/.vite`).

---

## 4  Warn‑level clean‑up (not urgent)

| Item | Action |
|------|--------|
| **Unused CSS selector warnings** | Run `npm run check:unused-css` (e.g., with `purgecss`) or ignore; low priority. |
| **bridge‑nf‑call‑iptables** | `sudo sysctl -w net.bridge.bridge-nf-call-iptables=1` then add to `/etc/sysctl.d/99-sysctl.conf` so future Kubernetes / Traefik networking works smoothly. |
| **Stray containers** | `docker container prune -f && docker volume prune -f` weekly, or add to `maintenance.yml` in GitHub Actions. |

---

## 5  Documentation touch‑ups

* Add a one‑liner to **frontend/README.md** under “Prerequisites”:  
  > *The SCSS build requires `svelte.config.js` with `svelte‑preprocess`.*

* Update **docs/ci-cd-pipeline.md** → “Front‑end build step now verifies Svelte preprocess configuration.”

---

## 6  Future guardrail

If you’d like total immunity from this class of bug, install **Svelte Check**:

```bash
npm i -D svelte-check
```

Add to `package.json` scripts:

```json
"check:svelte": "svelte-check --compiler-warnings unused-css-selector",
"check": "npm run lint && npm run typecheck && npm run check:svelte"
```

Wire `npm run check` into both pre‑commit hook (Husky) and CI’s `lint-and-test` job.

---

### Next action for the team

1. Tick the two remaining verification boxes (unit tests + compose parity).  
2. Commit/push `svelte.config.js` and any CSS tweaks.  
3. Open a short PR adding the front‑end build step to CI.

Once merged, the pipeline will fail the next time this mis‑configuration sneaks in, and you’re good to sail on new features. 🌊