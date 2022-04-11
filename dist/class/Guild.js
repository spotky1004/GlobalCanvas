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
        const channel = interaction.channel;
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
        if (channel.type !== "GUILD_TEXT") {
            interaction.reply({
                content: "Channel must be Text channel!",
                ephemeral: true
            });
        }
        if (this.connectedChannel !== null &&
            this.connectedMessage !== null) {
            this.connectedMessage.delete().catch(e => e);
            this.connectedChannel.send("Disconnected").catch(e => e);
        }
        await this.connectChannel(channel);
        interaction.reply({
            content: "Done!",
            ephemeral: true
        });
        this.app.logger.addConnectLog(interaction.user.id, interaction.guildId, channel.id);
        return;
    }
    async connectChannel(channel) {
        let errorOccured = false;
        await channel.messages.fetch({ limit: 5 })
            .then(channelMessages => {
            for (const [, message] of channelMessages) {
                if (message.author.id === process.env.CLIENT_ID) {
                    message.delete().catch(e => e);
                }
            }
        })
            .catch(_ => errorOccured = true);
        if (errorOccured)
            return;
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
