import createMatrix from "../util/createMatrix.js";
import { getIdxByColor } from "../colors.js";
import type App from "./App.js";
import type { Size } from "./Canvas.js";
import type mongodb from "mongodb";
import type { AnyLogSchema, LogSchemas, FillLogSchema } from "../typings/LogTypings.js";

type LogCursorDocument<T, U extends object | never> = ({ _id: T } & U)[];
type LogCursorFn<T, U extends object | never> = (count: number) => Promise<LogCursorDocument<T, U> | null>;

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
      let result = await this.saveLog(cache, this.loggingIdx);
      if (result) {
        this.loggingIdx++;
      }
    }
    await this.collection.updateOne(
      { _id: "loggingIdx" },
      { $set: { idx: this.loggingIdx } },
      { upsert: true }
    );
    this.toLog = [];
  }

  private async saveLog(toLog: AnyLogSchema, idx: number | string) {
    if (idx === null) return false;

    await this.collection.updateOne(
      { _id: idx.toString() },
      { $set: toLog },
      { upsert: true }
    );
    return true;
  }

  addLog<T extends keyof LogSchemas>(type: T, toLog: LogSchemas[T]) {
    toLog = {
      ...toLog,
      type,
      time: new Date().getTime()
    };
    this.toLog.push(toLog);
  }

  createLogCursor(filter: mongodb.Filter<mongodb.Document>) {
    const findCursor = this.collection.find(filter);
    return async function(count: number) {
      if (!(await findCursor.hasNext())) return null;
      let datas = [];
      for (let i = 0; i < count; i++) {
        const next = await findCursor.next();
        if (next === null) break;
        datas.push(next);
      }
      if (datas.length > 0) {
        return datas;
      } else {
        return null;
      }
    } as unknown as LogCursorFn<string, never>;
  }

  async hideFillLogFromUser(id: string) {
    const getFillLog: LogCursorFn<string, FillLogSchema> = this.createLogCursor({ type: "Fill", userId: id });
    while (true) {
      const fillLogs = await getFillLog(100);
      if (fillLogs === null) return;
      for (const fillLog of fillLogs) {
        fillLog.hidden = true;
        this.saveLog(fillLog, fillLog._id);
      }
    }
  }

  async recreateCanvasWithoutHidden(size: Size) {
    const getFillLog: LogCursorFn<string, FillLogSchema> = this.createLogCursor({ type: "Fill" });
    const canvas = createMatrix(size.width, size.height, -1 as number);
    while (true) {
      const fillLogs = await getFillLog(100);
      if (fillLogs === null) break;
      for (const fillLog of fillLogs) {
        if (fillLog.hidden) continue;
        canvas[fillLog.y][fillLog.x] = getIdxByColor(fillLog.color);
      }
    }
    return canvas;
  }

  async createUserIdBlameMatrix(size: Size) {
    const getFillLog: LogCursorFn<string, FillLogSchema> = this.createLogCursor({ type: "Fill" });
    const canvas = createMatrix(size.width, size.height, "-1" as string);
    while (true) {
      const fillLogs = await getFillLog(100);
      if (fillLogs === null) break;
      for (const fillLog of fillLogs) {
        if (fillLog.hidden) continue;
        canvas[fillLog.y][fillLog.x] = fillLog.userId;
      }
    }
    return canvas;
  }
}

export default Logger;
