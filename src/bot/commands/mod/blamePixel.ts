import { SlashCommandBuilder } from "@discordjs/builders";
import getSlashParams from "../../util/getSlashParams.js";
import type { CommandData } from "../../typings/Command.js";

const commandName = "blamepixel";
const slashCommand = new SlashCommandBuilder()
  .setName(commandName)
  .setDescription("Get user id of the pixel.")
  .addNumberOption(option => 
    option
      .setName("x")
      .setDescription("x coordinate")
      .setRequired(true)
  )
  .addNumberOption(option =>
    option
      .setName("y")
      .setDescription("y coordinate")
      .setRequired(true)
  );

const commandData: CommandData = {
  isModCommand: true,
  slashCommand,
  commandName,
  handler: async ({ app, interaction }) => {
    const params = getSlashParams(interaction, {
      x: { type: "number" },
      y: { type: "number" }
    });
    const blameData = await app.logger.createUserIdBlameMatrix(app.config.size);
    const { x, y } = params;
    await interaction.editReply(`(${x}, ${y}) => ${blameData[y-1] ? blameData[y-1][x-1] : undefined}`).catch(e => e);
    return true;
  },
  ephemeral: false,
};

export default commandData;
