import * as commonCommands from "./common/index.js";
import * as modCommands from "./mod/index.js";
export { commonCommands, modCommands, };
export const commandJSON = {
    commonCommands: Object.values(commonCommands).map(commandData => commandData.slashCommand.toJSON()),
    modCommands: Object.values(modCommands).map(commandData => commandData.slashCommand.toJSON()),
};
