import getSlashParams from "../util/getSlashParams.js";
import { getIdxByColorName } from "../colors.js";
import discordCooldownFormat from "../util/discordCooldownFormat.js";
class User {
    constructor(app, data) {
        this.app = app;
        this.data = data;
        this.messageInteraction = null;
        this.lastActive = new Date().getTime();
    }
    async replyInteraction(interaction, messageOptions) {
        if (this.messageInteraction !== null) {
            await this.messageInteraction.deleteReply().catch();
            this.messageInteraction = null;
        }
        if (typeof messageOptions === "undefined")
            return;
        interaction.reply(messageOptions)
            .then(_ => {
            // Set this.messageInteraction if reply was successful
            this.messageInteraction = interaction;
        })
            .catch();
    }
    getFormattedCooldown() {
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
            this.app.fillPixel(getIdxByColorName(params.color), params.x, params.y);
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
export default User;
