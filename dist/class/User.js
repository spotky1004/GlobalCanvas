import getSlashParams from "../util/getSlashParams.js";
import { getIdxByColorName } from "../colors.js";
import discordCooldownFormat from "../util/discordCooldownFormat.js";
import Discord from "discord.js";
class User {
    constructor(app, data) {
        this.app = app;
        this.data = data;
        this.messageInteraction = null;
        this.lastActive = new Date().getTime();
    }
    async replyInteraction(interaction, messageOptions) {
        if (this.messageInteraction !== null) {
            await this.messageInteraction.deleteReply().catch(e => e);
            this.messageInteraction = null;
        }
        if (typeof messageOptions === "undefined")
            return;
        interaction.reply(Object.assign({ ephemeral: true }, messageOptions))
            .then(_ => {
            // Set this.messageInteraction if reply was successful
            this.messageInteraction = interaction;
        })
            .catch(e => e);
    }
    async fillPixel(interaction) {
        const params = getSlashParams(interaction, {
            color: { type: "string" },
            x: { type: "number" },
            y: { type: "number" },
        });
        const time = new Date().getTime();
        const fillCooldown = this.app.config.fillCooldown;
        if (time - this.data.lastFill > fillCooldown) {
            this.app.fillPixel(getIdxByColorName(params.color), params.x - 1, params.y - 1);
            this.data.lastFill = time;
            this.replyInteraction(interaction, {
                content: "Done!"
            });
            return;
        }
        else {
            this.replyInteraction(interaction, {
                content: "Cooldown!\n" + discordCooldownFormat(time, fillCooldown)
            });
            return;
        }
    }
    async zoomIn(interaction) {
        const params = getSlashParams(interaction, {
            x: { type: "number" },
            y: { type: "number" },
            width: { type: "number" },
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
        if (this.app.canvas.isGetImageRangeVaild(range.from, range.to)) {
            this.replyInteraction(interaction, {
                content: "** **",
                files: [
                    new Discord.MessageAttachment(this.app.canvas.getImage(range.from, range.to), "canvas.png")
                ]
            });
        }
        else {
            this.replyInteraction(interaction, {
                content: "Invaild zoom range!"
            });
            return;
        }
    }
}
export default User;
