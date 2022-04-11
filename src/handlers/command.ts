import type App from "../class/App.js";
import type Discord from "discord.js";

const commandNameEnum = {
  "fill": 0,
  "zoom": 1,
  "connectchannel": 2,
} as const;
const commandNames = Object.keys(commandNameEnum);
type commandNames = keyof typeof commandNameEnum;

/**
 * Return value is commandName is vaild
 */
export default async function commandHandler(app: App, interaction: Discord.Interaction<Discord.CacheType>) {
  if (!interaction.isCommand()) return true;
  if (!isVaildCommand(interaction.commandName)) return false;
  const user = await app.userCaches.getUser(interaction.user.id);

  if (interaction.commandName === "fill") {
    user.fillPixel(interaction);
  } else if (interaction.commandName === "zoom") {
    user.zoomIn(interaction);
  } else if (interaction.commandName === "connectchannel") {
    if (interaction.inGuild() && interaction.guild && interaction.channel) {
      const guildCache = await app.guildCaches.getGuild(interaction.guild.id);
      guildCache.connectChannelWithInteraction(interaction);
    } else {
      interaction.reply({
        content: "This command can only be used in guilds."
      });
    }
  }

  return true;
}

function isVaildCommand(commandName: string): commandName is commandNames {
  return commandNames.includes(commandName);
}
