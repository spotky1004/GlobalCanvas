import DisplayCanvas from "./DisplayCanvas.js";
import createMatrix, { Matrix } from "../util/createMatrix.js";
import { getColorByIdx } from "../colors.js";
import type App from "./App.js";

export interface Size {
  width: number;
  height: number;
}

class Canvas {
  app: App;
  size: Size;
  data: Matrix<number>;
  displayCanvas: DisplayCanvas;

  constructor(app: App, size: Size) {
    this.app = app;
    this.size = {...size};
    this.data = createMatrix(this.size.width, this.size.height, -1 as number);
    this.displayCanvas = new DisplayCanvas(size);
    
    this.init(this.data);
  }
  
  init(colorData: Matrix<number>) {
    this.data = [...colorData].map(row => [...row]);
    this.displayCanvas.init(this.data.map(row => row.map(data => getColorByIdx(data) ?? "#00000000")));
  }

  fillPixel(userId: string, guildId: string, colorIdx: number, x: number, y: number) {
    const pixelColor = getColorByIdx(colorIdx);
    if (
      pixelColor === null ||
      x < 0 || x >= this.size.width ||
      y < 0 || y >= this.size.height
    ) return false;
    
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
