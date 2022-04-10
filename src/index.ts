import dotenv from "dotenv";
import Discord from "discord.js";
import App from "./class/App.js";
import * as commands from "./commands/index.js";
import registerCommands from "./registerCommands.js";
import collection from "./db.js";
import getSlashParams from "./util/getSlashParams.js";

dotenv.config();
const TOKEN = process.env.TOKEN as string;
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
client.on("ready", async () => {
  const guilds = await client.guilds.fetch();
  guilds.each(async (guild) => {
    const guildId = guild.id;
    registerCommands({
      clientId: process.env.CLIENT_ID as string,
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
  console.log("Ready!");
});

client.on("guildCreate", async (guild) => {
  registerCommands({
    clientId: process.env.CLIENT_ID as string,
    guildId: guild.id,
    commands: Object.values(commands).map(v => v.toJSON()),
    token: TOKEN
  });
});

client.on("messageCreate", (message) => {
  if (message.author.id === client.user?.id) return;
  const connectedChannel = app.guildCaches.getConnectedChannels().find(connectedChannel => message.channelId === connectedChannel.id);
  if (connectedChannel) {
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
      case "connectchannel":
        if (interaction.inGuild() && interaction.guild && interaction.channel) {
          const guildCache = await app.guildCaches.getGuild(interaction.guild.id);
          guildCache.connectChannelWithInteraction(interaction);
        } else {
          interaction.reply({
            content: "This command can only be used in guilds."
          });
        }
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
