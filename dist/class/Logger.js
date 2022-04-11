class Logger {
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
            const cache = this.logCache[i];
            await this.saveLog(cache[0], cache[1]);
        }
        await this.collection.updateOne({ _id: "loggingIdx" }, { $set: { idx: this.loggingIdx.toString() } }, { upsert: true });
        this.logCache = [];
    }
    async saveLog(toLog, time) {
        if (this.loggingIdx === null)
            return;
        const data = { data: toLog, time };
        await this.collection.updateOne({ _id: this.loggingIdx.toString() }, { $set: data }, { upsert: true });
        this.loggingIdx++;
    }
    addLog(toLog) {
        this.logCache.push([toLog, new Date().getTime()]);
    }
    addFillLog(userId, colorHex, x, y) {
        this.addLog(`[Fill] ${colorHex} (${x}, ${y}) [By ${userId}]`);
    }
    addConnectLog(userId, guildId, channelId) {
        this.addLog(`[Connect] Guild ${guildId} -> Channel ${channelId} [By ${userId}]`);
    }
    addZoomLog(userId, x, y, width, height) {
        this.addLog(`[Zoom] x: ${x}, y: ${y}, width: ${width}, height: ${height} [By ${userId}]`);
    }
}
export default Logger;
