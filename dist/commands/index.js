import { default as draw } from "./fill.js";
import { default as zoom } from "./zoom.js";
import { default as connectChannel } from "./connectChannel.js";
const commands = {
    draw,
    zoom,
    connectChannel,
};
const commandsJSON = Object.values(commands).map(v => v.toJSON());
export default commandsJSON;
