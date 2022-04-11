var _a, _b, _c;
import env from "./env.js";
env();
import Discord from "discord.js";
import App from "./class/App.js";
import commands from "./commands/index.js";
import registerCommands from "./registerCommands.js";
import { data, log } from "./db.js";
import * as handlers from "./handlers/index.js";
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
        fillCooldown: Number((_c = process.env.COOLDOWN) !== null && _c !== void 0 ? _c : 180000),
    },
    collections: {
        data,
        log
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
                commands,
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
            commands,
            token: TOKEN
        });
    }
    catch (_a) { }
});
client.on("messageCreate", async (message) => {
    var _a;
    try {
        if (message.author.id === ((_a = client.user) === null || _a === void 0 ? void 0 : _a.id))
            return;
        if (message.inGuild()) {
            const guildCache = await app.guildCaches.getGuild(message.guild.id);
            const connectedChannel = guildCache.connectedChannel;
            if (connectedChannel !== null &&
                connectedChannel.id === message.channelId) {
                message.delete();
            }
        }
    }
    catch (e) {
        console.log(e);
    }
});
client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isCommand()) {
            const isCommandVaild = handlers.command(app, interaction);
            if (!isCommandVaild) {
                await interaction.reply({ content: "Invaild command", ephemeral: true });
            }
        }
    }
    catch (e) {
        console.log(e);
    }
});
setInterval(() => {
    app.save();
}, 10000);
client.login(TOKEN);
