import colorName from "color-name";

const colors = Object.fromEntries(Object.entries(colorName).map(([name, rgb]) => {
  return [name, rgbToHex(rgb)];
})) as { [K in keyof typeof colorName] : string };
function rgbToHex(rgb: [number, number, number]) {
  return "#" + rgb.map(v => numberToHex(v).padStart(2, "0")).join("");
  function numberToHex(n: number) {
    return n.toString(16);
  }
}

export type ColorTypes = keyof typeof colors;
const colorLookup = Object.keys(colors);


function getIdxByColorName(name: string) {
  return colorLookup.indexOf(name);
}
function getColorByName(name: string) {
  if (isColorNameVaild(name)) {
    return colors[name];
  }
  return null;
}
function getColorByIdx(idx: number) {
  const colorName = colorLookup[idx];
  return getColorByName(colorName);
}
function isColorNameVaild(colorName: string): colorName is ColorTypes {
  return colors.hasOwnProperty(colorName);
}

export {
  colors,
  colorLookup,
  getIdxByColorName,
  getColorByName,
  getColorByIdx,
};
