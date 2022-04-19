import DisplayCanvas from "./DisplayCanvas.js";
import createMatrix from "../util/createMatrix.js";
import { getColorByIdx } from "../colors.js";
class Canvas {
    constructor(app, size) {
        this.app = app;
        this.size = Object.assign({}, size);
        this.data = createMatrix(this.size.width, this.size.height, -1);
        this.displayCanvas = new DisplayCanvas(size);
        this.init(this.data);
    }
    init(colorData) {
        this.data = [...colorData].map(row => [...row]);
        this.displayCanvas.init(this.data.map(row => row.map(data => { var _a; return (_a = getColorByIdx(data)) !== null && _a !== void 0 ? _a : "#00000000"; })));
    }
    fillPixel(userId, guildId, colorIdx, x, y) {
        const pixelColor = getColorByIdx(colorIdx);
        if (pixelColor === null ||
            x < 0 || x >= this.size.width ||
            y < 0 || y >= this.size.height)
            return false;
        this.data[y][x] = colorIdx;
        this.app.logger.addLog("Fill", {
            x,
            y,
            color: pixelColor,
            userId,
            guildId,
        });
        this.displayCanvas.fillPixel(pixelColor, x, y);
        this.app.guildCaches.updateMessageOptions();
        return true;
    }
}
export default Canvas;
