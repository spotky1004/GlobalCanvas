import DisplayCanvas from "./DisplayCanvas.js";
import UserCaches from "./UserCaches.js";
import GuildCaches from "./GuildCaches.js";
import SaveManager, { Collection } from "./SaveManager.js";

interface AppConfig {
  size: {
    width: number;
    height: number;
  };
  fillCooldown: number;
}
interface AppOptions {
  config: AppConfig;
  collection: Collection;
}

class App {
  config: AppConfig;
  pixels: number[][];
  canvas: DisplayCanvas;
  userCaches: UserCaches;
  guildCaches: GuildCaches;
  saveManager: SaveManager;

  constructor(options: AppOptions) {
    this.config = options.config;
    this.pixels = new Array(this.config.size.height).fill(null).map(_ => new Array(this.config.size.width).fill(-1));
    this.canvas = new DisplayCanvas(this.config.size, 10);
    this.userCaches = new UserCaches(this, { cacheCleanupTimeout: 100_000 });
    this.guildCaches = new GuildCaches(this);
    this.saveManager = new SaveManager(this, options.collection);

    this.init();
  }
  
  async init() {
    // Load pixels
    const pixels = await this.saveManager.loadPixels();
    this.pixels = [...pixels].map(row => [...row]);
    this.canvas.loadData(this.pixels);
    this.guildCaches.updateMessageOptions();
    return true;
  }

  async save() {
    this.saveManager.savePixels();
    for (const id in this.userCaches.cache) {
      this.userCaches.saveUser(id);
    }
    for (const id in this.guildCaches.cache) {
      this.guildCaches.saveGuild(id);
    }
  }

  fillPixel(colorIdx: number, x: number, y: number) {
    const result = this.canvas.fillPixel(colorIdx, x, y);
    if (result) {
      this.pixels[y][x] = colorIdx;
      this.guildCaches.updateMessageOptions();
    }
    return result;
  }
}

export default App;
