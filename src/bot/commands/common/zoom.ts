import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandData } from "../../typings/Command.js";

const commandName = "zoom";
const slashCommand = new SlashCommandBuilder()
  .setName(commandName)
  .setDescription("zoom")
  .addNumberOption(option => 
    option
      .setName("x")
      .setDescription("coordinate of the top-left")
      .setRequired(true)
  )
  .addNumberOption(option => 
    option
      .setName("y")
      .setDescription("coordinate of the top-left")
      .setRequired(true)
  )
  .addNumberOption(option => 
    option
      .setName("width")
      .setDescription("width")
      .setRequired(true)
  )
  .addNumberOption(option => 
    option
      .setName("height")
      .setDescription("height")
      .setRequired(true)
  )
  .addBooleanOption(option =>
    option
      .setName("grid")
      .setDescription("display grid")
  )

const commandData: CommandData = {
  isModCommand: false,
  slashCommand,
  commandName,
  handler: async ({ userCache, interaction }) => {
    await userCache.zoomIn(interaction);
    return true;
  },
};

export default commandData;
