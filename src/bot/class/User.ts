import App from "./App.js";
import getSlashParams from "../util/getSlashParams.js";
import { getIdxByColorName } from "../colors.js";
import discordCooldownFormat from "../util/discordCooldownFormat.js";
import Discord from "discord.js";

export interface UserData {
  id: string;
  lastFill: number;
  isMod: boolean;
  isBanned: boolean;
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
      await this.messageInteraction.deleteReply().catch(e => e);
      this.messageInteraction = null;
    }
    if (typeof messageOptions === "undefined") return;
    await interaction.editReply(messageOptions)
      .then(_ => {
        // Set this.messageInteraction if reply was successful
        this.messageInteraction = interaction;
      })
      .catch(e => e);
  }

  async editInteraction(interaction: Discord.CommandInteraction, messageOptions: Discord.MessageOptions | undefined) {
    await interaction.deferReply().catch(e => e);
    if (typeof messageOptions === "undefined") return;
    await interaction.editReply(messageOptions).catch(e => e);
  }

  async fillPixel(interaction: Discord.CommandInteraction) {
    if (this.data.isBanned) {
      await this.replyInteraction(interaction, {
        content: `You've been banned from global canvas -  so you can't fill pixels anymore.\nIf you think this ban was mistake, content developer. (${process.env.DEV_CONTENT})`
      });
      return true;
    }

    const params = getSlashParams(interaction, {
      color: { type: "string" },
      x: { type: "number" },
      y: { type: "number" },
    });
    
    const time = new Date().getTime();
    const fillCooldown = this.app.config.fillCooldown;
    if (time - this.data.lastFill > fillCooldown) {
      const result = this.app.canvas.fillPixel(
        interaction.user.id,
        interaction.guildId ?? "-1",
        getIdxByColorName(params.color),
        params.x - 1,
        params.y - 1
      );
      if (!result) {
        await this.replyInteraction(interaction, {
          content: "Invaild position!"
        });
        return true;
      }
      this.data.lastFill = time;
      await this.replyInteraction(interaction, {
        content: "Done!"
      });
      return true;
    } else {
      const fillColldownLeft = this.data.lastFill - time + fillCooldown;
      await this.replyInteraction(interaction, {
        content: "Cooldown!\n" + discordCooldownFormat(time, fillColldownLeft)
      });
      return true;
    }
  }

  async zoomIn(interaction: Discord.CommandInteraction) {
    const params = getSlashParams(interaction, {
      x: { type: "number" },
      y: { type: "number" },
      width: { type: "number"},
      height: { type: "number" },
      grid: { type: "boolean", isRequired: true }
    });

    const range = {
      from: {
        x: params.x - 1,
        y: params.y - 1
      },
      to: {
        x: params.x + params.width - 1,
        y: params.y + params.height - 1
      }
    };
    
    if (this.app.canvas.displayCanvas.isGetImageRangeVaild(range.from, range.to)) {
      await this.replyInteraction(interaction, {
        content: "** **",
        files: [
          new Discord.MessageAttachment(this.app.canvas.displayCanvas.getImage(range.from, range.to, !!params.grid), "canvas.png")
        ]
      });
      this.app.logger.addLog("Zoom", {
        userId: interaction.user.id,
        x: params.x,
        y: params.y,
        width: params.width,
        height: params.height,
        guildId: interaction.guildId ?? "-1",
      });
      return true;
    } else {
      await this.replyInteraction(interaction, {
        content: "Invaild zoom range!"
      });
      return true;
    }
  }
}

export default User;
