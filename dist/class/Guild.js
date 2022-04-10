import getSlashParams from "../util/getSlashParams.js";
class Guild {
    constructor(app, guildCaches, data) {
        this.app = app;
        this.guildCaches = guildCaches;
        this.data = data;
        this.connectedChannel = null;
        this.connectedMessage = null;
    }
    async connectChannelWithInteraction(interaction) {
        var _a;
        if (!(interaction.inGuild() && interaction.guild && interaction.channel))
            return;
        const author = await ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(interaction.user.id));
        if (typeof author === "undefined") {
            interaction.reply({
                content: "An unknown error occurred while connecting...",
                ephemeral: true
            });
            return;
        }
        if (!(author === null || author === void 0 ? void 0 : author.permissions.has("MANAGE_CHANNELS"))) {
            interaction.reply({
                content: "MANAGE_CHANNELS permission is required to use this command!",
                ephemeral: true
            });
            return;
        }
        if (this.connectedChannel !== null &&
            this.connectedMessage !== null) {
            this.connectedMessage.delete().catch(e => e);
            this.connectedChannel.send("Disconnected").catch(e => e);
        }
        const params = getSlashParams(interaction, {
            channel: { type: "channel" }
        });
        const channel = params.channel;
        await this.connectChannel(channel);
        interaction.reply({
            content: "Done!",
            ephemeral: true
        });
        this.app.logger.addConnectLog(interaction.user.id, interaction.guildId, channel.id);
        return;
    }
    async connectChannel(channel) {
        const channelMessages = await channel.messages.fetch({ limit: 5 });
        for (const [, message] of channelMessages) {
            if (message.author.id === process.env.CLIENT_ID) {
                message.delete().catch(e => e);
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
        this.data.connectedChannelId = channel.id;
        this.connectedChannel = channel;
        this.connectedMessage = message;
        this.guildCaches.updateMessage(this);
    }
}
export default Guild;
