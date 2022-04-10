import canvas from "canvas";
import { getColorByIdx } from "../colors.js";
class DisplayCanvas {
    constructor(size, canvasScale) {
        this.canvasScale = canvasScale;
        this.size = Object.assign({}, size);
        this.canvas = canvas.createCanvas(size.width * canvasScale, size.height * canvasScale);
        this.ctx = this.canvas.getContext("2d");
        this.init();
    }
    init() {
        this.ctx.fillStyle = "#252525";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    loadData(colorIdxMatrix) {
        for (let y = 0; y < colorIdxMatrix.length; y++) {
            const row = colorIdxMatrix[y];
            for (let x = 0; x < row.length; x++) {
                const colorIdx = row[x];
                this.fillPixel(colorIdx, x, y);
            }
        }
    }
    /**
     * Return value means if the process was successful
     */
    fillPixel(colorIdx, x, y) {
        const pixelColor = getColorByIdx(colorIdx);
        if (pixelColor === null ||
            x < 0 || x >= this.size.width ||
            y < 0 || y >= this.size.height)
            return false;
        const canvasScale = this.canvasScale;
        this.ctx.fillStyle = pixelColor;
        this.ctx.fillRect(x * canvasScale, y * canvasScale, canvasScale, canvasScale);
        return true;
    }
    isGetImageRangeVaild(from = { x: 0, y: 0 }, to = { x: this.size.width - 1, y: this.size.height - 1 }) {
        return (0 <= from.x && from.x < this.size.width &&
            0 <= from.y && from.y < this.size.height &&
            0 <= to.x && to.x < this.size.width &&
            0 <= to.y && to.y < this.size.height &&
            from.x < to.x && from.y < to.y);
    }
    getImage(from = { x: 0, y: 0 }, to = { x: this.size.width - 1, y: this.size.height - 1 }) {
        const canvasScale = this.canvasScale;
        const size = {
            width: to.x - from.x,
            height: to.y - from.y
        };
        if (this.isGetImageRangeVaild(from, to)) {
            const tmpCanvas = canvas.createCanvas(size.width * canvasScale, size.height * canvasScale);
            tmpCanvas.getContext("2d").drawImage(this.canvas, from.x * canvasScale, from.y * canvasScale, size.width * canvasScale, size.height * canvasScale, 0, 0, size.width * canvasScale, size.height * canvasScale);
            return tmpCanvas.toBuffer();
        }
        else {
            return this.canvas.toBuffer();
        }
    }
}
export default DisplayCanvas;
