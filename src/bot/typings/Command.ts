import type { SlashCommandBuilder } from "@discordjs/builders";
import type Discord from "discord.js";
import type App from "../class/App.js";

export interface CommandHandlerOptions {
  app: App;
  interaction: Discord.CommandInteraction;
  userCache: Awaited<ReturnType<App["userCaches"]["getUser"]>>;
  guildCache: Awaited<ReturnType<App["guildCaches"]["getGuild"]>>;
}

export type CommandHandler = (options: CommandHandlerOptions) => Promise<boolean>;

export interface CommandData {
  isModCommand: boolean;
  slashCommand: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  commandName: string;
  handler: CommandHandler;
  ephemeral?: boolean;
}
