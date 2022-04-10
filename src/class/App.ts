import DisplayCanvas from "./DisplayCanvas.js";
import UserCaches from "./UserCaches.js";
import GuildCaches from "./GuildCaches.js";
import SaveManager, { Collection } from "./SaveManager.js";
import FillLogger from "./FillLogger.js";
import { getColorByIdx } from "../colors.js";

interface AppConfig {
  size: {
    width: number;
    height: number;
  };
  fillCooldown: number;
}
interface AppOptions {
  config: AppConfig;
  collections: {
    data: Collection;
    fillLog: Collection;
  };
}

class App {
  config: AppConfig;
  pixels: number[][];
  canvas: DisplayCanvas;
  userCaches: UserCaches;
  guildCaches: GuildCaches;
  saveManager: SaveManager;
  fillLogger: FillLogger;
  saving: boolean;

  constructor(options: AppOptions) {
    this.config = options.config;
    this.pixels = new Array(this.config.size.height).fill(null).map(_ => new Array(this.config.size.width).fill(-1));
    this.canvas = new DisplayCanvas(this.config.size, 10);
    this.userCaches = new UserCaches(this, { cacheCleanupTimeout: 100_000 });
    this.guildCaches = new GuildCaches(this);
    this.saveManager = new SaveManager(this, options.collections.data);
    this.fillLogger = new FillLogger(this, options.collections.fillLog);

    this.saving = false;

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
    if (this.saving) return;
    this.saving = true;

    await this.saveManager.savePixels();
    await this.userCaches.cleanupCache();
    for (const id in this.userCaches.cache) {
      await this.userCaches.saveUser(id);
    }
    for (const id in this.guildCaches.cache) {
      await this.guildCaches.saveGuild(id);
    }
    await this.fillLogger.save();

    this.saving = false;
  }

  fillPixel(authorId: string, colorIdx: number, x: number, y: number) {
    const result = this.canvas.fillPixel(colorIdx, x, y);
    if (result) {
      this.pixels[y][x] = colorIdx;
      this.guildCaches.updateMessageOptions();
      const color = getColorByIdx(colorIdx);
      if (color !== null) {
        this.fillLogger.addFillLog(authorId, color, x, y);
      }
    }
    return result;
  }
}

export default App;
