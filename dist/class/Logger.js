class Logger {
    constructor(app, collection) {
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
        }
        else {
            this.loggingIdx = 0;
        }
    }
    async save() {
        if (this.loggingIdx === null)
            return;
        for (const cache of this.toLog) {
            await this.saveLog(cache);
        }
        await this.collection.updateOne({ _id: "loggingIdx" }, { $set: { idx: this.loggingIdx } }, { upsert: true });
        this.toLog = [];
    }
    async saveLog(toLog) {
        if (this.loggingIdx === null)
            return;
        await this.collection.updateOne({ _id: this.loggingIdx.toString() }, { $set: toLog }, { upsert: true });
        this.loggingIdx++;
    }
    addLog(type, toLog) {
        toLog = Object.assign(Object.assign({}, toLog), { type, time: new Date().getTime() });
        this.toLog.push(toLog);
    }
}
export default Logger;
