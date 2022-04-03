import colorName from "color-name";
const colors = Object.fromEntries(Object.entries(colorName).map(([name, rgb]) => {
    return [name, rgbToHex(rgb)];
}));
function rgbToHex(rgb) {
    return "#" + rgb.map(v => numberToHex(v).padStart(2, "0")).join("");
    function numberToHex(n) {
        return n.toString(16);
    }
}
const colorLookup = Object.keys(colors);
function getIdxByColorName(name) {
    return colorLookup.indexOf(name);
}
function getColorByName(name) {
    if (isColorNameVaild(name)) {
        return colors[name];
    }
    return null;
}
function getColorByIdx(idx) {
    const colorName = colorLookup[idx];
    return getColorByName(colorName);
}
function isColorNameVaild(colorName) {
    return colors.hasOwnProperty(colorName);
}
export { colors, colorLookup, getIdxByColorName, getColorByName, getColorByIdx, };
