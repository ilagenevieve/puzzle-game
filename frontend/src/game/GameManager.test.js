import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import gameManager from './GameManager'

// Mock Phaser
vi.mock('phaser', () => {
  return {
    default: {
      AUTO: 'auto',
      Scale: {
        FIT: 'fit',
        CENTER_BOTH: 'center-both'
      },
      Game: vi.fn().mockImplementation(() => ({
        scene: {
          add: vi.fn(),
          remove: vi.fn(),
          start: vi.fn(),
          getScene: vi.fn().mockReturnValue({}),
          scenes: [],
        },
        destroy: vi.fn()
      })),
    }
  }
})

// Mock scenes
vi.mock('./scenes/TestScene', () => ({ default: class TestScene {} }))
vi.mock('./scenes/NimGame', () => ({ default: class NimGame {} }))

// Mock game state manager
vi.mock('./GameStateManager', () => ({
  default: {
    startNewGame: vi.fn().mockReturnValue('game-123'),
    loadGame: vi.fn(),
    saveGame: vi.fn()
  }
}))

describe('GameManager', () => {
  let mockGame

  beforeEach(() => {
    mockGame = {
      scene: {
        add: vi.fn(),
        remove: vi.fn(),
        start: vi.fn(),
        getScene: vi.fn().mockReturnValue({}),
        scenes: []
      },
      destroy: vi.fn()
    }
    
    // Reset state of gameManager
    gameManager.game = null
    gameManager.state.set({ initialized: false })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('init() initializes the game manager with a Phaser instance', () => {
    const result = gameManager.init(mockGame)
    
    expect(result).toBe(true)
    expect(gameManager.game).toBe(mockGame)
    
    // Check state was updated
    const state = {}
    gameManager.state.subscribe(s => Object.assign(state, s))()
    expect(state.initialized).toBe(true)
  })

  test('addScenes() adds all scenes to the game', () => {
    gameManager.game = mockGame
    gameManager.addScenes()
    
    // We have 2 mock scenes
    expect(mockGame.scene.add).toHaveBeenCalledTimes(2)
  })

  test('startScene() starts the requested scene', () => {
    gameManager.game = mockGame
    
    gameManager.startScene('TestScene', { test: true })
    
    expect(mockGame.scene.start).toHaveBeenCalledWith('TestScene', { test: true })
  })

  test('startNimGame() starts a Nim game with the provided options', () => {
    gameManager.game = mockGame
    
    const gameId = gameManager.startNimGame({ aiOpponent: true })
    
    expect(gameId).toBe('game-123')
    expect(mockGame.scene.start).toHaveBeenCalledWith('NimGame', expect.objectContaining({
      aiOpponent: true,
      gameId: 'game-123'
    }))
  })

  test('destroy() cleans up the game instance', () => {
    gameManager.game = mockGame
    
    gameManager.destroy()
    
    expect(mockGame.destroy).toHaveBeenCalledWith(true)
    expect(gameManager.game).toBeNull()
  })
})