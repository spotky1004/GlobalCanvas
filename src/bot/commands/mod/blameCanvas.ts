import { SlashCommandBuilder } from "@discordjs/builders";
import Discord from "discord.js";
import DisplayCanvas from "../../class/DisplayCanvas.js";
import stringToColor from "../../util/stringToColor.js";
import { ColorData } from "../../class/DisplayCanvas.js";
import type { CommandData } from "../../typings/Command.js";

const commandName = "blamecanvas";
const slashCommand = new SlashCommandBuilder()
  .setName(commandName)
  .setDescription("Display canvas colors as hashed user id");

const commandData: CommandData<typeof commandName> = {
  isModCommand: true,
  slashCommand,
  commandName,
  handler: async ({ app, interaction }) => {
    const size = app.config.size;
    const canvas = new DisplayCanvas(size);
    const blameData = await app.logger.createUserIdBlameMatrix(size);
    const idMap: Map<string, string> = new Map();
    const colorData: ColorData = blameData.map(row => row.map(userId => {
      const color = userId !== "-1" ? stringToColor(userId) : "#000000";
      idMap.set(userId, color);
      return color;
    }));
    canvas.init(colorData);

    let idList = "";
    idMap.forEach((color, userId) => {
      idList += `${userId}: ${color}\n`;
    });
    await interaction.editReply({
      content: "Blamed image:",
      files: [
        new Discord.MessageAttachment(Buffer.from(idList, "utf-8"), "id-list.txt"),
        new Discord.MessageAttachment(canvas.getImage(undefined, undefined, true), "canvas.png")
      ]
    }).catch(e => e);
    app.logger.addLog("BlameCanvas", {
      authorId: interaction.user.id,
      guildId: interaction.guildId as string,
    });
    return true;
  },
  ephemeral: false,
};

export default commandData;
