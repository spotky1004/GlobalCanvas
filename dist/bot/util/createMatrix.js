export default function createMatrix(x, y, defaultValue) {
    const matrix = Array(y).fill(null).map(_ => Array(x).fill(defaultValue));
    return matrix;
}
