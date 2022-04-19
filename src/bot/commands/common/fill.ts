import { SlashCommandBuilder } from "@discordjs/builders";
import { colorLookup } from "../../colors.js";
import type { CommandData } from "../../typings/Command.js";

const commandName = "fill";
const slashCommand = new SlashCommandBuilder()
  .setName(commandName)
  .setDescription("Fill a pixel in canvas.")
  .addStringOption(option => {
    let choiceSets: [string, string][] = [];
    for (let i = 0; i < Math.min(colorLookup.length, 25); i++) {
      const colorName = colorLookup[i];
      choiceSets.push([colorName, colorName]);
    }
    option
      .setName("color")
      .setDescription("color of the pixel")
      .setRequired(true)
      .addChoices(choiceSets);
    return option;
  })
  .addNumberOption(option => 
    option
      .setName("x")
      .setDescription("x coordinate of the pixel")
      .setRequired(true)
  )
  .addNumberOption(option =>
    option
      .setName("y")
      .setDescription("y coordinate of the pixel")
      .setRequired(true)
  );

const commandData: CommandData<typeof commandName> = {
  isModCommand: false,
  slashCommand,
  commandName,
  handler: async ({ userCache, interaction }) => {
    return await userCache.fillPixel(interaction);
  },
};

export default commandData;
