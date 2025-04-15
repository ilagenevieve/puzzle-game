/**
 * Asset Manifest
 * Defines all game assets with their metadata
 */

// Base asset path (can be changed based on environment)
const BASE_PATH = '/assets/game/';

/**
 * Asset definitions for common game elements
 */
export const CommonAssets = [
  {
    key: 'ocean-background',
    type: 'image',
    url: `${BASE_PATH}common/ocean-background.png`,
    description: 'Ocean gradient background'
  },
  {
    key: 'wave-overlay',
    type: 'image',
    url: `${BASE_PATH}common/wave-overlay.png`,
    description: 'Wave pattern overlay'
  },
  {
    key: 'bubble',
    type: 'image',
    url: `${BASE_PATH}common/bubble.png`,
    description: 'Bubble particle'
  },
  {
    key: 'ui-elements',
    type: 'atlas',
    textureURL: `${BASE_PATH}ui/ui-elements.png`,
    atlasURL: `${BASE_PATH}ui/ui-elements.json`,
    description: 'Common UI elements atlas'
  },
  {
    key: 'ocean-font',
    type: 'bitmapFont',
    textureURL: `${BASE_PATH}fonts/ocean-font.png`,
    fontDataURL: `${BASE_PATH}fonts/ocean-font.xml`,
    description: 'Ocean theme bitmap font'
  }
];

/**
 * Asset definitions for sound effects
 */
export const SoundAssets = [
  {
    key: 'click',
    type: 'audio',
    url: `${BASE_PATH}audio/click.mp3`,
    description: 'UI click sound'
  },
  {
    key: 'splash',
    type: 'audio',
    url: `${BASE_PATH}audio/splash.mp3`,
    description: 'Water splash sound'
  },
  {
    key: 'win',
    type: 'audio',
    url: `${BASE_PATH}audio/win.mp3`,
    description: 'Victory sound'
  },
  {
    key: 'lose',
    type: 'audio',
    url: `${BASE_PATH}audio/lose.mp3`,
    description: 'Defeat sound'
  }
];

/**
 * Asset definitions for Nim game
 */
export const NimAssets = [
  {
    key: 'nim-objects',
    type: 'spritesheet',
    url: `${BASE_PATH}nim/nim-objects.png`,
    frameWidth: 64,
    frameHeight: 64,
    description: 'Nim game objects spritesheet'
  },
  {
    key: 'nim-background',
    type: 'image',
    url: `${BASE_PATH}nim/nim-background.png`,
    description: 'Nim game background'
  }
];

/**
 * Asset definitions for Domineering game
 */
export const DomineeringAssets = [
  {
    key: 'domineering-tiles',
    type: 'spritesheet',
    url: `${BASE_PATH}domineering/domineering-tiles.png`,
    frameWidth: 64,
    frameHeight: 64,
    description: 'Domineering game tiles'
  },
  {
    key: 'domineering-background',
    type: 'image',
    url: `${BASE_PATH}domineering/domineering-background.png`,
    description: 'Domineering game background'
  }
];

/**
 * Asset definitions for Dots and Boxes game
 */
export const DotsAndBoxesAssets = [
  {
    key: 'dots-and-boxes-elements',
    type: 'spritesheet',
    url: `${BASE_PATH}dots-and-boxes/elements.png`,
    frameWidth: 32,
    frameHeight: 32,
    description: 'Dots and Boxes game elements'
  },
  {
    key: 'dots-and-boxes-background',
    type: 'image',
    url: `${BASE_PATH}dots-and-boxes/background.png`,
    description: 'Dots and Boxes game background'
  }
];

/**
 * Full asset manifest
 */
export const AssetManifest = {
  common: CommonAssets,
  sound: SoundAssets,
  nim: NimAssets,
  domineering: DomineeringAssets,
  dotsAndBoxes: DotsAndBoxesAssets
};