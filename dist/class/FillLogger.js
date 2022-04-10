class FillLogger {
    constructor(app, collection) {
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
        }
    }
    async save() {
        if (this.loggingIdx === null)
            return;
        for (let i = 0; i < this.logCache.length; i++) {
            await this.saveLog(this.logCache[i]);
        }
        await this.collection.updateOne({ _id: "loggingIdx" }, { $set: { idx: this.loggingIdx.toString() } }, { upsert: true });
        this.logCache = [];
    }
    async saveLog(toLog) {
        if (this.loggingIdx === null)
            return;
        const data = { data: toLog };
        await this.collection.updateOne({ _id: this.loggingIdx.toString() }, { $set: data }, { upsert: true });
        this.loggingIdx++;
    }
    addFillLog(userId, colorHex, x, y) {
        this.logCache.push(`[Fill] ${colorHex} (${x}, ${y}) By ${userId}`);
    }
}
export default FillLogger;
