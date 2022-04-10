import { SlashCommandBuilder } from "@discordjs/builders";
const data = new SlashCommandBuilder()
    .setName("zoom")
    .setDescription("zoom")
    .addNumberOption(option => option
    .setName("x")
    .setDescription("coordinate of the top-left")
    .setRequired(true))
    .addNumberOption(option => option
    .setName("y")
    .setDescription("coordinate of the top-left")
    .setRequired(true))
    .addNumberOption(option => option
    .setName("width")
    .setDescription("width")
    .setRequired(true))
    .addNumberOption(option => option
    .setName("height")
    .setDescription("height")
    .setRequired(true));
export default data;
