import Canvas from "./Canvas.js";
import UserCaches from "./UserCaches.js";
import GuildCaches from "./GuildCaches.js";
import SaveManager, { Collection } from "./SaveManager.js";
import Logger from "./Logger.js";

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
    log: Collection;
  };
}

class App {
  config: AppConfig;
  canvas: Canvas;
  userCaches: UserCaches;
  guildCaches: GuildCaches;
  saveManager: SaveManager;
  logger: Logger;
  saving: boolean;

  constructor(options: AppOptions) {
    this.config = options.config;
    this.canvas = new Canvas(this, this.config.size);
    this.userCaches = new UserCaches(this, { cacheCleanupTimeout: 100_000 });
    this.guildCaches = new GuildCaches(this);
    this.saveManager = new SaveManager(this, options.collections.data);
    this.logger = new Logger(this, options.collections.log);

    this.saving = false;

    this.init();
  }
  
  async init() {
    // Load pixels
    const pixels = await this.saveManager.loadCanvas();
    this.canvas.init(pixels);
    this.guildCaches.updateMessageOptions();
    return true;
  }

  async save() {
    if (this.saving) return;
    this.saving = true;

    await this.saveManager.saveCanvas();
    await this.userCaches.cleanupCache();
    for (const id in this.userCaches.cache) {
      await this.userCaches.saveUser(id);
    }
    for (const id in this.guildCaches.cache) {
      await this.guildCaches.saveGuild(id);
    }
    await this.logger.save();

    this.saving = false;
  }
}

export default App;
