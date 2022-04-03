import Discord from "discord.js";
import DisplayCanvas from "./DisplayCanvas.js";

interface AppOptions {
  size: {
    width: number;
    height: number;
  };
}
interface ConnectedChannel {
  guildId: string;
  id: string;
  message: Discord.Message;
}

class App {
  pixels: number[][];
  canvas: DisplayCanvas;
  messageOptions: Discord.MessageOptions;
  connectedChannels: ConnectedChannel[];
  constructor(options: AppOptions) {
    this.pixels = new Array(options.size.height).fill(null).map(_ => new Array(options.size.width).fill(-1));
    this.canvas = new DisplayCanvas(options.size, 10);
    this.messageOptions = {};
    this.connectedChannels = [];

    this.init();
  }

  loadData(colorIdxMatrix: number[][]) {
    this.pixels = [...colorIdxMatrix].map(row => [...row]);
    this.canvas.loadData(this.pixels);
    this.updateMessageOptions();
  }

  init() {
    this.updateMessageOptions();
  }

  async updateMessageOptions() {
    const attachment = new Discord.MessageAttachment(this.canvas.getImage(), "canvas.png");
    this.messageOptions = {
      content: "** **",
      files: [attachment]
    };
    this.updateAllMessage();
  }

  async connectChannel(channel: Discord.TextChannel) {
    const guildId = channel.guild.id;

    const prevChannelIdx = this.connectedChannels.findIndex(ch => ch.guildId === guildId);
    if (prevChannelIdx !== -1) {
      // this.connectedChannels.splice(prevChannelIdx, 1);
    }
    
    let wasSendMessageSuccess = false;
    const message = await channel.send("```\nLoading\n```")
      .then(message => {
        wasSendMessageSuccess = true;
        return message;
      })
      .catch(_ => wasSendMessageSuccess = false);
    if (!wasSendMessageSuccess) return;

    const channelCache: ConnectedChannel = {
      guildId,
      id: channel.id,
      message: message as Discord.Message
    };
    this.connectedChannels.push(channelCache);

    this.updateMessage(channelCache);
  }

  drawPixel(colorIdx: number, x: number, y: number) {
    const result = this.canvas.drawPixel(colorIdx, x, y);
    if (result) {
      this.pixels[y][x] = colorIdx;
      this.updateMessageOptions();
    }
    return result;
  }

  updateAllMessage() {
    this.connectedChannels.forEach(connectedChannel => {
      this.updateMessage(connectedChannel);
    })
  }

  updateMessage(connectedChannel: ConnectedChannel) {
    const message = connectedChannel.message;
    if (message.deleted) {
      return false;
    }

    message.edit(this.messageOptions);
    return true;
  }
}

export default App;
