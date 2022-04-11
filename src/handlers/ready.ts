import registerCommands, { RegisterCommandsOptions } from "../registerCommands.js";
import type Discord from "discord.js";
import type App from "../class/App";

interface ReadyHandlerOptions {
  client: Discord.Client<boolean>,
  token: string,
  commands: RegisterCommandsOptions["commands"],
  app: App
}

export default async function readyHandler(options: ReadyHandlerOptions) {
  const { client, token, commands, app } = options;
  
  const guilds = await client.guilds.fetch();
  guilds.each(async (guild) => {
    const guildId = guild.id;
    registerCommands({
      clientId: process.env.CLIENT_ID as string,
      guildId,
      commands: commands,
      token: token
    });

    const guildCache = await app.guildCaches.getGuild(guildId);
    if (guildCache.data.connectedChannelId !== "-1") {
      const channel = await client.channels.fetch(guildCache.data.connectedChannelId);
      if (channel !== null && channel.type === "GUILD_TEXT") {
        guildCache.connectChannel(channel);
      }
    }
  });
}
