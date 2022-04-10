import App from "./App.js";
import User from "./User.js";

interface UserCachesOptions {
  cacheCleanupTimeout?: number;
}

class UserCaches {
  app: App;
  options: UserCachesOptions;
  cache: {[id: string]: User};

  constructor(app: App, options: UserCachesOptions) {
    this.app = app;
    this.options = options;
    this.cache = {};
  }

  private async fetchUser(id: string) {
    const userData = await this.app.saveManager.loadUser(id);
    const user = new User(this.app, userData);
    this.cache[id] = user;
    return user;
  }

  async saveUser(id: string) {
    return await this.app.saveManager.saveUser(id, this.cache[id].data);
  }

  async getUser(id: string) {
    if (this.cache.hasOwnProperty(id)) {
      return this.cache[id];
    } else {
      return await this.fetchUser(id);
    }
  }

  async cleanupCache() {
    const cacheCleanupTimeout = this.options.cacheCleanupTimeout;
    const time = Date.now();
    if (typeof cacheCleanupTimeout === "undefined") return;
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
