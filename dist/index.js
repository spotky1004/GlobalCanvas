var _a, _b;
import dotenv from "dotenv";
import Discord from "Discord.js";
import App from "./App.js";
import * as commands from "./commands/index.js";
import registerCommands from "./registerCommands.js";
import { getIdxByColorName } from "./colors.js";
import * as db from "./db.js";
dotenv.config();
const TOKEN = process.env.TOKEN;
const client = new Discord.Client({
    intents: [
        "GUILD_MESSAGES",
        "GUILD_MEMBERS",
        "DIRECT_MESSAGES",
    ]
});
const size = {
    width: Number((_a = process.env.WIDTH) !== null && _a !== void 0 ? _a : "0"),
    height: Number((_b = process.env.HEIGHT) !== null && _b !== void 0 ? _b : "0")
};
const app = new App({
    size
});
app.loadData(await db.loadPixels(size));
registerCommands({
    clientId: process.env.CLIENT_ID,
    guildId: "695367502045249606",
    commands: Object.values(commands).map(v => v.toJSON()),
    token: TOKEN
});
client.on("ready", async () => {
    console.log("Ready!");
    app.connectChannel(await client.channels.fetch("960127309187256360"));
    app.connectChannel(await client.channels.fetch("960193336097013760"));
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
    if (!interaction.isCommand())
        return;
    if (interaction.commandName === "fill") {
        const params = getParams(interaction, ["color", "x", "y"]);
        app.drawPixel(getIdxByColorName(params[0]), Number(params[1]), Number(params[2]));
        await interaction.reply({ content: "Done!", ephemeral: true });
    }
});
function getParams(interaction, toGet) {
    var _a;
    const params = [];
    const options = interaction.options;
    for (let i = 0; i < toGet.length; i++) {
        params.push((_a = options.get(toGet[i])) === null || _a === void 0 ? void 0 : _a.value);
    }
    return params;
}
setInterval(async () => {
    await db.savePixels(app.pixels);
}, 10000);
client.login(TOKEN);
