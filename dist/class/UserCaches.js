import User from "./User.js";
class UserCaches {
    constructor(app, options) {
        this.app = app;
        this.options = options;
        this.cache = {};
    }
    async fetchUser(id) {
        const userData = await this.app.saveManager.loadUser(id);
        const user = new User(this.app, userData);
        this.cache[id] = user;
        return user;
    }
    async getUser(id) {
        if (this.cache.hasOwnProperty(id)) {
            return this.cache[id];
        }
        else {
            return await this.fetchUser(id);
        }
    }
    async saveUser(id) {
        return await this.app.saveManager.saveUser(id, this.cache[id].data);
    }
    async cleanupCache() {
        const cacheCleanupTimeout = this.options.cacheCleanupTimeout;
        const time = Date.now();
        if (typeof cacheCleanupTimeout === "undefined")
            return;
        for (const id in this.cache) {
            const user = this.cache[id];
            const lastActive = user.lastActive;
            if (time - lastActive > cacheCleanupTimeout) {
                await this.saveUser(id);
                delete this.cache[id];
            }
        }
    }
}
export default UserCaches;
