import { SlashCommandBuilder } from "@discordjs/builders";
import getSlashParams from "../../util/getSlashParams.js";
import type { CommandData } from "../../typings/Command.js";

const commandName = "unban";
const slashCommand = new SlashCommandBuilder()
  .setName(commandName)
  .setDescription("Unban user, but removed pixels wont' recovered.")
  .addStringOption(options =>
    options
      .setName("id")
      .setDescription("User to unban")
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
    const result = await app.saveManager.unbanUser(params.id);

    if (result){
      await interaction.editReply("Done!");
      app.logger.addLog("Unban", {
        authorId: interaction.user.id,
        guildId: interaction.guildId as string,
        userId: params.id,
      });
    }
    return result;
  },
  ephemeral: false,
};

export default commandData;
