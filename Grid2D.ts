export class Grid2D {
  readonly points: Float32Array;
  constructor(readonly width: number, readonly height: number, readonly components: number) {
    this.points = new Float32Array(width * height * components);
  }
}
export function iterateGrid2D(grid: Grid2D, callback: (points: Float32Array, x: number, y: number, i: number) => void) {
  const { width, points, components } = grid;
  const height = grid.points.length / width / components;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * components;
      callback(points, x, y, i);
    }
  }
}
