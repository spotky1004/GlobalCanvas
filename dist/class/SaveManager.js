import deepcopy from "deepcopy";
function matrix2String(matrix) {
    return [...matrix].map(v => v.join(",")).join("|");
}
function string2Matrix(data) {
    return data.split("|").map(v => v.split(",").map(v => Number(v)));
}
const getUserDocumentId = (id) => `u_${id}`;
const getGuildDocumentId = (id) => `g_${id}`;
class SaveManager {
    constructor(app, collection) {
        this.app = app;
        this.collection = collection;
    }
    async getDocumnet(id, defaultData) {
        const gotDocument = await this.collection.findOne({ _id: id });
        let data = deepcopy(defaultData);
        if (gotDocument !== null) {
            const gotDocumnetWithoutId = gotDocument;
            delete gotDocumnetWithoutId.id;
            data = Object.assign(Object.assign({}, data), gotDocumnetWithoutId);
        }
        return data;
    }
    async updateDocument(id, data) {
        const result = await this.collection.updateOne({ _id: id }, { $set: data }, { upsert: true });
        return result.acknowledged;
    }
    async loadCanvas() {
        var _a;
        const size = this.app.config.size;
        const defaultCanvas = new Array(size.height).fill(undefined).map(_ => new Array(size.width).fill(-1));
        const data = await this.getDocumnet("canvas", {
            pixels: matrix2String(defaultCanvas)
        });
        const prevCanvas = string2Matrix(data.pixels);
        for (let y = 0; y < size.height; y++) {
            for (let x = 0; x < size.height; x++) {
                defaultCanvas[y][x] = typeof prevCanvas[y] !== "undefined" ? (_a = prevCanvas[y][x]) !== null && _a !== void 0 ? _a : -1 : -1;
            }
        }
        return defaultCanvas;
    }
    async saveCanvas() {
        const canvas = this.app.canvas;
        return await this.updateDocument("canvas", {
            pixels: matrix2String(canvas)
        });
    }
    async loadUser(id) {
        const defaultData = {
            id,
            lastFill: 0
        };
        return await this.getDocumnet(getUserDocumentId(id), defaultData);
    }
    async saveUser(id, data) {
        return await this.updateDocument(getUserDocumentId(id), data);
    }
    async loadGuild(id) {
        const defaultData = {
            id,
            connectedChannelId: "-1"
        };
        return await this.getDocumnet(getGuildDocumentId(id), defaultData);
    }
    async saveGuild(id, data) {
        return await this.updateDocument(getGuildDocumentId(id), data);
    }
}
export default SaveManager;
