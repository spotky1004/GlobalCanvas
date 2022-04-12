import Guild from "./Guild.js";
import Discord from "discord.js";
class GuildCaches {
    constructor(app) {
        this.app = app;
        this.cache = {};
        this.messageOptions = {};
    }
    getConnectedChannels() {
        return Object.values(this.cache)
            .map(guild => guild.connectedChannel)
            .filter(channel => channel !== null);
    }
    async fetchGuild(id) {
        const guildData = await this.app.saveManager.loadGuild(id);
        const guild = new Guild(this.app, this, guildData);
        this.cache[id] = guild;
        return guild;
    }
    async getGuild(id) {
        if (this.cache.hasOwnProperty(id)) {
            return this.cache[id];
        }
        else {
            return await this.fetchGuild(id);
        }
    }
    async saveGuild(id) {
        return await this.app.saveManager.saveGuild(id, this.cache[id].data);
    }
    async updateMessageOptions() {
        const attachment = new Discord.MessageAttachment(this.app.displayCanvas.getImage(), "canvas.png");
        this.messageOptions = {
            content: "** **",
            files: [attachment]
        };
        this.updateAllMessage();
    }
    updateMessage(guild) {
        guild;
        // const message = guild.connectedMessage;
        // if (
        //   message === null ||
        //   message.deleted
        // ) {
        //   return false;
        // }
        // message.edit(this.messageOptions);
        // return true;
    }
    updateAllMessage() {
        // for (const id in this.cache) {
        //   this.updateMessage(this.cache[id]);
        // }
    }
}
export default GuildCaches;
