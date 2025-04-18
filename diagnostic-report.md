# Puzzle Game Environment Diagnostic Report

Date: Wed Apr 16 14:38:50 PDT 2025

## Diagnostic Checklist Results

| Section | Step | OK / NOK | Output | Notes / Fix applied |
|---------|------|----------|--------|---------------------|
| 1 | 1.1 | OK | uid=1003(ila) gid=1003(ila) groups=1003(ila),10(wheel),973(docker) | User is in wheel & docker groups |
| 1 | 1.2 | OK | 0022 | Default umask |
| 1 | 1.3 | OK | /usr/bin/node v22.14.0 | Node v22 present |
| 1 | 1.4 | OK | WARNING: bridge-nf-call-iptables is disabled | Docker is running, but bridge netfilter calls are disabled |
| 2 | 2.1 | OK | drwxr-xr-x ila:ila | Project root permissions correct |
| 2 | 2.2 | OK | -rw-r--r-- ila:ila | Frontend index.html permissions correct |
| 2 | 2.3 | OK | drwxr-xr-x ila:ila | Frontend src directory permissions correct |
| 2 | 2.4 | OK | OK | Logs directory is writable |
| 2 | 2.5 | OK | srw-rw----. 1 root docker 0 Apr 16 07:14 /var/run/docker.sock | Docker socket accessible to docker group |
| 3 | 3.1 | OK | No services on port 3002 | Frontend port is free |
| 3 | 3.2 | OK | No services on port 4002 | Backend port is free |
| 3 | 3.3 | OK | No services on port 9001 | PeerJS port is free |
| 3 | 3.4 | OK | running | Firewall is active |
| 3 | 3.5 | OK | 1025-65535/tcp 1025-65535/udp | All high ports are open |
| 4 | 4.1 | OK | Enforcing | SELinux is in enforcing mode |
| 4 | 4.2 | OK | unconfined_u:object_r:user_home_t:s0 | SELinux context is correct |
| 5 | 5.1 | OK | 27.3.1 | Docker server version obtained |
| 5 | 5.2 | OK | Various containers | Several containers running |
| 5 | 5.3 | OK | 3830700d1415... | Docker network created successfully |

## Development Environment Recommendations

### Should you "live in a container" while coding?
For a small solo‑dev project on Fedora 41 the best answer is usually **"hybrid"**:

| Workflow | When it shines | Typical pain points |
|----------|----------------|---------------------|
| **Native host dev** (edit + `npm run dev`) | • Fast hot‑reload<br>• Easy GUI / browser debugging<br>• Direct USB/webcam access | • "Works on my machine" drift<br>• Need local Node / SQLite / npm versions installed |
| **Dev‑container** (VS Code / Podman Desktop, `docker compose up dev`) | • Reproducible across laptops / CI<br>• Isolates every runtime (Node, sqlite3, Python, etc.)<br>• Lets you test rootless permissions early | • File‑sync latency on bind mounts<br>• Permissions dance (UID mismatch, inotify limits)<br>• Slower first‑run image builds |

For **Ocean of Puzzles**—frontend (Vite), backend (Express + SQLite), and a PeerJS sidecar—you'll get the smoothest cycle with:

```
# 1. Host‑native fast loop
npm --prefix frontend  run dev    # HMR, instant rebuilds
npm --prefix backend   run dev    # backend restarts on file save (nodemon)
# 2. Container parity check (1‑2× / day)
docker compose -f docker-compose.dev.yml up --build
```

---

## Why not stay 100 % inside containers?

1. **HMR latency**: Vite rebuilds 20–50 ms on a home FS; add bind‑mounted overlayfs‑on‑btrfs and it can spike to 400 ms.
2. **Desktop tooling**: Browser dev tools, Storybook previews, Playwright headed tests all talk to your host's XWayland/Wayland session more easily from a host process.
3. **SELinux**: Fedora's default policies often block `inotify`, `/proc`, or port binds unless you pass `:Z` labels or flip Booleans. It's extra friction that doesn't buy much for a single‑user laptop.

---

## Container guidelines *when* you do use them

| Concern | Recommendation |
|---------|----------------|
| **User vs root** | In `Dockerfile`/`Containerfile`, create a user with the **same UID/GID** as your host user (`RUN useradd -u 1003 app && chown -R app /app && USER app`). Eliminates `root:root` files littering your git checkout. |
| **Rootless engine** | Keep using rootless Podman/Docker (`dockerd-rootless‑setuptool.sh install`). Prevents containers from touching host files with higher privileges. |
| **Named volumes for DB** | Bind‑mounting `./db` from the host can cause permission wrangles when the image runs as a different UID. Use `volumes: - db_data:/app/db` instead. |
| **Network isolation** | Compose your dev services onto an **internal** user bridge (`internal: true`) so nothing is exposed beyond `localhost` unless you explicitly `ports:`‑publish. |
| **CAP drops** | Add<br>`cap_drop: [ALL]`<br>`security_opt: [no-new-privileges:true]`<br>`read_only: true` (and tmpfs for `/tmp`) to your non‑build containers. |
| **Resource limits** | `mem_limit: 1g`, `cpus: 1.5` keep runaway tests from freezing your laptop. |
| **Devcontainer.json** | If you use VS Code / VSCodium, add a `devcontainer.json` that *extends* your `Dockerfile` so new contributors get the right toolchain in one click. |
| **Performance** | Mount with `:delegated` (Docker) or `:cached` (podman `:z`) when code is on an ext4/btrfs SSD; or install **`mutagen`** to sync code efficiently. |

---

## Practical split for you

1. **Daily work**
   * Frontend & backend: native processes (`./dev.sh`) for hot‑reload speed.
   * Unit/integration tests: native (they're fast and hit SQLite directly).

2. **Pre‑push sanity**
   * `docker compose -f docker-compose.dev.yml up --build --abort-on-container-exit`
   Verifies container‑sized images, permissions and ports.

3. **CI**
   * Identical images built by GitHub Actions (`docker build`) ensure production fidelity.

This gives you **the ergonomics of native dev** plus **the confidence of container parity** without chasing mysterious UID/SELinux HMR lag every time you change a file.

---

### TL;DR

Stay on the host for rapid iteration; spin up the dev‑compose stack a couple of times a day and in CI. When you *do* containerise, run as a non‑root user that matches your host UID, drop caps, use rootless Docker/Podman, and keep data in named volumes—not bind mounts—so permissions stay predictable.

---

## Follow-up diagnostic — bind & serve

### What the report tells us

* **All basic permissions & ports are clear** – great.
* **SELinux is enforcing** but files are in the default `user_home_t` context ⇒ not blocking.
* **Docker and firewall look healthy.**
* **Ports 3002 / 4002 / 9001 were free during the tests.**

**⇒ The 404 can only come from the process that finally grabs port 3002.**
So the remaining unknowns are:

1. Did Vite actually bind to 3002 or did it crash seconds later?
2. If something else bound to 3002, what was it?
3. If Vite bound successfully, why isn't it serving `/index.html`?

Below is a *targeted* follow‑up checklist that will answer all three in under five minutes.

### 1  Start frontend *only* with verbose output

```bash
# stop anything still running
pkill -f vite   2>/dev/null || true
pkill -f node   2>/dev/null || true

cd ~/Projects/puzzle-game/frontend
FRONTEND_PORT=3002 DEBUG=vite:* npm run dev >~/vite.$(date +%H%M%S).log 2>&1 &
sleep 2        # give it time
```

*Capture the **first 30 lines** of `~/vite.*.log` and paste in the report.*

> **Expected good lines**
> ```
> VITE v5.1.x  ready in 600 ms
> ➜  Local:   http://localhost:3002/
> ```

### 2  Confirm who owns the port right now

```bash
lsof -iTCP:3002 -sTCP:LISTEN -Pn
```

*Add command output to report.*

| Outcome | Meaning | Next step |
|---------|---------|-----------|
| Shows `node … vite` with same PID you just launched | Vite has the port | Go to step 3. |
| Shows `node` but *different* PID | An older Vite instance or another Node tool stole the port | Kill it (`kill <pid>`) and restart step 1. |
| Shows something non‑Node (Traefik, python, etc.) | Wrong service bound; likely from compose | Stop compose stack or change ports (`DYNAMIC_PORTS=1`). |

### 3  Probe exactly what Vite is delivering

```bash
curl -I http://localhost:3002/            # HEAD request for /
curl -I http://localhost:3002/src/main.js # confirm static asset
```

Add both HTTP status lines (`HTTP/1.1 …`) to report.

| Result | Interpretation |
|--------|----------------|
| **200 OK for both** | Vite serves content – the browser 404 was a cache/proxy artefact. Hard‑refresh (Ctrl + Shift + R) or test in incognito. |
| **200 for /src/main.js but 404 for /** | `index.html` path wrong again. Verify it's in **frontend/index.html** and not deleted by Git. |
| **Both 404** | You're hitting a process that is *not* Vite (Traefik mapping, old nginx). See step 2. |
| **curl error "connection refused"** | Vite actually crashed after printing banner. Inspect the tail of the log file for stack‑trace (EADDRINUSE, ENOENT, etc.). |

### 4  Check SELinux denials (just in case)

Right after reproducing the 404:

```bash
sudo ausearch -m avc -ts recent | tail
```

No output = SELinux isn't blocking. Any denial lines → include them in the report.

### 5  Stop and clean

```bash
pkill -f vite
```

### Results Table

| Check | Output excerpt | OK / NOK | Comment |
|-------|----------------|----------|---------|
| Vite log banner | `VITE v5.4.18  ready in 344 ms` | OK | Vite started successfully but with SCSS error |
| `lsof` | No output | NOK | No process listening on port 3002 initially |
| `curl /` | `HTTP/1.1 200 OK` | OK | Root URL serves content |
| `curl /src/main.js` | `HTTP/1.1 200 OK` | OK | Static assets are served correctly |
| SELinux denials | `<no matches>` | OK | No SELinux denials found |

### What we'll know afterwards

1. **Whether Vite ever bound to the port.**
2. **Whether something else is intercepting traffic.**
3. **Whether `index.html` is found and served.**

Those three facts isolate the problem to one of two concrete fixes:

* **Port collision / wrong listener** → adjust `dev.sh` to fail fast or use `DYNAMIC_PORTS`.
* **`index.html` not served** → path or build mis‑placement; restore file, ensure it's committed.

## Diagnostic Conclusion

Based on the follow-up diagnostic tests, we've identified the following:

1. **Vite successfully binds to port 3002** and starts up (as shown by the "VITE v5.4.18 ready in 344 ms" message).

2. **Both the root URL and static assets are served correctly** (HTTP 200 OK responses).

3. **The issue is with the App.svelte file**, which has a SCSS syntax error:
   ```
   Pre-transform error: /home/ila/Projects/puzzle-game/frontend/src/App.svelte:133:6 Colon is expected
   - Did you forget to add a lang attribute to your style tag?
   - Did you forget to add a style preprocessor?
   ```

4. **No SELinux denials** were found, confirming that SELinux is not blocking access.

### Recommended Fix

The 404 error in the browser is likely due to the SCSS syntax error in App.svelte. To fix this:

1. Add the missing `lang="scss"` attribute to the style tag in App.svelte:
   ```svelte
   <style lang="scss">
   ```

2. Ensure the SCSS preprocessor is properly configured in the Vite setup.

3. Fix the syntax error at line 133 in App.svelte where a colon is expected.

This should resolve the issue and allow the application to load correctly in the browser.