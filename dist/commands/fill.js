import { SlashCommandBuilder } from "@discordjs/builders";
import { colorLookup } from "../colors.js";
const data = new SlashCommandBuilder()
    .setName("fill")
    .setDescription("Fill a pixel in canvas.")
    .addStringOption(option => {
    let choiceSets = [];
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
    .addNumberOption(option => option
    .setName("x")
    .setDescription("x coordinate of the pixel")
    .setRequired(true))
    .addNumberOption(option => option
    .setName("y")
    .setDescription("y coordinate of the pixel")
    .setRequired(true));
export default data;
