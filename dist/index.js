var _a, _b;
import dotenv from "dotenv";
import Discord from "discord.js";
import App from "./class/App.js";
import * as commands from "./commands/index.js";
import registerCommands from "./registerCommands.js";
import { data, fillLog } from "./db.js";
dotenv.config();
const TOKEN = process.env.TOKEN;
const client = new Discord.Client({
    intents: [
        "GUILD_MESSAGES",
        "GUILD_MEMBERS",
        "GUILD_INTEGRATIONS",
        "GUILD_PRESENCES",
        "GUILDS"
    ]
});
const size = {
    width: Number((_a = process.env.WIDTH) !== null && _a !== void 0 ? _a : "0"),
    height: Number((_b = process.env.HEIGHT) !== null && _b !== void 0 ? _b : "0")
};
const app = new App({
    config: {
        size,
        fillCooldown: 5 * 60 * 1000, // 5 minuts 
    },
    collections: {
        data,
        fillLog
    },
});
client.on("ready", async () => {
    try {
        const guilds = await client.guilds.fetch();
        guilds.each(async (guild) => {
            const guildId = guild.id;
            registerCommands({
                clientId: process.env.CLIENT_ID,
                guildId,
                commands: Object.values(commands).map(v => v.toJSON()),
                token: TOKEN
            });
            const guildCache = await app.guildCaches.getGuild(guildId);
            if (guildCache.data.connectedChannelId !== "-1") {
                const channel = await client.channels.fetch(guildCache.data.connectedChannelId);
                if (channel !== null && channel.type === "GUILD_TEXT") {
                    guildCache.connectChannel(channel);
                }
            }
        });
    }
    catch (e) {
        console.log(e);
    }
    console.log("Ready!");
});
client.on("guildCreate", async (guild) => {
    try {
        registerCommands({
            clientId: process.env.CLIENT_ID,
            guildId: guild.id,
            commands: Object.values(commands).map(v => v.toJSON()),
            token: TOKEN
        });
    }
    catch (_a) { }
});
client.on("messageCreate", (message) => {
    var _a;
    try {
        if (message.author.id === ((_a = client.user) === null || _a === void 0 ? void 0 : _a.id))
            return;
        const connectedChannel = app.guildCaches.getConnectedChannels().find(connectedChannel => message.channelId === connectedChannel.id);
        if (connectedChannel) {
            message.delete();
        }
    }
    catch (e) {
        console.log(e);
    }
});
client.on("interactionCreate", async (interaction) => {
    try {
        if (!interaction.isCommand())
            return;
        const user = await app.userCaches.getUser(interaction.user.id);
        switch (interaction.commandName) {
            case "fill":
                user.fillPixel(interaction);
                return;
            case "zoom":
                user.zoomIn(interaction);
                return;
            case "connectchannel":
                if (interaction.inGuild() && interaction.guild && interaction.channel) {
                    const guildCache = await app.guildCaches.getGuild(interaction.guild.id);
                    guildCache.connectChannelWithInteraction(interaction);
                }
                else {
                    interaction.reply({
                        content: "This command can only be used in guilds."
                    });
                }
                return;
        }
        await interaction.reply({ content: "Invaild command", ephemeral: true });
    }
    catch (e) {
        console.log(e);
    }
});
setInterval(() => {
    app.save();
}, 10000);
client.login(TOKEN);
