import { SlashCommandBuilder } from "@discordjs/builders";
import getSlashParams from "../../util/getSlashParams.js";
const commandName = "blamepixel";
const slashCommand = new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Get user id of the pixel.")
    .addNumberOption(option => option
    .setName("x")
    .setDescription("x coordinate")
    .setRequired(true))
    .addNumberOption(option => option
    .setName("y")
    .setDescription("y coordinate")
    .setRequired(true));
const commandData = {
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
        const blamedId = blameData[y - 1] ? blameData[y - 1][x - 1] : "-1";
        await interaction.editReply(`(${x}, ${y}) => ${blamedId}`).catch(e => e);
        app.logger.addLog("BlamePixel", {
            authorId: interaction.user.id,
            guildId: interaction.guildId,
            blamedId: blamedId,
            x: params.x,
            y: params.y,
        });
        return true;
    },
    ephemeral: false,
};
export default commandData;
