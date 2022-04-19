import Canvas, { Canvas as CanvasType, CanvasRenderingContext2D } from "canvas";
import type { Matrix } from "../util/createMatrix.js";

interface Vector2 {
  x: number;
  y: number;
}
export interface Size {
  width: number;
  height: number;
}
export type ColorData = Matrix<string>;

class DisplayCanvas {
  size: Size;
  canvasScale: number;
  canvas: CanvasType;
  ctx: CanvasRenderingContext2D;

  constructor(size: Size, canvasScale: number = 15) {
    this.size = size;
    this.canvasScale = canvasScale;
    this.canvas = Canvas.createCanvas(this.size.width*canvasScale, this.size.height*canvasScale);
    this.ctx = this.canvas.getContext("2d");
  }

  init(colorData: ColorData) {
    this.ctx.fillStyle = "#252525";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (let y = 0; y < colorData.length; y++) {
      const row = colorData[y];
      for (let x = 0; x < row.length; x++) {
        this.drawPixel(row[x], x, y);
      }
    }
  }

  private drawPixel(color: string, x: number, y: number) {
    if (
      color === null ||
      x < 0 || x >= this.size.width ||
      y < 0 || y >= this.size.height
    ) return;
    
    const canvasScale = this.canvasScale;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x*canvasScale, y*canvasScale, canvasScale, canvasScale);
  }

  fillPixel(colorIdx: string, x: number, y: number) {
    if (
      colorIdx === null ||
      x < 0 || x >= this.size.width ||
      y < 0 || y >= this.size.height
    ) return false;

    this.drawPixel(colorIdx, x, y);
    return true;
  }

  isGetImageRangeVaild(from: Vector2={x: 0, y: 0}, to: Vector2={x: this.size.width-1, y: this.size.height-1}) {
    return (
      0 <= from.x && from.x < this.size.width &&
      0 <= from.y && from.y < this.size.height &&
      0 <= to.x && to.x < this.size.width &&
      0 <= to.y && to.y < this.size.height &&
      from.x < to.x && from.y < to.y
    );
  }

  getImage(from: Vector2={x: 0, y: 0}, to: Vector2={x: this.size.width, y: this.size.height}, displayGrid=false) {
    const canvasScale = this.canvasScale;
    const size: Size = {
      width: to.x - from.x,
      height: to.y - from.y
    };

    let canvas: CanvasType | null = null;
    let ctx: CanvasRenderingContext2D | null = null;
    if (this.isGetImageRangeVaild(from, to)) {
      canvas = Canvas.createCanvas(size.width*canvasScale, size.height*canvasScale);
      ctx = canvas.getContext("2d")
      ctx.drawImage(
        this.canvas,
        from.x*canvasScale, from.y*canvasScale, size.width*canvasScale, size.height*canvasScale,
        0, 0, size.width*canvasScale, size.height*canvasScale
      );
    } else {
      canvas = this.canvas;
      ctx = this.ctx;
    }

    if (displayGrid) {
      ctx.strokeStyle = "#88888888";
      for (let x = 0; x < size.width; x++) {
        let strokePos = x * canvasScale;
        ctx.beginPath();
        ctx.moveTo(strokePos, 0);
        ctx.lineTo(strokePos, canvas.height);
        ctx.stroke();
        if (
          (x === 0 && from.x === from.y) ||
          (x !== 0 && x%5 === 0)
        ) {
          let xCoord = from.x + x + 1;
          const metrics = ctx.measureText(xCoord.toString());
          ctx.globalCompositeOperation = "difference";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(
            xCoord.toString(),
            strokePos + canvasScale/2 - metrics.width/2,
            canvasScale - (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)/2,
            canvasScale
          );
        }
      }
      for (let y = 0; y < size.height; y++) {
        let strokePos = y * canvasScale;
        ctx.beginPath();
        ctx.moveTo(0, strokePos);
        ctx.lineTo(canvas.width, strokePos);
        ctx.stroke();
        if (
          (y === 0 && from.x === from.y) ||
          (y !== 0 && y%5 === 0)
        ) {
          let yCoord = from.y + y + 1;
          const metrics = ctx.measureText(yCoord.toString());
          ctx.globalCompositeOperation = "difference";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(
            yCoord.toString(),
            canvasScale/2 - metrics.width/2,
            strokePos + canvasScale  - (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)/2,
            canvasScale
          );
        }
      }
    }
    ctx.globalCompositeOperation = "source-over";

    return canvas.toBuffer();
  }
}

export default DisplayCanvas;
