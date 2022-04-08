import type Discord from "discord.js";

const paramGetFunctions = {
  "string": "getString",
  "number": "getNumber",
} as const;

type ParamTypeNames = "string" | "number";
interface ParamTypes {
  "string": string;
  "number": number;
}

export default function getSlashParams<T extends {[name: string]: ParamTypeNames}>(interaction: Discord.CommandInteraction, toGet: T) {
  const options = interaction.options;

  type Params = {[K in keyof T]: ParamTypes[T[K]]};
  let params: Params = {} as Params;
  for (const name in toGet) {
    if (toGet.hasOwnProperty(name)) {
      const type = toGet[name] as ParamTypeNames;
      const param = options[paramGetFunctions[type]](name);
      params[name] = param as any;
    }
  }
  return params;
}
