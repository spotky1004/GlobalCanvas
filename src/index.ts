import dotenv from "dotenv";
import Discord from "discord.js";
import App from "./class/App.js";
import * as commands from "./commands/index.js";
import registerCommands from "./registerCommands.js";
import { getIdxByColorName } from "./colors.js";
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
  size,
  collection
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
  try {
    if (interaction.commandName === "fill") {
      const params = getParams(interaction, ["color", "x", "y"]) as string[];
      app.drawPixel(
        getIdxByColorName(params[0]),
        Number(params[1]),
        Number(params[2])
      )
      await interaction.reply({ content: "Done!", ephemeral: true });
      return;
    }
    await interaction.reply({ content: "Invaild command", ephemeral: true });
  } catch (e) {
    console.log(e);
  }
});

function getParams(interaction: Discord.Interaction<Discord.CacheType>, toGet: string[]) {
  const params: (string | number | boolean | undefined)[] = [];
  const options = (interaction as any).options as Omit<Discord.CommandInteractionOptionResolver<Discord.CacheType>, "getMessage" | "getFocused">;
  for (let i = 0; i < toGet.length; i++) {
    params.push(options.get(toGet[i])?.value);
  }
  return params;
}

setInterval(() => {
  app.save();
}, 10_000);

client.login(TOKEN);
