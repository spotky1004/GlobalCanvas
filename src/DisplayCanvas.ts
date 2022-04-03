import canvas, { Canvas, CanvasRenderingContext2D } from "canvas";
import { getColorByIdx } from "./colors.js";

interface Vector2 {
  x: number;
  y: number;
}
interface Size {
  width: number;
  height: number;
}

class DisplayCanvas {
  canvasScale: number;
  size: Size;
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
  constructor(size: Size, canvasScale: number) {
    this.canvasScale = canvasScale;
    this.size = {...size};
    this.canvas = canvas.createCanvas(size.width*canvasScale, size.height*canvasScale);
    this.ctx = this.canvas.getContext("2d");
    
    this.init();
  }
  
  init() {
    this.ctx.fillStyle = "#252525";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  loadData(colorIdxMatrix: number[][]) {
    for (let y = 0; y < colorIdxMatrix.length; y++) {
      const row = colorIdxMatrix[y];
      for (let x = 0; x < row.length; x++) {
        const colorIdx = row[x];
        this.drawPixel(colorIdx, x, y);
      }
    }
  }

  /**
   * Return value means if the process was successful
   */
  drawPixel(colorIdx: number, x: number, y: number) {
    const pixelColor = getColorByIdx(colorIdx);
    if (
      pixelColor === null ||
      x < 0 || x >= this.size.width ||
      y < 0 || y >= this.size.height
    ) return false;
    
    const canvasScale = this.canvasScale;
    this.ctx.fillStyle = pixelColor;
    this.ctx.fillRect(x*canvasScale, y*canvasScale, canvasScale, canvasScale);
    return true;
  }

  getImage(from: Vector2={x: 0, y: 0}, to: Vector2={x: this.size.width-1, y: this.size.height-1}) {
    const canvasScale = this.canvasScale;
    const size: Size = {
      width: to.x - from.x,
      height: to.y - from.y
    };
    const tmpCanvas = canvas.createCanvas(size.width*canvasScale, size.height*canvasScale);
    tmpCanvas.getContext("2d").drawImage(
      this.canvas,
      from.x*canvasScale, from.y*canvasScale, size.width*canvasScale, size.height*canvasScale,
      0, 0, size.width*canvasScale, size.height*canvasScale
    );
    return tmpCanvas.toBuffer();
  }
}

export default DisplayCanvas;
