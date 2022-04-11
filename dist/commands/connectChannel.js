import { SlashCommandBuilder } from "@discordjs/builders";
const data = new SlashCommandBuilder()
    .setName("connectchannel")
    .setDescription("Set GlobalCanvas channel (Requires channel)");
export default data;
