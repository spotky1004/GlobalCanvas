import DisplayCanvas from "./DisplayCanvas.js";
import UserCaches from "./UserCaches.js";
import GuildCaches from "./GuildCaches.js";
import SaveManager from "./SaveManager.js";
import Logger from "./Logger.js";
import { getColorByIdx } from "../colors.js";
class App {
    constructor(options) {
        this.config = options.config;
        this.canvas = new Array(this.config.size.height).fill(null).map(_ => new Array(this.config.size.width).fill(-1));
        this.displayCanvas = new DisplayCanvas(this.config.size, 10);
        this.userCaches = new UserCaches(this, { cacheCleanupTimeout: 100000 });
        this.guildCaches = new GuildCaches(this);
        this.saveManager = new SaveManager(this, options.collections.data);
        this.logger = new Logger(this, options.collections.log);
        this.saving = false;
        this.init();
    }
    async init() {
        // Load pixels
        const pixels = await this.saveManager.loadCanvas();
        this.canvas = [...pixels].map(row => [...row]);
        this.displayCanvas.loadData(this.canvas);
        this.guildCaches.updateMessageOptions();
        return true;
    }
    async save() {
        if (this.saving)
            return;
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
    fillPixel(userId, guildId, colorIdx, x, y) {
        const result = this.displayCanvas.fillPixel(colorIdx, x, y);
        if (result) {
            this.canvas[y][x] = colorIdx;
            this.guildCaches.updateMessageOptions();
            const color = getColorByIdx(colorIdx);
            if (color !== null) {
                this.logger.addLog("Fill", {
                    x,
                    y,
                    color,
                    userId,
                    guildId,
                });
            }
        }
        return result;
    }
}
export default App;
