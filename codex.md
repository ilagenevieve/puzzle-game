 # Codex Project Instructions

 ## Mission
 This project includes a SvelteKit frontend, an Express/TypeScript backend, and supporting documentation. We want to use Codex to generate and improve documentation, surface and group high‑value TODOs, and propose small, safe refactors with corresponding tests. Focus on code quality, maintainability, and test coverage, while preserving infrastructure, deployment scripts, and sensitive assets.

 ## Do NOT touch
 - `/.git/`
 - `/.github/`
 - `/.husky/`
 - `/certs/`
 - `/logs/`
 - `/scripts/`

 ## Directory Map
 - `/backend/` – Express/TypeScript server code
 - `/frontend/` – SvelteKit client application
 - `/docs/` – Project documentation and guides
 - `/scripts/` – Environment setup, build, and deployment scripts
 - `/tools/` – Auxiliary development tools

 ## Branch Strategy
 Each Codex-driven task should be performed on its own branch, named `feat/codex-<YYYYMMDD>-<task>`.

 ---