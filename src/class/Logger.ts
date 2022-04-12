import type App from "./App.js";
import type mongodb from "mongodb";

interface FillLogSchema {
  type?: "Fill";
  time?: number;
  color: string;
  x: number;
  y: number;
  userId: string;
  guildId: string;
}
interface ZoomLogSchema {
  type?: "Zoom";
  time?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  userId: string;
  guildId: string;
}
interface ConnectLogSchema {
  type?: "Connect";
  time?: number;
  userId: string;
  guildId: string;
  channelId: string;
}

interface LogSchemas {
  "Fill": FillLogSchema;
  "Zoom": ZoomLogSchema;
  "Connect": ConnectLogSchema;
}
type AnyLogSchema = LogSchemas[keyof LogSchemas];

type Collection = mongodb.Collection<mongodb.Document>;

class Logger {
  app: App;
  collection: Collection;
  loggingIdx: number | null;
  toLog: AnyLogSchema[];

  constructor(app: App, collection: Collection) {
    this.app = app;
    this.collection = collection;
    this.loggingIdx = null;
    this.toLog = [];

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
    
    for (const cache of this.toLog) {
      await this.saveLog(cache);
    }
    await this.collection.updateOne(
      { _id: "loggingIdx" },
      { $set: { idx: this.loggingIdx } },
      { upsert: true }
    );
    this.toLog = [];
  }

  private async saveLog(toLog: AnyLogSchema) {
    if (this.loggingIdx === null) return;

    await this.collection.updateOne(
      { _id: this.loggingIdx.toString() },
      { $set: toLog },
      { upsert: true }
    );
    this.loggingIdx++;
  }

  addLog<T extends keyof LogSchemas>(type: T, toLog: LogSchemas[T]) {
    toLog = {
      ...toLog,
      type,
      time: new Date().getTime()
    };
    this.toLog.push(toLog);
  }
}

export default Logger;
