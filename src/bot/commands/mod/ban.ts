import { SlashCommandBuilder } from "@discordjs/builders";
import getSlashParams from "../../util/getSlashParams.js";
import type { CommandData } from "../../typings/Command.js";

const commandName = "ban";
const slashCommand = new SlashCommandBuilder()
  .setName(commandName)
  .setDescription("Ban user to fill pixel. This will remove all pixels from that user!")
  .addStringOption(options =>
    options
      .setName("id")
      .setDescription("User to ban")
      .setRequired(true)
  );

const commandData: CommandData = {
  isModCommand: true,
  slashCommand,
  commandName,
  handler: async ({ app, interaction }) => {
    let params = getSlashParams(interaction, {
      id: { type: "string" }
    });
    const result = await app.saveManager.banUser(params.id);
    
    if (result) await interaction.editReply(`Done! id: \`${params.id}\``);
    return result;
  },
  ephemeral: false
};

export default commandData;
