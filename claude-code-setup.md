# Claude Code Setup Guide

This guide serves as a comprehensive reference for setting up and using Claude Code, an agentic terminal-based AI tool developed by Anthropic. It includes installation, configuration, workflows, and security details.

---

## 0. Overview

- **Tool Name**: Claude Code
- **Maintainer**: Anthropic
- **Installation**: `npm install -g @anthropic-ai/claude-code`
- **Default Model**: `claude-3-7-sonnet-20250219`

---

## 1. System Requirements

### Supported OS
- macOS 10.15+
- Ubuntu 20.04+ / Debian 10+
- Windows (via WSL)

### Minimum Hardware
- 4GB RAM

### Required Software
- Node.js 18+
- git 2.23+ (optional)
- GitHub/GitLab CLI (optional)
- ripgrep (optional)

### Network Access
- Required URLs:
  - `api.anthropic.com`
  - `statsig.anthropic.com`
  - `sentry.io`

---

## 2. Installation

### Standard Install (do NOT use `sudo`):
```bash
npm install -g @anthropic-ai/claude-code
```

### WSL Fixes
```bash
npm config set os linux
npm install -g @anthropic-ai/claude-code --force --no-os-check
```

### Fix Node Path Issues:
Ensure `which node` returns a Linux path (`/usr/bin/node`) and not a Windows path (`/mnt/c/`).

---

## 3. Basic Usage

```bash
cd your-project-directory
claude # launches interactive REPL
```

### Authenticate
- Follow OAuth login
- Requires active billing on [console.anthropic.com](https://console.anthropic.com)

---

## 4. Core Features

- Reads, edits, and understands your codebase
- Creates commits and PRs
- Executes tests and shell commands
- Resolves merge conflicts

---

## 5. CLI Commands

| Command | Description |
|--------|-------------|
| `claude` | Start REPL |
| `claude "query"` | Start REPL with prompt |
| `claude -p "query"` | One-off print mode |
| `cat file | claude -p "query"` | Pipe mode |
| `claude config` | Configure settings |
| `claude update` | Update Claude Code |
| `claude mcp` | Configure MCP |

### CLI Flags
- `--print` / `-p`
- `--json`
- `--verbose`
- `--dangerously-skip-permissions`

---

## 6. Slash Commands

| Command | Purpose |
|---------|---------|
| `/bug` | Report bugs |
| `/clear` | Clear session |
| `/config` | View config |
| `/cost` | Token usage |
| `/init` | Generate CLAUDE.md |
| `/login` / `/logout` | Manage account |
| `/memory` | Edit memory files |
| `/review` | Request review |

---

## 7. Memory Types

| Type | File | Use |
|------|------|-----|
| Global | `~/.claude/CLAUDE.md` | Personal prefs |
| Project | `./CLAUDE.md` | Team knowledge |
| Project Local | `./CLAUDE.local.md` | Private prefs |

Memory can be added using `#` in input.

---

## 8. Permissions

| Tool | Type | Requires Approval |
|------|------|------------------|
| BashTool | Shell commands | Yes |
| FileEditTool | Modify files | Yes |
| FileReadTool | Read files | No |

### Configure via:
- `/allowed-tools`
- `.claude/settings.json`

Example:
```json
{
  "permissions": {
    "allow": ["Bash(npm run lint)"]
  }
}
```

---

## 9. Configuration

```bash
claude config set --global theme dark
```

### Global Config
| Key | Description |
|-----|-------------|
| `theme` | Terminal theme |
| `verbose` | Full command output |
| `env` | Environment vars |

### Project Config
```bash
claude config add ignorePatterns node_modules
```

---

## 10. Model Selection

```bash
export ANTHROPIC_MODEL='claude-3-7-sonnet-20250219'
```

For Bedrock:
```bash
export CLAUDE_CODE_USE_BEDROCK=1
```

For Vertex:
```bash
export CLAUDE_CODE_USE_VERTEX=1
```

---

## 11. Proxy Use

| Env Var | Purpose |
|---------|---------|
| `HTTP_PROXY` | Set HTTP proxy |
| `ANTHROPIC_AUTH_TOKEN` | Auth header override |

---

## 12. Devcontainer Setup

- Compatible with VS Code Remote Containers
- `devcontainer.json`, `Dockerfile`, and `init-firewall.sh`
- Firewall restricts non-approved domains

### Features
- Built on Node 20
- ZSH, fzf, git
- Session persistence

---

## 13. Security Notes

- All commands require confirmation unless explicitly allowed
- Prevents prompt injection via:
  - Input sanitization
  - Command blocklists
  - Context inspection

Best practices:
- Avoid untrusted input
- Confirm edits before applying
- Use `/bug` to report strange behavior

---

## 14. Cost Management

- Track usage with `/cost`
- Use compaction with `/compact`
- Break down tasks
- Clear sessions often with `/clear`

---

## 15. Additional Resources

- Claude 3.7 System Card
- API Reference
- Anthropic Cookbook
- Prompt Library

For more information, visit [https://claude.ai](https://claude.ai)

