import getSlashParams from "../util/getSlashParams.js";
import type GuildCaches from "./GuildCaches.js";
import type App from "./App.js";
import type Discord from "discord.js";

export interface GuildData {
  id: string;
  /** "-1" means connected channel doesn't exists */
  connectedChannelId: string;
}

class Guild {
  app: App;
  guildCaches: GuildCaches;
  data: GuildData;
  connectedChannel: Discord.TextChannel | null;
  connectedMessage: Discord.Message | null;

  constructor(app: App, guildCaches: GuildCaches, data: GuildData) {
    this.app = app;
    this.guildCaches = guildCaches;
    this.data = data;
    this.connectedChannel = null;
    this.connectedMessage = null;
  }

  async connectChannelWithInteraction(interaction: Discord.CommandInteraction) {
    if (!(interaction.inGuild() && interaction.guild && interaction.channel)) return;

    const author = await interaction.guild?.members.fetch(interaction.user.id);

    if (typeof author === "undefined") {
      interaction.reply({
        content: "An unknown error occurred while connecting...",
        ephemeral: true
      });
      return;
    }

    if (!author?.permissions.has("MANAGE_CHANNELS")) {
      interaction.reply({
        content: "MANAGE_CHANNELS permission is required to use this command!",
        ephemeral: true
      });
      return;
    }

    if (
      this.connectedChannel !== null &&
      this.connectedMessage !== null
    ) {
      this.connectedMessage.delete().catch(e => e);
      this.connectedChannel.send("Disconnected").catch(e => e);
    }

    const params = getSlashParams(interaction, {
      channel: { type: "channel" }
    });
    const channel = params.channel as Discord.TextChannel;
    await this.connectChannel(channel);

    interaction.reply({
      content: "Done!",
      ephemeral: true
    });
    this.app.logger.addConnectLog(interaction.user.id, interaction.guildId, channel.id);
    return;
  }

  async connectChannel(channel: Discord.TextChannel) {
    const channelMessages = await channel.messages.fetch({ limit: 5 });
    for (const [, message] of channelMessages) {
      if (message.author.id === process.env.CLIENT_ID) {
        message.delete().catch(e => e);
      }
    }

    let wasSendMessageSuccess = false;
    const message = await channel.send("```\nLoading\n```")
      .then(message => {
        wasSendMessageSuccess = true;
        return message;
      })
      .catch(_ => wasSendMessageSuccess = false);
    if (!wasSendMessageSuccess) return;

    this.data.connectedChannelId = channel.id;
    this.connectedChannel = channel;
    this.connectedMessage = message as Discord.Message;

    this.guildCaches.updateMessage(this);
  }
}

export default Guild;
