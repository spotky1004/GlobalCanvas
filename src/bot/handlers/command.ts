import * as commands from "../commands/index.js";
import type App from "../class/App.js";
import type Discord from "discord.js";
import type { CommandHandlerOptions } from "../typings/Command.js";

/**
 * Return value is commandName is vaild
 */
export default async function commandHandler(app: App, interaction: Discord.CommandInteraction) {
  if (
    !interaction.inGuild() || !interaction.guild || !interaction.channel
  ) return false;

  const commandOptions: CommandHandlerOptions = {
    app,
    interaction,
    userCache: await app.userCaches.getUser(interaction.user.id),
    guildCache: await app.guildCaches.getGuild(interaction.guildId)
  };

  let result = false;
  if (isCommonCommandName(interaction.commandName)) {
    const commandToExecute = commands.commonCommands[interaction.commandName];
    await interaction.deferReply({ ephemeral: commandToExecute.ephemeral ?? true });
    result = await commandToExecute.handler(commandOptions);
  } else if (
    isModCommandName(interaction.commandName) &&
    commandOptions.guildCache.data.isModServer &&
    commandOptions.userCache.data.isMod
  ) {
    const commandToExecute = commands.modCommands[interaction.commandName];
    await interaction.deferReply({ ephemeral: commandToExecute.ephemeral ?? true });
    result = await commandToExecute.handler(commandOptions);
  } else {
    await interaction.reply({
      content: "Inviald command!",
      ephemeral: true
    }).catch(e => e);
  }

  if (!result) {
    await interaction.editReply({
      content: "Unknown error occured!"
    }).catch(e => e);
  }
  return result;
}

const commandNames = {
  common: Object.keys(commands.commonCommands),
  mod: Object.keys(commands.modCommands)
};
function isCommonCommandName(commandName: string): commandName is typeof commands["commonCommands"][keyof typeof commands["commonCommands"]]["commandName"] {
  return commandNames.common.includes(commandName);
}
function isModCommandName(commandName: string): commandName is typeof commands["modCommands"][keyof typeof commands["modCommands"]]["commandName"] {
  return commandNames.mod.includes(commandName);
}
