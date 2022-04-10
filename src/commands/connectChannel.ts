import { SlashCommandBuilder } from "@discordjs/builders";

const data = new SlashCommandBuilder()
  .setName("connectchannel")
  .setDescription("Set GlobalCanvas channel (Requires channel)")
  .addChannelOption(option =>
    option
      .setName("channel")
      .addChannelType(0)
      .setDescription("Channel to connect")
      .setRequired(true)
  )

export default data;