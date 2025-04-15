/**
 * Asset Loader
 * Handles loading and management of game assets
 */
export default class AssetLoader {
  /**
   * Create a new asset loader
   * @param {Phaser.Scene} scene - The Phaser scene to load assets into
   */
  constructor(scene) {
    this.scene = scene;
    this.assetMap = new Map();
    this.assetGroups = new Map();
    this.isLoading = false;
    this.progress = 0;
    this.assetsLoaded = false;
    
    // Bind scene load events
    this.bindEvents();
  }
  
  /**
   * Bind to scene load events
   */
  bindEvents() {
    this.scene.load.on('progress', value => {
      this.progress = value;
      this.scene.events.emit('loadProgress', value);
    });
    
    this.scene.load.on('complete', () => {
      this.isLoading = false;
      this.assetsLoaded = true;
      this.scene.events.emit('assetsLoaded');
    });
  }
  
  /**
   * Register a set of assets to be loaded
   * @param {string} groupName - Name of the asset group
   * @param {Array} assets - Array of asset definitions
   */
  registerAssets(groupName, assets) {
    this.assetGroups.set(groupName, assets);
    
    // Add each asset to the asset map
    assets.forEach(asset => {
      this.assetMap.set(asset.key, {
        ...asset,
        group: groupName,
        loaded: false
      });
    });
  }
  
  /**
   * Load all registered assets
   * @param {Array} groups - Optional array of group names to load (loads all if omitted)
   * @returns {Promise} A promise that resolves when assets are loaded
   */
  loadAll(groups = null) {
    if (this.isLoading) {
      console.warn('Asset loading already in progress');
      return;
    }
    
    this.isLoading = true;
    this.progress = 0;
    
    const groupsToLoad = groups || Array.from(this.assetGroups.keys());
    
    // For each group, load all assets
    for (const groupName of groupsToLoad) {
      const assets = this.assetGroups.get(groupName);
      if (!assets) {
        console.warn(`Asset group '${groupName}' not found`);
        continue;
      }
      
      this.loadGroup(assets);
    }
    
    // Start loading
    return new Promise((resolve, reject) => {
      if (this.scene.load.list.entries.length === 0) {
        // No assets to load
        this.isLoading = false;
        this.progress = 1;
        this.assetsLoaded = true;
        resolve();
        return;
      }
      
      this.scene.load.once('complete', () => {
        resolve();
      });
      
      this.scene.load.once('loaderror', (file) => {
        reject(new Error(`Failed to load asset: ${file.key}`));
      });
      
      this.scene.load.start();
    });
  }
  
  /**
   * Load a specific group of assets
   * @param {Array} assets - Array of asset definitions
   */
  loadGroup(assets) {
    for (const asset of assets) {
      this.loadAsset(asset);
    }
  }
  
  /**
   * Load a single asset
   * @param {Object} asset - Asset definition
   */
  loadAsset(asset) {
    // Skip if already loaded
    if (this.isAssetLoaded(asset.key)) {
      return;
    }
    
    // Load based on type
    switch (asset.type) {
      case 'image':
        this.scene.load.image(asset.key, asset.url);
        break;
      
      case 'spritesheet':
        this.scene.load.spritesheet(asset.key, asset.url, {
          frameWidth: asset.frameWidth,
          frameHeight: asset.frameHeight,
          startFrame: asset.startFrame || 0,
          endFrame: asset.endFrame || -1,
          margin: asset.margin || 0,
          spacing: asset.spacing || 0
        });
        break;
      
      case 'atlas':
        this.scene.load.atlas(
          asset.key,
          asset.textureURL,
          asset.atlasURL
        );
        break;
      
      case 'audio':
        this.scene.load.audio(asset.key, asset.url);
        break;
      
      case 'video':
        this.scene.load.video(asset.key, asset.url);
        break;
      
      case 'tilemapTiledJSON':
        this.scene.load.tilemapTiledJSON(asset.key, asset.url);
        break;
      
      case 'bitmapFont':
        this.scene.load.bitmapFont(
          asset.key,
          asset.textureURL,
          asset.fontDataURL
        );
        break;
      
      default:
        console.warn(`Unknown asset type: ${asset.type}`);
    }
    
    // Mark as queued for loading
    const assetInfo = this.assetMap.get(asset.key);
    if (assetInfo) {
      assetInfo.queued = true;
    }
  }
  
  /**
   * Check if an asset is loaded
   * @param {string} key - Asset key
   * @returns {boolean} True if the asset is loaded
   */
  isAssetLoaded(key) {
    const assetInfo = this.assetMap.get(key);
    if (!assetInfo) return false;
    
    // Check if it's actually loaded in Phaser
    const cache = this.getAssetCache(assetInfo.type);
    return cache && cache.exists(key);
  }
  
  /**
   * Get the appropriate cache for an asset type
   * @param {string} type - Asset type
   * @returns {Phaser.Cache.BaseCache} The cache for this asset type
   */
  getAssetCache(type) {
    switch (type) {
      case 'image':
      case 'spritesheet':
      case 'atlas':
        return this.scene.textures;
      
      case 'audio':
        return this.scene.cache.audio;
      
      case 'video':
        return this.scene.cache.video;
      
      case 'tilemapTiledJSON':
        return this.scene.cache.tilemap;
      
      case 'bitmapFont':
        return this.scene.cache.bitmapFont;
      
      default:
        return null;
    }
  }
  
  /**
   * Get an asset by key
   * @param {string} key - Asset key
   * @returns {Object} Asset info
   */
  getAsset(key) {
    return this.assetMap.get(key);
  }
  
  /**
   * Get all assets in a group
   * @param {string} groupName - Group name
   * @returns {Array} Array of assets
   */
  getAssetsInGroup(groupName) {
    return Array.from(this.assetMap.values())
      .filter(asset => asset.group === groupName);
  }
  
  /**
   * Get loading progress
   * @returns {number} Progress from 0 to 1
   */
  getProgress() {
    return this.progress;
  }
  
  /**
   * Check if all assets are loaded
   * @returns {boolean} True if all assets are loaded
   */
  areAllAssetsLoaded() {
    return this.assetsLoaded;
  }
  
  /**
   * Destroy and clean up
   */
  destroy() {
    this.scene.load.off('progress');
    this.scene.load.off('complete');
    this.assetMap.clear();
    this.assetGroups.clear();
  }
}