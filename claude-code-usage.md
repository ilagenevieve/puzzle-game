# Using Claude Code with Your Puzzle Game Project

This guide explains how to use Claude Code with the configuration we've set up for your puzzle game project.

## Setup Complete

Your project has been configured with:

1. **`.rooignore`** - Tells Claude Code which files to ignore
2. **`.vscode/settings.json`** - Project-specific settings for Claude Code
3. **`.vscode/mcp-config.json`** - Configuration for the MCP server
4. **`tools/mcp-server.js`** - Custom MCP server with game-specific tools
5. **`claude-code-fedora-setup.md`** - Fedora 41-specific setup instructions

## Using Claude Code

### Basic Usage

1. Open the Claude Code panel in VS Code by clicking the Claude Code icon in the activity bar or using the keyboard shortcut (typically `Ctrl+Shift+C`).
2. Type your request in natural language, such as:
   - "Create a new component for the game board"
   - "Help me implement the Nim game logic"
   - "Debug why the multiplayer connection isn't working"

### Using Custom Tools

Your project has custom tools available through the MCP server:

1. **Game State Validation**
   - Validates game states for nim, domineering, and dots-and-boxes
   - Example: "Validate this nim game state: {piles: [3, 5, 7], currentPlayer: 0}"

2. **AI Move Generation**
   - Generates AI moves for different game types and difficulty levels
   - Example: "Generate a hard difficulty move for this nim game state"

3. **Game Board Visualization**
   - Creates ASCII visualizations of game boards
   - Example: "Visualize this domineering board"

### Different Modes

Claude Code has different modes for different tasks:

1. **Code Mode** - For general coding tasks
   - "Implement the dots-and-boxes game logic"
   - "Create a responsive UI for the game board"

2. **Architect Mode** - For planning and architecture
   - "Design the multiplayer communication protocol"
   - "Plan the database schema for user accounts"

3. **Ask Mode** - For questions and information
   - "How does the nim-sum strategy work?"
   - "What's the best approach for implementing the AI?"

4. **Debug Mode** - For troubleshooting
   - "Why is my WebRTC connection failing?"
   - "Debug this error in the game state update"

## Starting the MCP Server

The MCP server will start automatically when you open the project in VS Code. If you need to start it manually:

1. Open a terminal in VS Code
2. Navigate to the project root
3. Run: `node ./tools/mcp-server.js`

## Example Workflows

### Implementing a New Game Feature

1. Start in **Architect Mode**: "Design the UI and logic for the dots-and-boxes game"
2. Switch to **Code Mode**: "Create the game board component for dots-and-boxes"
3. Use the custom tools: "Validate this dots-and-boxes game state"
4. Test with the AI: "Generate a medium difficulty move for this game state"

### Debugging Game Logic

1. Start in **Debug Mode**: "Help me understand why this game state is invalid"
2. Use the validation tool: "Validate this game state and explain any errors"
3. Switch to **Code Mode** to fix issues: "Fix the validation logic for the nim game"

## Tips for Best Results

1. **Be Specific**: Provide detailed context in your requests
2. **Use the Right Mode**: Switch modes based on your current task
3. **Leverage Custom Tools**: Use the game-specific tools for specialized tasks
4. **Provide Examples**: When asking for help with game logic, provide example states
5. **Iterate**: Break complex tasks into smaller steps

## Troubleshooting

If you encounter issues:

1. Check the VS Code output panel for Claude Code logs
2. Ensure the MCP server is running
3. Verify your API key is correctly configured
4. Consult the `claude-code-fedora-setup.md` file for Fedora-specific troubleshooting

## Resources

- [Claude Code Documentation](https://docs.roocode.com)
- [Puzzle Game Project Documentation](./docs/index.md)
- [Game Rules](./docs/game-mechanics/)