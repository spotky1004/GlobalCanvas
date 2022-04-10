var _a, _b;
import dotenv from "dotenv";
import Discord from "discord.js";
import App from "./class/App.js";
import * as commands from "./commands/index.js";
import registerCommands from "./registerCommands.js";
import collection from "./db.js";
import getSlashParams from "./util/getSlashParams.js";
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
    collection,
});
registerCommands({
    clientId: process.env.CLIENT_ID,
    guildId: "695367502045249606",
    commands: Object.values(commands).map(v => v.toJSON()),
    token: TOKEN
});
client.on("ready", async () => {
    console.log("Ready!");
    app.connectChannel(await client.channels.fetch("960237293619265558"));
});
client.on("messageCreate", (message) => {
    var _a;
    if (message.author.id === ((_a = client.user) === null || _a === void 0 ? void 0 : _a.id))
        return;
    const isConnectedChannel = null !== app.connectedChannels.find(connectedChannel => message.channelId === connectedChannel.id);
    if (isConnectedChannel) {
        message.delete();
    }
});
client.on("interactionCreate", async (interaction) => {
    var _a;
    if (!interaction.isCommand())
        return;
    const user = await app.userCaches.getUser(interaction.user.id);
    try {
        switch (interaction.commandName) {
            case "fill":
                user.fillPixel(interaction);
                return;
            case "zoom":
                user.zoomIn(interaction);
                return;
            case "connectchannel":
                if (interaction.inGuild() && interaction.channel) {
                    const author = await ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(interaction.user.id));
                    if (author === null || author === void 0 ? void 0 : author.permissions.has("MANAGE_CHANNELS")) {
                        const params = getSlashParams(interaction, {
                            channel: { type: "channel" }
                        });
                        app.connectChannel(params.channel);
                        interaction.reply({
                            content: "Done!",
                            ephemeral: true
                        });
                    }
                    else {
                        interaction.reply({
                            content: "MANAGE_CHANNELS permission is required to use this command!"
                        });
                    }
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
