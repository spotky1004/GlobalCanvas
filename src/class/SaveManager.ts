import deepcopy from "deepcopy";
import App from "./App.js";
import type mongodb from "mongodb";
import type { UserData } from "./User.js";
import type { GuildData } from "./Guild.js";

export type Collection = mongodb.Collection<mongodb.Document>;

function matrix2String(matrix: number[][]) {
  return [...matrix].map(v => v.join(",")).join("|");
}
function string2Matrix(data: string) {
  return data.split("|").map(v => v.split(",").map(v => Number(v)));
}
const getUserDocumentId = (id: string) => `u_${id}`;
const getGuildDocumentId = (id: string) => `g_${id}`;

class SaveManager {
  app: App;
  collection: Collection;

  constructor(app: App, collection: Collection) {
    this.app = app;
    this.collection = collection;
  }

  private async getDocumnet<T extends object>(id: string, defaultData: T) {
    const gotDocument = await this.collection.findOne({ _id: id });
    let data = deepcopy(defaultData);
    if (gotDocument !== null) {
      const gotDocumnetWithoutId: Omit<typeof gotDocument, "_id"> = gotDocument;
      delete gotDocumnetWithoutId.id;
      data = {...data, ...gotDocumnetWithoutId};
    }
    return data;
  }

  private async updateDocument(id: string, data: {[key: string]: any}) {
    const result = await this.collection.updateOne(
      { _id: id },
      { $set: data },
      { upsert: true }
    );
    return result.acknowledged;
  }

  async loadPixels() {
    const size = this.app.config.size;
    const defaultPixels: number[][] = new Array(size.height).fill(undefined).map(_ => new Array(size.width).fill(-1));
    const data = await this.getDocumnet("canvas", {
      pixels: matrix2String(defaultPixels)
    });
    const prevPixels = string2Matrix(data.pixels);
    for (let y = 0; y < size.height; y++) {
      for (let x = 0; x < size.height; x++) {
        defaultPixels[y][x] = typeof prevPixels[y] !== "undefined" ? prevPixels[y][x] ?? -1 : -1;
      }
    }
    return defaultPixels;
  }

  async savePixels() {
    const pixels = this.app.pixels;
    return await this.updateDocument("canvas", {
      pixels: matrix2String(pixels)
    });
  }

  async loadUser(id: string) {
    const defaultData: UserData = {
      id,
      lastFill: 0
    };
    return await this.getDocumnet(getUserDocumentId(id), defaultData);
  }

  async saveUser(id: string, data: UserData) {
    return await this.updateDocument(getUserDocumentId(id), data);
  }

  async loadGuild(id: string) {
    const defaultData: GuildData = {
      id,
      connectedChannelId: "-1"
    };
    return await this.getDocumnet(getGuildDocumentId(id), defaultData);
  }

  async saveGuild(id: string, data: GuildData) {
    return await this.updateDocument(getGuildDocumentId(id), data);
  }
}

export default SaveManager;
