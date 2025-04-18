Below is a **pre‑flight checklist** you can run once for **each existing project** before you let Codex CLI loose in the repo.  
Think of it as the “primer coat” that lets the agent work with maximum context while keeping your codebase (and teammates) safe.

---

## 1  Scope & goals ‑ *“Why are we using Codex here?”*  

| Question | Action |
|----------|--------|
|What do we want Codex to do first? (docs, tests, small refactors, new features?)|Write two‑ or three‑sentence **mission statement** at the top of `codex.md`.|
|Which parts of the repo are *off‑limits*? (infra, migrations, secrets)|List those paths under **“Do NOT touch”** in `codex.md`; reference them in prompts.|
|What is the desired autonomy? |Pick default `approval‑mode` in `~/.codex/config.yaml` (e.g. `suggest` for prod code, `auto-edit` for docs). citeturn1view0|

---

## 2  Repository hygiene  

1. **Commit a clean baseline** – `git status` must be clean so Codex diffs are obvious.  
2. **.gitignore**  
   ```gitignore
   # Codex artefacts
   /runs/
   ```
3. **Branch strategy** – decide whether each Codex run happens on its own branch (`feat/codex-run‑20250416`) or a long‑lived `ai/experiments` branch.

---

## 3  Documentation layers  

| Layer | Contents | Owner | Done? |
|-------|----------|-------|-------|
|`~/.codex/instructions.md` | personal coding style, favourite libs (e.g. FastAPI/Svelte), veto rules (“never run docker compose ‑‑prod”) | *You* |
|`repoRoot/codex.md` | high‑level architecture, directory map, *forbidden paths* | Maintainer |
|`pkg/codex.md` (optional) | module‑specific quirks | Module leads |

Codex merges them in exactly that order. citeturn1view0

---

## 4  Template & helper scripts

1. **`template/` skeleton**  
   * `README_TEMPLATE.md` – outline expected output format.  
   * `jest.config.ts`, `.env.example`, etc. – only what Codex really needs.
2. **Ensure helper scripts are committed & executable**  
   ```bash
   chmod +x bin/run-codex bin/codex-run bin/codex-init.sh
   git add bin && git commit -m "add Codex helpers"
   ```

---

## 5  Environment checks (one time per machine)

```bash
node -v                       # >= 22.*
npm -g ls @openai/codex || npm i -g @openai/codex
npm -g ls semver      || npm i -g semver      # or drop the dependency
echo $OPENAI_API_KEY  # must print a key
test -n "$NODE_PATH"  # include $(npm root -g) if semver is global
```

---

## 6  Safety & compliance

* **License filters** – if the repo must stay MIT/Apache only, note that in `codex.md`.  
* **Secrets** – run `trufflehog` or GitHub secret scanning before giving Codex write access.  
* **Model selection** – specify `model: gpt-4o` in `config.yaml` if deterministic tool calls matter. citeturn1view0

---

## 7  CI/CD integration blueprint

1. Add a **dry‑run job** in GitHub Actions:

   ```yaml
   - name: Codex smoke test
     run: |
       export CODEX_QUIET_MODE=1
       codex -q -a auto-edit "Explain src/index.ts" > /dev/null
   ```

2. Prepare a nightly “AI refactor” job that runs `codex-run` with a ticket number and opens a PR automatically (once you’re comfortable).

---

## 8  Prompt engineering warm‑up

* Craft 3–5 **gold‑standard prompts** and store them in `prompt‑library/`.
* Each prompt should reference real filenames so Codex learns the project layout.
* Use them interactively first, then automate with `codex-run ‑f prompt.yaml`.

Resources: Microsoft prompt‑engineering guide citeturn0search5.

---

## 9  Change‑management protocol

* Every Codex PR must include **`runs/run_*/task.md`** for traceability.
* Review generated code like any other PR; pay extra attention to:
  * hidden state (files created outside `src/`)
  * package.json version bumps
  * shell commands executed in sandboxes

---

### Quick start ritual for a *new* existing repo

```bash
cd ~/Projects/my‑service
git checkout -b chore/add-codex

# 1. Initialise
codex-init.sh

# 2. Create minimal template
mkdir template && touch template/README.md

# 3. First guided run
codex-run "List the top 5 TODO comments in the repo and group them by area"

# 4. Commit artefacts (codex.md, template/, runs/run_*/task.md)
git add codex.md template runs/run_*/task.md
git commit -m "chore: setup Codex scaffold"
```

You’re now ready to scale Codex usage safely—and every following run will
benefit from the clear context and guard‑rails you put in place during
this prep phase.%                                      
