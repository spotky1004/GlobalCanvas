const colors = {
  "Red": "#ed2424",
  "Dark Red": "#c41616",
  "Orange": "#ed8924",
  "Dark Orange": "#c46d16",
  "Yellow": "#eddc24",
  "Dark Yellow": "#c4b616",
  "Light Green": "#88ed24",
  "Dark Light Green": "#6dc416",
  "Green": "#24ed24",
  "Dark Green": "#16c416",
  "Turquoise": "#24edaa",
  "Dark Turquoise": "#16c48a",
  "Blue": "#24aaed",
  "Dark Blue": "#168ac4",
  "Indigo": "#2446ed",
  "Dark Indigo": "#1633c4",
  "Purlpe": "#aa24ed",
  "Dark Purple": "#8a16c4",
  "Violet": "#ed2489",
  "Dark Violet": "#c4166d",
  "Pink": "#ffc0cb",
  "Brown": "#7d3f09",
  "White": "#ffffff",
  "Grey": "#888888",
  "Black": "#000000",
};

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
