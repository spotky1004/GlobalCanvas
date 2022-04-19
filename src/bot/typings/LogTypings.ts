export interface FillLogSchema {
  type?: "Fill";
  time?: number;
  color: string;
  x: number;
  y: number;
  userId: string;
  guildId: string;
  hidden?: boolean | null;
}
export interface ZoomLogSchema {
  type?: "Zoom";
  time?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  userId: string;
  guildId: string;
}
export interface ConnectLogSchema {
  type?: "Connect";
  time?: number;
  userId: string;
  guildId: string;
  channelId: string;
}
export interface BanLogSchema {
  type?: "Ban";
  time?: number;
  authorId: string;
  userId: string;
  guildId: string;
}
export interface UnbanLogSchema {
  type?: "Unban";
  time?: number;
  authorId: string;
  userId: string;
  guildId: string;
}
export interface BlameCanvasLogSchema {
  type?: "BlameCanvas";
  time?: number;
  authorId: string;
  guildId: string;
}
export interface BlamePixelLogSchema {
  type?: "BlameCanvas";
  time?: number;
  authorId: string;
  guildId: string;
  blamedId: string;
  x: number;
  y: number;
}

export interface LogSchemas {
  "Fill": FillLogSchema;
  "Zoom": ZoomLogSchema;
  "Connect": ConnectLogSchema;
  "Ban": BanLogSchema;
  "Unban": UnbanLogSchema;
  "BlameCanvas": BlameCanvasLogSchema;
  "BlamePixel": BlamePixelLogSchema;
}
export type AnyLogSchema = LogSchemas[keyof LogSchemas];