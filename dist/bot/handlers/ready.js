import registerCommands from "../registerCommands.js";
export default async function readyHandler(options) {
    const { client, commonCommands, modCommands, app } = options;
    const guilds = await client.guilds.fetch();
    guilds.each(async (guild) => {
        const guildId = guild.id;
        const guildCache = await app.guildCaches.getGuild(guildId);
        let commandsToRegister = commonCommands;
        if (guildCache.data.isModServer) {
            commandsToRegister = commandsToRegister.concat(modCommands);
        }
        registerCommands({
            guildId,
            commands: commandsToRegister,
            client
        });
        if (guildCache.data.connectedChannelId !== "-1") {
            try {
                const channel = await client.channels.fetch(guildCache.data.connectedChannelId);
                if (channel !== null && channel.type === "GUILD_TEXT") {
                    guildCache.connectChannel(channel);
                }
            }
            catch (_a) { }
        }
    });
}
