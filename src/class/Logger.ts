import type App from "./App.js";
import type mongodb from "mongodb";

type Collection = mongodb.Collection<mongodb.Document>;

class Logger {
  app: App;
  collection: Collection;
  loggingIdx: number | null;
  logCache: [string, number][];

  constructor(app: App, collection: Collection) {
    this.app = app;
    this.collection = collection;
    this.loggingIdx = null;
    this.logCache = [];

    this.setLoggingIdx();
  }

  async setLoggingIdx() {
    const gotDocument = await this.collection.findOne({ _id: "loggingIdx" });

    if (gotDocument !== null) {
      this.loggingIdx = gotDocument.idx;
    } else {
      this.loggingIdx = 0;
    }
  }

  async save() {
    if (this.loggingIdx === null) return;
    
    for (let i = 0; i < this.logCache.length; i++) {
      const cache = this.logCache[i];
      await this.saveLog(cache[0], cache[1]);
    }
    await this.collection.updateOne(
      { _id: "loggingIdx" },
      { $set: { idx: this.loggingIdx.toString() } },
      { upsert: true }
    );
    this.logCache = [];
  }

  private async saveLog(toLog: string, time: number) {
    if (this.loggingIdx === null) return;

    const data = { data: toLog, time };
    await this.collection.updateOne(
      { _id: this.loggingIdx.toString() },
      { $set: data },
      { upsert: true }
    );
    this.loggingIdx++;
  }

  addLog(toLog: string) {
    this.logCache.push([toLog, new Date().getTime()]);
  }

  addFillLog(userId: string, colorHex: string, x: number, y: number) {
    this.addLog(`[Fill] ${colorHex} (${x}, ${y}) [By ${userId}]`);
  }

  addConnectLog(userId: string, guildId: string, channelId: string) {
    this.addLog(`[Connect] Guild ${guildId} -> Channel ${channelId} [By ${userId}]`);
  }

  addZoomLog(userId: string, x: number, y: number, width: number, height: number) {
    this.addLog(`[Zoom] x: ${x}, y: ${y}, width: ${width}, height: ${height} [By ${userId}]`);
  }
}

export default Logger;
