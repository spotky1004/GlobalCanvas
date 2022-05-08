import env from "./env.js";
env();
import Discord from "discord.js";
import App from "./class/App.js";
import { commandJSON } from "./commands/index.js";
import registerCommands from "./registerCommands.js";
import { data as dataCollection, log as logCollection } from "./db.js";
import * as handlers from "./handlers/index.js";
import getRandomTrivia from "./util/getRandomTrivia.js";

const TOKEN = process.env.TOKEN as string;
const client = new Discord.Client({
  intents: [
    "GUILD_MESSAGES",
    "GUILD_MEMBERS",
    "GUILD_INTEGRATIONS",
    "GUILD_PRESENCES",
    "GUILDS"
  ],
});
const size = {
  width: Number(process.env.WIDTH ?? "0"),
  height: Number(process.env.HEIGHT ?? "0")
};
const app = new App({
  config: {
    size,
    fillCooldown: Number(process.env.COOLDOWN ?? 180000),
  },
  collections: {
    data: dataCollection,
    log: logCollection
  },
});

client.on("ready", async () => {
  try {
    await handlers.ready({
      app,
      client,
      commonCommands: commandJSON.commonCommands,
      modCommands: commandJSON.modCommands,
      token: TOKEN
    });
  } catch (e) { console.log(e); }
  console.log("Ready!");
});

client.on("guildCreate", async (guild) => {
  try {
    registerCommands({
      guildId: guild.id,
      commands: commandJSON.commonCommands,
      client
    });
  } catch {}
});

client.on("messageCreate", async (message) => {
  try {
    if (message.author.id === client.user?.id) return;
    if (message.inGuild()) {
      const guildCache = await app.guildCaches.getGuild(message.guild.id);
      const connectedChannel = guildCache.connectedChannel;
      if (
        connectedChannel !== null &&
        connectedChannel.id === message.channelId
      ) {
        message.delete();
      }
    }
  } catch (e) { console.log(e); }
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isCommand()) {
      const isCommandVaild = handlers.command(app, interaction);
      if (!isCommandVaild) {
        await interaction.reply({ content: "Invaild command", ephemeral: true });
      }
    }
  }  catch (e) { console.log(e); }
});

setInterval(() => {
  app.save();
  if (client.user) {
    getRandomTrivia;
    client.user.setActivity(getRandomTrivia({ app, client }), {
      type: "WATCHING"
    });
  }
}, 10_000);

client.login(TOKEN);
