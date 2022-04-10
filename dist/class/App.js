import DisplayCanvas from "./DisplayCanvas.js";
import UserCaches from "./UserCaches.js";
import GuildCaches from "./GuildCaches.js";
import SaveManager from "./SaveManager.js";
import Logger from "./Logger.js";
import { getColorByIdx } from "../colors.js";
class App {
    constructor(options) {
        this.config = options.config;
        this.pixels = new Array(this.config.size.height).fill(null).map(_ => new Array(this.config.size.width).fill(-1));
        this.canvas = new DisplayCanvas(this.config.size, 10);
        this.userCaches = new UserCaches(this, { cacheCleanupTimeout: 100000 });
        this.guildCaches = new GuildCaches(this);
        this.saveManager = new SaveManager(this, options.collections.data);
        this.logger = new Logger(this, options.collections.log);
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
        if (this.saving)
            return;
        this.saving = true;
        await this.saveManager.savePixels();
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
    fillPixel(authorId, colorIdx, x, y) {
        const result = this.canvas.fillPixel(colorIdx, x, y);
        if (result) {
            this.pixels[y][x] = colorIdx;
            this.guildCaches.updateMessageOptions();
            const color = getColorByIdx(colorIdx);
            if (color !== null) {
                this.logger.addFillLog(authorId, color, x, y);
            }
        }
        return result;
    }
}
export default App;
