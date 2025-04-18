# Claude Code Setup for Fedora 41

## System Requirements

Claude Code requires:
- Node.js (v14 or later)
- Visual Studio Code (v1.60.0 or later)
- Internet connection for API access (unless using local models)

## Fedora 41 Setup Steps

1. **Ensure Node.js is installed**:
   ```bash
   # Check Node.js version
   node --version
   
   # If not installed or outdated, install via dnf
   sudo dnf install nodejs
   ```

2. **Install required system dependencies**:
   ```bash
   # For browser automation features
   sudo dnf install chromium
   
   # For development tools
   sudo dnf install gcc-c++ make
   ```

3. **Configure firewall if needed**:
   ```bash
   # If using local models or MCP servers, ensure ports are open
   sudo firewall-cmd --permanent --add-port=3000-3010/tcp
   sudo firewall-cmd --reload
   ```

4. **API Key Configuration**:
   - Open VSCode
   - Press `Ctrl+Shift+P` to open the command palette
   - Type "Claude Code: Open Settings" and select it
   - Add your API key for your preferred provider (OpenAI, Anthropic, etc.)

## Project-Specific Configuration

The project has been configured with:
- A `.rooignore` file to exclude irrelevant files
- Project-specific settings in `.vscode/settings.json`

## Using Local Models (Optional)

If you want to use local models with Claude Code on Fedora 41:

1. Install Ollama:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. Pull a model:
   ```bash
   ollama pull llama3
   ```

3. Configure Claude Code to use the local model:
   - Open VSCode settings
   - Navigate to Claude Code settings
   - Set the API provider to "Ollama"
   - Configure the model endpoint (typically http://localhost:11434)

## Troubleshooting

- If browser automation doesn't work, ensure Chromium is installed and accessible
- For permission issues, check that VSCode has appropriate filesystem access
- For network issues, verify firewall settings aren't blocking required connections

## Additional Resources

- [Claude Code Documentation](https://docs.roocode.com)
- [Fedora Documentation](https://docs.fedoraproject.org)