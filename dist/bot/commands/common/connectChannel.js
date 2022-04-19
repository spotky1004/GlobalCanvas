import { SlashCommandBuilder } from "@discordjs/builders";
const commandName = "connectchannel";
const slashCommand = new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Set GlobalCanvas channel (Requires channel)");
const commandData = {
    isModCommand: false,
    slashCommand,
    commandName,
    handler: async ({ guildCache, interaction }) => {
        return await guildCache.connectChannelWithInteraction(interaction);
    },
};
export default commandData;
