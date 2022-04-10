import Discord from "discord.js";
import DisplayCanvas from "./DisplayCanvas.js";
import UserCaches from "./UserCaches.js";
import SaveManager from "./SaveManager.js";
class App {
    constructor(options) {
        this.config = options.config;
        this.pixels = new Array(this.config.size.height).fill(null).map(_ => new Array(this.config.size.width).fill(-1));
        this.canvas = new DisplayCanvas(this.config.size, 10);
        this.messageOptions = {};
        this.connectedChannels = [];
        this.userCaches = new UserCaches(this, { cacheCleanupTimeout: 100000 });
        this.saveManager = new SaveManager(this, options.collection);
        this.init();
    }
    async init() {
        // Load pixels
        const pixels = await this.saveManager.loadPixels();
        this.pixels = [...pixels].map(row => [...row]);
        this.canvas.loadData(this.pixels);
        // Update message
        this.updateMessageOptions();
        return true;
    }
    async save() {
        this.saveManager.savePixels();
    }
    async updateMessageOptions() {
        const attachment = new Discord.MessageAttachment(this.canvas.getImage(), "canvas.png");
        this.messageOptions = {
            content: "** **",
            files: [attachment]
        };
        this.updateAllMessage();
    }
    async connectChannel(channel) {
        const guildId = channel.guild.id;
        const prevChannelIdx = this.connectedChannels.findIndex(ch => ch.guildId === guildId);
        if (prevChannelIdx !== -1) {
            // this.connectedChannels.splice(prevChannelIdx, 1);
        }
        const channelMessages = await channel.messages.fetch({ limit: 5 });
        for (const [, message] of channelMessages) {
            if (message.author.id === process.env.CLIENT_ID) {
                message.delete().catch();
            }
        }
        let wasSendMessageSuccess = false;
        const message = await channel.send("```\nLoading\n```")
            .then(message => {
            wasSendMessageSuccess = true;
            return message;
        })
            .catch(_ => wasSendMessageSuccess = false);
        if (!wasSendMessageSuccess)
            return;
        const channelCache = {
            guildId,
            id: channel.id,
            message: message
        };
        this.connectedChannels.push(channelCache);
        this.updateMessage(channelCache);
    }
    fillPixel(colorIdx, x, y) {
        const result = this.canvas.fillPixel(colorIdx, x, y);
        if (result) {
            this.pixels[y][x] = colorIdx;
            this.updateMessageOptions();
        }
        return result;
    }
    updateAllMessage() {
        this.connectedChannels.forEach(connectedChannel => {
            this.updateMessage(connectedChannel);
        });
    }
    updateMessage(connectedChannel) {
        const message = connectedChannel.message;
        if (message.deleted) {
            return false;
        }
        message.edit(this.messageOptions);
        return true;
    }
}
export default App;
