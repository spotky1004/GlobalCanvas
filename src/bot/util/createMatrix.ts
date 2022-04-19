export type Matrix<T> = T[][];

export default function createMatrix<T extends number | string>(x: number, y: number, defaultValue: T){
  const matrix: Matrix<T> = Array(y).fill(null).map(_ => Array(x).fill(defaultValue));
  return matrix;
}
