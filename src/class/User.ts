import App from "./App.js";
import getSlashParams from "../util/getSlashParams.js";
import { getIdxByColorName } from "../colors.js";
import discordCooldownFormat from "../util/discordCooldownFormat.js";
import Discord from "discord.js";

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
      await this.messageInteraction.deleteReply().catch(e => e);
      this.messageInteraction = null;
    }
    if (typeof messageOptions === "undefined") return;
    await interaction.reply({
      ephemeral: true,
      ...messageOptions,
    })
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
    const params = getSlashParams(interaction, {
      color: { type: "string" },
      x: { type: "number" },
      y: { type: "number" },
    });
    
    const time = new Date().getTime();
    const fillCooldown = this.app.config.fillCooldown;
    if (time - this.data.lastFill > fillCooldown) {
      this.app.fillPixel(
        interaction.user.id,
        interaction.guildId ?? "-1",
        getIdxByColorName(params.color),
        params.x - 1,
        params.y - 1
      );
      this.data.lastFill = time;
      this.replyInteraction(interaction, {
        content: "Done!"
      });
      return;
    } else {
      const fillColldownLeft = this.data.lastFill - time + fillCooldown;
      this.replyInteraction(interaction, {
        content: "Cooldown!\n" + discordCooldownFormat(time, fillColldownLeft)
      });
      return;
    }
  }

  async zoomIn(interaction: Discord.CommandInteraction) {
    const params = getSlashParams(interaction, {
      x: { type: "number" },
      y: { type: "number" },
      width: { type: "number"},
      height: { type: "number" },
    });

    const range = {
      from: {
        x: params.x - 1,
        y: params.y - 1
      },
      to: {
        x: params.x + params.width,
        y: params.y + params.height
      }
    };
    
    if (this.app.displayCanvas.isGetImageRangeVaild(range.from, range.to)) {
      this.replyInteraction(interaction, {
        content: "** **",
        files: [
          new Discord.MessageAttachment(this.app.displayCanvas.getImage(range.from, range.to), "canvas.png")
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
    } else {
      this.replyInteraction(interaction, {
        content: "Invaild zoom range!"
      });
      return;
    }
  }
}

export default User;
