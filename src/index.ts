import dotenv from "dotenv";
import Discord from "discord.js";
import App from "./class/App.js";
import * as commands from "./commands/index.js";
import registerCommands from "./registerCommands.js";
import collection from "./db.js";

dotenv.config();
const TOKEN = process.env.TOKEN as string;
const client = new Discord.Client({
  intents: [
    "GUILD_MESSAGES",
    "GUILD_MEMBERS",
    "DIRECT_MESSAGES",
  ]
});
const size = {
  width: Number(process.env.WIDTH ?? "0"),
  height: Number(process.env.HEIGHT ?? "0")
}
const app = new App({
  config: {
    size,
    fillCooldown: 5*60*1000, // 5 minuts 
  },
  collection,
});

registerCommands({
  clientId: process.env.CLIENT_ID as string,
  guildId: "695367502045249606",
  commands: Object.values(commands).map(v => v.toJSON()),
  token: TOKEN
});

client.on("ready", async () => {
  console.log("Ready!");
  app.connectChannel(await client.channels.fetch("960237293619265558") as Discord.TextChannel);
});

client.on("messageCreate", (message) => {
  if (message.author.id === client.user?.id) return;
  const isConnectedChannel = null !== app.connectedChannels.find(connectedChannel => message.channelId === connectedChannel.id);
  if (isConnectedChannel) {
    message.delete();
  }
});
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const user = await app.userCaches.getUser(interaction.user.id);
  try {
    switch (interaction.commandName) {
      case "fill":
        user.fillPixel(interaction);
        return;
      case "zoom":
        user.zoomIn(interaction);
        return;
    }
    await interaction.reply({ content: "Invaild command", ephemeral: true });
  } catch (e) {
    console.log(e);
  }
});

setInterval(() => {
  app.save();
}, 10_000);

client.login(TOKEN);
