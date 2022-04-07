import mongodb from "mongodb";
import deepcopy from "deepcopy";
import App from "./App.js";

export type Collection = mongodb.Collection<mongodb.Document>;

function matrix2String(matrix: number[][]) {
  return [...matrix].map(v => v.join(",")).join("|");
}
function string2Matrix(data: string) {
  return data.split("|").map(v => v.split(",").map(v => Number(v)));
}


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
    const size = this.app.size;
    const defaultPixels: number[][] = new Array(size.height).fill(undefined).map(_ => new Array(size.width).fill(-1));
    const data = await this.getDocumnet("canvas", {
      pixels: matrix2String(defaultPixels)
    });
    return string2Matrix(data.pixels);
  }

  async savePixels() {
    const pixels = this.app.pixels;
    return await this.updateDocument("canvas", {
      pixels: matrix2String(pixels)
    });
  }
}

export default SaveManager;
