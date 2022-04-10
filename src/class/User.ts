import App from "./App.js";
import getSlashParams from "../util/getSlashParams.js";
import { getIdxByColorName } from "../colors.js";
import discordCooldownFormat from "../util/discordCooldownFormat.js";
import type Discord from "discord.js";

export interface UserData {
  id: string;
  lastFill: number;
}

class User {
  app: App;
  data: UserData;
  messageInteraction: Discord.CommandInteraction | null;
  lastActive: number;

  constructor(app: App, data: UserData) {
    this.app = app;
    this.data = data;
    this.messageInteraction = null;
    this.lastActive = new Date().getTime();
  }

  async replyInteraction(interaction: Discord.CommandInteraction, messageOptions: Discord.MessageOptions | undefined) {
    if (this.messageInteraction !== null) {
      await this.messageInteraction.deleteReply().catch();
      this.messageInteraction = null;
    }
    if (typeof messageOptions === "undefined") return;
    interaction.reply(messageOptions)
      .then(_ => {
        // Set this.messageInteraction if reply was successful
        this.messageInteraction = interaction;
      })
      .catch();
  }

  getFormattedCooldown() {
    
  }

  async fillPixel(interaction: Discord.CommandInteraction) {
    const params = getSlashParams(interaction, {
      color: { type: "string" },
      x: { type: "number" },
      y: { type: "number" },
    });
    
    const time = new Date().getTime();
    const fillCooldown = this.app.config.fillCooldown;
    if (time - this.data.lastFill > fillCooldown) {
      this.app.fillPixel(
        getIdxByColorName(params.color),
        params.x,
        params.y
      );
      this.data.lastFill = time;
      this.replyInteraction(interaction, {
        content: "Done!"
      });
      return;
    } else {
      this.replyInteraction(interaction, {
        content: "Cooldown!\n" + discordCooldownFormat(time, fillCooldown)
      });
      return;
    }
  }
}

export default User;
