import { NoiseFunction2D } from 'simplex-noise';

export function fbm2d(noise2D: NoiseFunction2D, octaves: number): NoiseFunction2D {
  return function fbm2dFn(x: number, y: number) {
    let value = 0.0;
    let amplitude = 0.5;
    for (let i = 0; i < octaves; i++) {
      value += noise2D(x, y) * amplitude;
      x *= 0.5;
      y *= 0.5;
      amplitude *= 0.8;
    }
    return value;
  };
}
