import type Discord from "discord.js";

type ParamTypeNames = "string" | "number";
interface ParamTypes {
  "string": string;
  "number": number;
}
interface ParamOptions {
  type: ParamTypeNames;
  isRequired?: boolean;
}

const paramGetFunctions = {
  "string": "getString",
  "number": "getNumber",
} as const;

export default function getSlashParams<T extends {[name: string]: ParamOptions}>(interaction: Discord.CommandInteraction, toGet: T) {
  const options = interaction.options;

  type OptinalParams = {[K in keyof T]: T[K]["isRequired"] extends true ? ParamTypes[T[K]["type"]] | null : unknown };
  type RequiredParams = {[K in keyof T]: T[K]["isRequired"] extends true ? unknown : ParamTypes[T[K]["type"]] };
  type Params = OptinalParams & RequiredParams;
  let params: Params = {} as Params;
  for (const name in toGet) {
    if (toGet.hasOwnProperty(name)) {
      const type = toGet[name].type as ParamTypeNames;
      const param = options[paramGetFunctions[type]](name);
      params[name] = param as any;
    }
  }
  return params;
}
