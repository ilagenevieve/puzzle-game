# Using Codex CLI in Your Projects

This guide provides comprehensive instructions for integrating and using Codex CLI in your existing projects. It covers setup, initialization, running tasks, creating templates, and best practices.

## Table of Contents

- [Using Codex CLI in Your Projects](#using-codex-cli-in-your-projects)
  - [Table of Contents](#table-of-contents)
  - [Installation and Requirements](#installation-and-requirements)
  - [System Setup Overview](#system-setup-overview)
  - [Codex CLI Modes](#codex-cli-modes)
    - [Interactive Mode](#interactive-mode)
    - [Non-interactive Mode](#non-interactive-mode)
    - [Approval Modes](#approval-modes)
  - [Local Helper Scripts](#local-helper-scripts)
    - [Common Library](#common-library)
    - [run-codex](#run-codex)
    - [codex-init.sh](#codex-initsh)
    - [codex-run](#codex-run)
  - [Initializing Codex in an Existing Project](#initializing-codex-in-an-existing-project)
  - [Running Codex Tasks with Versioned Runs](#running-codex-tasks-with-versioned-runs)
    - [Basic Usage](#basic-usage)
  - [Creating Templates for Consistent Project Structure](#creating-templates-for-consistent-project-structure)
    - [Creating a Template](#creating-a-template)
    - [Template Best Practices](#template-best-practices)
  - [Project Documentation](#project-documentation)
    - [Creating Effective Project Documentation](#creating-effective-project-documentation)
  - [Best Practices](#best-practices)
    - [Workflow Integration](#workflow-integration)
    - [Performance Tips](#performance-tips)
  - [Common Use Cases](#common-use-cases)
    - [1. Feature Development](#1-feature-development)
    - [2. Code Refactoring](#2-code-refactoring)
    - [3. Bug Fixing](#3-bug-fixing)
    - [4. Documentation Generation](#4-documentation-generation)
    - [5. CI/CD Integration](#5-cicd-integration)
  - [Troubleshooting](#troubleshooting)
    - [API Key Issues](#api-key-issues)
    - [Script Execution Issues](#script-execution-issues)
    - [Node.js Version Issues](#nodejs-version-issues)
    - [Interactive Mode Issues](#interactive-mode-issues)

## Installation and Requirements

```bash
# 1. Install (requires Node 22+)
npm install -g @openai/codex        # never use sudo with npm -g
npm install -g semver               # required for helper scripts

# 2. Configure your key (once)
echo 'export OPENAI_API_KEY="your-api-key-here"' >> ~/.zshrc
source ~/.zshrc                     # or reload your shell

# 3. Enable shell completion (optional but recommended)
echo 'eval "$(codex completion zsh)"' >> ~/.zshrc    # or bash/fish
source ~/.zshrc

# 4. Run it!
codex                               # interactive REPL
codex "Refactor utils/date.ts"      # interactive + initial prompt
codex -q --json -a auto-edit "explain utils.ts"   # non-interactive
```

## System Setup Overview

The Codex CLI system is configured with the following components:

1. **Official Codex CLI Configuration**:
   - `~/.codex/config.yaml`: Sets default model and other global settings
   - `~/.codex/instructions.md`: Provides global instructions for all Codex sessions
   - Shell completion: Enable with `echo 'eval "$(codex completion zsh)"' >> ~/.zshrc` (or bash/fish)

2. **API Key Storage**:
   - Stored in `~/.secrets/codex/.env`
   - Also exported in your `.zshrc` file

## Codex CLI Modes

Codex CLI can be used in different modes depending on your needs.

### Interactive Mode

Interactive mode is the primary way to use Codex CLI. It provides a REPL (Read-Eval-Print Loop) interface where you can have a conversation with Codex, approve or reject its suggestions, and see the results in real-time.

1. **Basic Interactive Mode**:

   ```bash
   codex
   ```

   This launches Codex in interactive mode with no initial prompt. You'll be presented with a prompt where you can type your request.

2. **Interactive Mode with Initial Prompt**:

   ```bash
   codex "Refactor the Dashboard component to React Hooks"
   ```

   This launches Codex in interactive mode with an initial prompt. Codex will immediately start working on your request.

3. **Interactive Mode with Different Model**:

   ```bash
   codex --model gpt-4.1 "Optimize the database queries"
   # or using the short flag
   codex -m gpt-4.1 "Optimize the database queries"
   ```

   This uses a specific model for the session.

4. **Interactive Mode with Different Approval Mode**:

   ```bash
   codex --approval-mode auto-edit "Update the README"
   # or using the short flag
   codex -a auto-edit "Update the README"
   ```

   This changes how Codex handles approvals (see [Approval Modes](#approval-modes)).

### Non-interactive Mode

Non-interactive or "quiet" mode runs Codex without the interactive UI. This is useful for CI/CD pipelines, scripts, or when you want to capture the output programmatically.

1. **Basic Non-interactive Mode**:

   ```bash
   codex -q "Generate a JSON schema for user data"
   ```

   This runs Codex in quiet mode and outputs the result to stdout.

2. **Non-interactive Mode with JSON Output**:

   ```bash
   codex -q --json "Explain utils.ts"
   ```

   This outputs the result in JSON format.

3. **Non-interactive Mode in CI/CD**:

   ```bash
   export CODEX_QUIET_MODE=1
   codex -q -a auto-edit "update CHANGELOG for next release"
   ```

   This is suitable for running in CI/CD pipelines.

### Approval Modes

Codex CLI offers different approval modes that determine how much autonomy the agent has:

1. **Suggest Mode (Default)**:
   - Codex can read files but requires approval for all writes and commands
   - Use: `codex --approval-mode suggest` or just `codex`

2. **Auto-Edit Mode**:
   - Codex can read and write files but requires approval for commands
   - Use: `codex --approval-mode auto-edit` or `codex -a auto-edit`

3. **Full-Auto Mode**:
   - Codex can read/write files and execute commands without approval
   - Use: `codex --approval-mode full-auto` or `codex -a full-auto`
   - Note: Commands run in a sandbox for safety¹

¹ *On Linux, the sandbox is implemented as a throw-away Docker container. On macOS, it uses Apple's Seatbelt confinement system. This provides defense-in-depth security when running in full-auto mode.*

## Local Helper Scripts

We've created several local helper scripts to enhance your workflow with Codex CLI. These are not part of the official CLI but provide additional functionality for project management and versioned runs.

### Common Library

The `codex-common.sh` script provides shared functions used by all helper scripts:

```bash
# ~/bin/codex-common.sh
#!/usr/bin/env bash
set -euo pipefail

load_api_key() {
  [[ -f ~/.secrets/codex/.env ]] && source ~/.secrets/codex/.env
  : "${OPENAI_API_KEY:?OPENAI_API_KEY not set}"
}

check_node() {
  command -v codex >/dev/null || { echo "Codex CLI not found – install with: npm i -g @openai/codex"; exit 127; }
  node -e 'require("semver");' 2>/dev/null || npm i -g semver
  node -e 'const s=require("semver");process.exit(s.satisfies(process.version,">=22")?0:1)' \
    || { echo "Codex requires Node 22+"; exit 1; }
}
```

### run-codex

The `run-codex` script is a simple wrapper that loads your API key and runs Codex:

```bash
# ~/bin/run-codex
#!/usr/bin/env bash
set -euo pipefail

[[ -f ~/.secrets/codex/.env ]] && source ~/.secrets/codex/.env
: "${OPENAI_API_KEY:?OPENAI_API_KEY not set}"

# sanity checks
command -v codex >/dev/null || { echo "Codex CLI not found – install with: npm i -g @openai/codex"; exit 127; }
node -e 'require("semver");' 2>/dev/null || npm i -g semver
node -e 'const s=require("semver");process.exit(s.satisfies(process.version,">=22")?0:1)' \
  || { echo "Codex requires Node 22+"; exit 1; }

# Suggest adding shell completion (one-time)
if [[ ! -f ~/.codex/.completion_suggested ]]; then
  echo "💡 Tip: Add shell completion with:"
  echo "    echo 'eval \"$(codex completion zsh)\"' >> ~/.zshrc"
  echo "    source ~/.zshrc"
  mkdir -p ~/.codex
  touch ~/.codex/.completion_suggested
fi

exec codex "$@"
```

### codex-init.sh

The `codex-init.sh` script initializes a project with a `codex.md` file:

```bash
# ~/bin/codex-init.sh (abbreviated)
#!/usr/bin/env bash
set -euo pipefail

# Source common helper functions
source ~/bin/codex-common.sh

# Parse arguments (--force flag available)
# ...

# Prompt for API key if not set (with option to save)
# ...

# Check if codex.md already exists (with confirmation)
# ...

# Create codex.md file with project-specific instructions
# ...
```

Key improvements:

- Checks for existing `codex.md` and prompts before overwriting
- Offers to save API key to both `~/.secrets/codex/.env` and `~/.zshrc`
- Uses correct flag syntax in examples (`--approval-mode` instead of deprecated flags)

### codex-run

The `codex-run` script runs Codex tasks with versioned runs:

```bash
# ~/bin/codex-run (abbreviated)
#!/usr/bin/env bash
set -euo pipefail

# Source common helper functions
source ~/bin/codex-common.sh

# Parse arguments (including model and approval mode flags)
# ...

# Create timestamped run directory
run_dir="runs/run_$(date +%Y%m%d-%H%M%S)"

# Copy template files if available
# ...

# Create task.md file
# ...

# Run Codex from project root with logging
script -qec "codex ${codex_extra[*]} --project-doc \"$run_dir/task.md\" \"$task_description\"" "$run_dir/codex.log"
```

Key improvements:

- Uses timestamped directories to avoid collisions
- Stays in project root (doesn't cd into run directory)
- Passes through model and approval mode flags
- Logs Codex output to a file
- Uses `yq` for YAML parsing if available

## Initializing Codex in an Existing Project

To initialize Codex in an existing project:

1. Navigate to your project directory:

   ```bash
   cd ~/Projects/your-existing-project
   ```

2. Run the local initialization script:

   ```bash
   codex-init.sh your-project-name
   ```

   You can use the `--force` flag to overwrite an existing `codex.md` file:

   ```bash
   codex-init.sh --force your-project-name
   ```

3. Edit the `codex.md` file to provide project-specific information:

   ```bash
   nano codex.md  # or your preferred editor
   ```

## Running Codex Tasks with Versioned Runs

The local `codex-run` script allows you to run Codex tasks with versioned runs, similar to the examples in the Codex CLI repository.

### Basic Usage

1. **Direct Task Description**:

   ```bash
   cd ~/Projects/your-project
   codex-run "Create a function that calculates the Fibonacci sequence"
   ```

2. **Task from YAML File**:

   ```bash
   cd ~/Projects/your-project
   codex-run -f task.yaml
   ```

3. **With Model and Approval Mode**:

   ```bash
   codex-run -f task.yaml -m gpt-4.1 -a auto-edit
   ```

4. **Auto-confirm Mode**:

   ```bash
   codex-run --auto-confirm "Refactor the authentication module"
   ```

Each run creates a timestamped directory under `runs/` with:

- A copy of template files (if available)
- A `task.md` file with the task description
- A `codex.log` file with the complete Codex session log

## Creating Templates for Consistent Project Structure

Templates provide a starting point for each Codex run, ensuring consistency and providing necessary context.

### Creating a Template

1. Create a template directory in your project:

   ```bash
   mkdir -p ~/Projects/your-project/template
   ```

2. Add files that should be included in every run:

   ```bash
   # Example: README.md with project structure
   touch ~/Projects/your-project/template/README.md

   # Example: Starter code files
   touch ~/Projects/your-project/template/starter.js
   ```

3. Add documentation or instructions in the template files to guide Codex.

### Template Best Practices

- Include a README.md with clear instructions
- Add starter code with comments explaining the expected structure
- Include any necessary configuration files
- Keep templates minimal but informative

## Project Documentation

Codex merges Markdown instructions in this order:

1. `~/.codex/instructions.md` – personal global guidance
2. `codex.md` at repo root – shared project notes
3. `codex.md` in current working directory – sub‑package specifics

This layered approach allows you to:

- Set global preferences in `~/.codex/instructions.md`
- Define project-wide guidelines in the root `codex.md`
- Specify sub-package details in directory-specific `codex.md` files

You can disable project documentation with `--no-project-doc` or by setting `CODEX_DISABLE_PROJECT_DOC=1`.

### Creating Effective Project Documentation

1. **Global Instructions** (`~/.codex/instructions.md`):
   - Set your coding style preferences
   - Define common patterns you prefer
   - Specify tools or libraries you commonly use

2. **Project Root** (`codex.md` at repo root):
   - Project overview and architecture
   - Team coding standards
   - Directory structure explanation
   - Common commands and workflows

3. **Sub-package Specifics** (`codex.md` in subdirectories):
   - Component-specific details
   - Module-specific requirements
   - Local conventions that differ from the main project

## Best Practices

### Workflow Integration

1. **Choose the Right Mode**:
   - Use interactive mode for exploratory work and complex tasks
   - Use non-interactive mode for CI/CD and scripted operations
   - Use the appropriate approval mode based on task complexity and risk

2. **Version Control**:
   - Commit your `codex.md`, `template/`, and task descriptions to version control
   - Use `git diff` to review changes made by Codex before committing

3. **Task Tracking**:
   - Create task.yaml files for each task in your issue tracker
   - Name runs based on ticket/issue numbers for traceability

4. **Code Review**:
   - Use the versioned runs to review and compare Codex-generated code
   - Have team members review Codex-generated code just like human code

### Performance Tips

1. **Provide Clear Context**:
   - Be specific in your task descriptions
   - Reference relevant files and functions
   - Explain the desired outcome

2. **Use Templates Effectively**:
   - Include only necessary files in templates
   - Add comments to guide Codex

3. **Iterative Refinement**:
   - Start with a basic prompt and refine
   - Use multiple runs to improve results

## Common Use Cases

### 1. Feature Development

```bash
# Create a task.yaml file
cat > task.yaml << EOL
name: "new-feature"
description: |
  Implement a user authentication system with the following requirements:
  - Email and password login
  - Password reset functionality
  - JWT token-based authentication
  - Rate limiting for failed attempts
EOL

# Run Codex with the official CLI
codex "$(cat task.yaml | grep -A 100 "description:" | tail -n +2 | sed 's/^[ ]*//g')"

# Or with the local versioned runs script
codex-run -f task.yaml
```

### 2. Code Refactoring

```bash
# Interactive mode for complex refactoring
codex "Refactor the utils/helpers.js file to improve performance and readability. Split it into multiple modules if necessary."

# Or with local versioned runs script
codex-run "Refactor the utils/helpers.js file to improve performance and readability. Split it into multiple modules if necessary."
```

### 3. Bug Fixing

```bash
# Interactive mode for debugging
codex "Fix the bug in the data processing pipeline where null values cause the application to crash. The issue is in the src/data/processor.js file."

# Or with local versioned runs script
codex-run "Fix the bug in the data processing pipeline where null values cause the application to crash. The issue is in the src/data/processor.js file."
```

### 4. Documentation Generation

```bash
# Non-interactive mode for documentation
codex -q "Generate comprehensive JSDoc documentation for all functions in the src/api/ directory." > api-docs.md

# Or with local versioned runs script
codex-run "Generate comprehensive JSDoc documentation for all functions in the src/api/ directory."
```

### 5. CI/CD Integration

```yaml
# Example GitHub Action
name: Update Changelog
on:
  push:
    branches: [ main ]
jobs:
  update-changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Update changelog via Codex
        run: |
          npm install -g @openai/codex
          npm install -g semver
          export OPENAI_API_KEY="${{ secrets.OPENAI_KEY }}"
          export CODEX_QUIET_MODE=1
          codex -q -a auto-edit "update CHANGELOG for next release"
```

## Troubleshooting

### API Key Issues

If you encounter API key issues:

1. Check if the key is properly set:

   ```bash
   echo $OPENAI_API_KEY
   ```

2. If not set, use the local codex-env function:

   ```bash
   codex-env
   ```

3. Verify the key in the .env file:

   ```bash
   cat ~/.secrets/codex/.env
   ```

### Script Execution Issues

If scripts fail to execute:

1. Check if they're in your PATH:

   ```bash
   which codex-init.sh
   which codex-run
   which run-codex
   ```

2. Verify they're executable:

   ```bash
   ls -la ~/bin/codex*
   ```

3. Make them executable if needed:

   ```bash
   chmod +x ~/bin/codex-init.sh ~/bin/codex-run ~/bin/run-codex
   ```

### Node.js Version Issues

If you encounter Node.js version issues:

```bash
# Check your Node.js version
node -v

# Install semver if needed
npm install -g semver

# Verify version compatibility
node -e 'const s=require("semver");process.exit(s.satisfies(process.version,">=22")?0:1)' \
  || echo "Node 22+ required"
```

### Interactive Mode Issues

If interactive mode isn't working as expected:

1. Check terminal compatibility:

   ```bash
   echo $TERM
   ```

2. Try running with `FORCE_COLOR=1`:

   ```bash
   FORCE_COLOR=1 codex "your prompt"
   ```

3. Check for conflicting terminal settings:

   ```bash
   stty -a
   ```

---

By following this guide, you can effectively integrate Codex CLI into your existing projects and leverage its capabilities for various development tasks.
