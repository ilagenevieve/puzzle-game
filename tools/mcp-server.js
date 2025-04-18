/**
 * Claude Code MCP Server for Puzzle Game Project
 * 
 * This server provides custom tools for the puzzle game development:
 * - Game state validation
 * - AI move generation
 * - Game board visualization
 */

const readline = require('readline');
const crypto = require('crypto');

// Set up readline interface for stdio communication
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

// Server metadata
const serverInfo = {
    name: "game-tools",
    version: "1.0.0",
    description: "Custom tools for puzzle game development"
};

// Available tools
const tools = {
    validate_game_state: {
        description: "Validates a game state for a specific game type",
        input_schema: {
            type: "object",
            required: ["game_type", "game_state"],
            properties: {
                game_type: {
                    type: "string",
                    enum: ["nim", "domineering", "dots-and-boxes"],
                    description: "The type of puzzle game"
                },
                game_state: {
                    type: "object",
                    description: "The current state of the game"
                }
            }
        },
        output_schema: {
            type: "object",
            properties: {
                valid: {
                    type: "boolean",
                    description: "Whether the game state is valid"
                },
                errors: {
                    type: "array",
                    items: {
                        type: "string"
                    },
                    description: "List of validation errors if any"
                }
            }
        },
        function: validateGameState
    },

    generate_ai_move: {
        description: "Generates an AI move for a given game state",
        input_schema: {
            type: "object",
            required: ["game_type", "game_state", "difficulty"],
            properties: {
                game_type: {
                    type: "string",
                    enum: ["nim", "domineering", "dots-and-boxes"],
                    description: "The type of puzzle game"
                },
                game_state: {
                    type: "object",
                    description: "The current state of the game"
                },
                difficulty: {
                    type: "string",
                    enum: ["easy", "medium", "hard"],
                    description: "The difficulty level of the AI"
                }
            }
        },
        output_schema: {
            type: "object",
            properties: {
                move: {
                    type: "object",
                    description: "The AI's move"
                },
                reasoning: {
                    type: "string",
                    description: "Explanation of why the AI made this move"
                }
            }
        },
        function: generateAIMove
    },

    visualize_game_board: {
        description: "Generates an ASCII visualization of the game board",
        input_schema: {
            type: "object",
            required: ["game_type", "game_state"],
            properties: {
                game_type: {
                    type: "string",
                    enum: ["nim", "domineering", "dots-and-boxes"],
                    description: "The type of puzzle game"
                },
                game_state: {
                    type: "object",
                    description: "The current state of the game"
                }
            }
        },
        output_schema: {
            type: "object",
            properties: {
                visualization: {
                    type: "string",
                    description: "ASCII representation of the game board"
                }
            }
        },
        function: visualizeGameBoard
    }
};

// Available resources
const resources = {
    "game://rules/nim": {
        description: "Rules for the Nim game",
        content: `
      # Nim Game Rules
      
      In Nim, players take turns removing objects from distinct piles.
      On each turn, a player must remove at least one object, and may remove
      any number of objects provided they all come from the same pile.
      The player who removes the last object wins.
      
      ## Game State Structure
      
      {
        "piles": [3, 5, 7],  // Number of objects in each pile
        "currentPlayer": 0,  // 0 or 1
        "gameOver": false,
        "winner": null       // null, 0, or 1
      }
    `
    },
    "game://rules/domineering": {
        description: "Rules for the Domineering game",
        content: `
      # Domineering Game Rules
      
      Domineering is played on a rectangular grid. Players take turns
      placing dominoes on the grid. One player places dominoes vertically,
      the other horizontally. A player loses when they cannot place a domino.
      
      ## Game State Structure
      
      {
        "board": [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0]
        ],  // 0: empty, 1: player 1's domino, 2: player 2's domino
        "currentPlayer": 0,  // 0 (horizontal) or 1 (vertical)
        "gameOver": false,
        "winner": null       // null, 0, or 1
      }
    `
    },
    "game://rules/dots-and-boxes": {
        description: "Rules for the Dots and Boxes game",
        content: `
      # Dots and Boxes Game Rules
      
      Dots and Boxes is played on a grid of dots. Players take turns
      drawing lines between adjacent dots. When a player completes the
      fourth side of a box, they claim that box and take another turn.
      The player with the most boxes at the end wins.
      
      ## Game State Structure
      
      {
        "grid": {
          "dots": [rows, cols],
          "horizontalLines": [[0, 0, 0], [0, 0, 0]],  // 0: no line, 1: line
          "verticalLines": [[0, 0], [0, 0], [0, 0]],  // 0: no line, 1: line
          "boxes": [[0, 0], [0, 0]]  // 0: unclaimed, 1: player 1, 2: player 2
        },
        "scores": [0, 0],
        "currentPlayer": 0,  // 0 or 1
        "gameOver": false,
        "winner": null       // null, 0, 1, or "draw"
      }
    `
    }
};

// Tool implementation functions
function validateGameState(params) {
    const { game_type, game_state } = params;
    let valid = true;
    const errors = [];

    switch (game_type) {
        case "nim":
            // Check if piles exist and are valid
            if (!game_state.piles || !Array.isArray(game_state.piles)) {
                valid = false;
                errors.push("Game state must include an array of piles");
            } else {
                // Check if all piles have non-negative integers
                for (let i = 0; i < game_state.piles.length; i++) {
                    if (!Number.isInteger(game_state.piles[i]) || game_state.piles[i] < 0) {
                        valid = false;
                        errors.push(`Pile ${i} must be a non-negative integer`);
                    }
                }
            }

            // Check current player
            if (game_state.currentPlayer !== 0 && game_state.currentPlayer !== 1) {
                valid = false;
                errors.push("Current player must be 0 or 1");
            }

            break;

        case "domineering":
            // Check if board exists and is valid
            if (!game_state.board || !Array.isArray(game_state.board)) {
                valid = false;
                errors.push("Game state must include a board array");
            } else {
                // Check if board is rectangular and contains valid values
                const rowLength = game_state.board[0]?.length;
                if (!rowLength) {
                    valid = false;
                    errors.push("Board must have at least one row and column");
                } else {
                    for (let i = 0; i < game_state.board.length; i++) {
                        if (!Array.isArray(game_state.board[i]) || game_state.board[i].length !== rowLength) {
                            valid = false;
                            errors.push(`Row ${i} must be an array of length ${rowLength}`);
                        } else {
                            for (let j = 0; j < game_state.board[i].length; j++) {
                                if (![0, 1, 2].includes(game_state.board[i][j])) {
                                    valid = false;
                                    errors.push(`Cell (${i},${j}) must be 0, 1, or 2`);
                                }
                            }
                        }
                    }
                }
            }

            // Check current player
            if (game_state.currentPlayer !== 0 && game_state.currentPlayer !== 1) {
                valid = false;
                errors.push("Current player must be 0 or 1");
            }

            break;

        case "dots-and-boxes":
            // Basic structure validation
            if (!game_state.grid) {
                valid = false;
                errors.push("Game state must include a grid object");
            } else {
                // Check dots
                if (!game_state.grid.dots || !Array.isArray(game_state.grid.dots) || game_state.grid.dots.length !== 2) {
                    valid = false;
                    errors.push("Grid must include dots as [rows, cols]");
                }

                // Check lines and boxes (simplified validation)
                if (!game_state.grid.horizontalLines || !Array.isArray(game_state.grid.horizontalLines)) {
                    valid = false;
                    errors.push("Grid must include horizontalLines array");
                }

                if (!game_state.grid.verticalLines || !Array.isArray(game_state.grid.verticalLines)) {
                    valid = false;
                    errors.push("Grid must include verticalLines array");
                }

                if (!game_state.grid.boxes || !Array.isArray(game_state.grid.boxes)) {
                    valid = false;
                    errors.push("Grid must include boxes array");
                }
            }

            // Check scores
            if (!game_state.scores || !Array.isArray(game_state.scores) || game_state.scores.length !== 2) {
                valid = false;
                errors.push("Game state must include scores as [player1Score, player2Score]");
            }

            // Check current player
            if (game_state.currentPlayer !== 0 && game_state.currentPlayer !== 1) {
                valid = false;
                errors.push("Current player must be 0 or 1");
            }

            break;

        default:
            valid = false;
            errors.push(`Unknown game type: ${game_type}`);
    }

    return { valid, errors };
}

function generateAIMove(params) {
    const { game_type, game_state, difficulty } = params;

    // This is a simplified implementation that would be expanded in a real system
    switch (game_type) {
        case "nim":
            return generateNimMove(game_state, difficulty);
        case "domineering":
            return generateDomineeringMove(game_state, difficulty);
        case "dots-and-boxes":
            return generateDotsAndBoxesMove(game_state, difficulty);
        default:
            return {
                error: `Unknown game type: ${game_type}`
            };
    }
}

function generateNimMove(game_state, difficulty) {
    // Simple implementation for demonstration
    // In a real system, this would use the nim-sum for optimal play

    const { piles } = game_state;

    // Find non-empty piles
    const nonEmptyPiles = piles.map((size, index) => ({ size, index }))
        .filter(pile => pile.size > 0);

    if (nonEmptyPiles.length === 0) {
        return {
            error: "No valid moves available"
        };
    }

    let move;
    let reasoning;

    switch (difficulty) {
        case "easy":
            // Random move: take 1 from a random non-empty pile
            const randomPile = nonEmptyPiles[Math.floor(Math.random() * nonEmptyPiles.length)];
            move = {
                pileIndex: randomPile.index,
                count: 1
            };
            reasoning = "Taking 1 from a randomly selected pile";
            break;

        case "medium":
            // Take a random number from a random pile
            const mediumPile = nonEmptyPiles[Math.floor(Math.random() * nonEmptyPiles.length)];
            const count = Math.floor(Math.random() * mediumPile.size) + 1;
            move = {
                pileIndex: mediumPile.index,
                count: count
            };
            reasoning = `Taking ${count} from pile ${mediumPile.index}`;
            break;

        case "hard":
            // Simplified nim-sum strategy (not fully optimal)
            // In a real implementation, this would use the proper nim-sum calculation

            // If only one pile remains, take all but 1 if size > 1, otherwise take all
            if (nonEmptyPiles.length === 1) {
                const pile = nonEmptyPiles[0];
                const count = pile.size > 1 ? pile.size - 1 : pile.size;
                move = {
                    pileIndex: pile.index,
                    count: count
                };
                reasoning = `Strategic move: taking ${count} from the last non-empty pile`;
            } else {
                // Take all from the largest pile (not optimal but better than random)
                const largestPile = nonEmptyPiles.reduce((max, pile) =>
                    pile.size > max.size ? pile : max, nonEmptyPiles[0]);
                move = {
                    pileIndex: largestPile.index,
                    count: largestPile.size
                };
                reasoning = `Taking all ${largestPile.size} from the largest pile (${largestPile.index})`;
            }
            break;
    }

    return { move, reasoning };
}

function generateDomineeringMove(game_state, difficulty) {
    // Simplified implementation
    return {
        move: {
            type: "placeholder",
            position: [0, 0]
        },
        reasoning: "This is a placeholder implementation for domineering moves"
    };
}

function generateDotsAndBoxesMove(game_state, difficulty) {
    // Simplified implementation
    return {
        move: {
            type: "placeholder",
            line: "horizontal",
            position: [0, 0]
        },
        reasoning: "This is a placeholder implementation for dots-and-boxes moves"
    };
}

function visualizeGameBoard(params) {
    const { game_type, game_state } = params;

    switch (game_type) {
        case "nim":
            return visualizeNim(game_state);
        case "domineering":
            return visualizeDomineering(game_state);
        case "dots-and-boxes":
            return visualizeDotsAndBoxes(game_state);
        default:
            return {
                error: `Unknown game type: ${game_type}`
            };
    }
}

function visualizeNim(game_state) {
    const { piles } = game_state;

    let visualization = "Nim Game State:\n\n";

    piles.forEach((size, index) => {
        visualization += `Pile ${index}: ${"O ".repeat(size)}\n`;
    });

    visualization += `\nCurrent player: Player ${game_state.currentPlayer + 1}`;

    if (game_state.gameOver) {
        visualization += `\nGame over! Winner: Player ${game_state.winner + 1}`;
    }

    return { visualization };
}

function visualizeDomineering(game_state) {
    const { board } = game_state;

    let visualization = "Domineering Game State:\n\n";

    // Create the board visualization
    for (let i = 0; i < board.length; i++) {
        let row = "";
        for (let j = 0; j < board[i].length; j++) {
            switch (board[i][j]) {
                case 0:
                    row += ". ";
                    break;
                case 1:
                    row += "H ";
                    break;
                case 2:
                    row += "V ";
                    break;
            }
        }
        visualization += row + "\n";
    }

    visualization += `\nCurrent player: Player ${game_state.currentPlayer + 1} (${game_state.currentPlayer === 0 ? "Horizontal" : "Vertical"})`;

    if (game_state.gameOver) {
        visualization += `\nGame over! Winner: Player ${game_state.winner + 1}`;
    }

    return { visualization };
}

function visualizeDotsAndBoxes(game_state) {
    // Simplified implementation
    return {
        visualization: "Dots and Boxes visualization not fully implemented yet"
    };
}

// MCP protocol message handling
function handleMessage(message) {
    try {
        const parsedMessage = JSON.parse(message);

        switch (parsedMessage.type) {
            case "ping":
                return {
                    type: "pong",
                    id: parsedMessage.id
                };

            case "info":
                return {
                    type: "info_response",
                    id: parsedMessage.id,
                    info: serverInfo
                };

            case "list_tools":
                return {
                    type: "list_tools_response",
                    id: parsedMessage.id,
                    tools: Object.entries(tools).map(([name, tool]) => ({
                        name,
                        description: tool.description,
                        input_schema: tool.input_schema,
                        output_schema: tool.output_schema
                    }))
                };

            case "list_resources":
                return {
                    type: "list_resources_response",
                    id: parsedMessage.id,
                    resources: Object.entries(resources).map(([uri, resource]) => ({
                        uri,
                        description: resource.description
                    }))
                };

            case "use_tool":
                if (!parsedMessage.tool_name || !tools[parsedMessage.tool_name]) {
                    return {
                        type: "error",
                        id: parsedMessage.id,
                        error: {
                            code: "UNKNOWN_TOOL",
                            message: `Unknown tool: ${parsedMessage.tool_name}`
                        }
                    };
                }

                try {
                    const result = tools[parsedMessage.tool_name].function(parsedMessage.arguments || {});
                    return {
                        type: "tool_response",
                        id: parsedMessage.id,
                        result
                    };
                } catch (error) {
                    return {
                        type: "error",
                        id: parsedMessage.id,
                        error: {
                            code: "TOOL_EXECUTION_ERROR",
                            message: error.message
                        }
                    };
                }

            case "get_resource":
                if (!parsedMessage.uri || !resources[parsedMessage.uri]) {
                    return {
                        type: "error",
                        id: parsedMessage.id,
                        error: {
                            code: "UNKNOWN_RESOURCE",
                            message: `Unknown resource: ${parsedMessage.uri}`
                        }
                    };
                }

                return {
                    type: "resource_response",
                    id: parsedMessage.id,
                    content: resources[parsedMessage.uri].content
                };

            default:
                return {
                    type: "error",
                    id: parsedMessage.id,
                    error: {
                        code: "UNKNOWN_MESSAGE_TYPE",
                        message: `Unknown message type: ${parsedMessage.type}`
                    }
                };
        }
    } catch (error) {
        return {
            type: "error",
            id: crypto.randomUUID(),
            error: {
                code: "INVALID_JSON",
                message: "Failed to parse message as JSON"
            }
        };
    }
}

// Start the MCP server
console.error("MCP Server for Puzzle Game started");

rl.on('line', (line) => {
    const response = handleMessage(line);
    console.log(JSON.stringify(response));
});

// Handle process termination
process.on('SIGINT', () => {
    console.error("MCP Server shutting down");
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.error("MCP Server shutting down");
    process.exit(0);
});