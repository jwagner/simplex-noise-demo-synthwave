import { vec3, mat4 } from 'gl-matrix';
import { Grid2D, iterateGrid2D } from './Grid2D';
import { createNoise2D } from 'simplex-noise';
import { fbm2d } from './fbm2d';
import alea from 'alea';

const rng = alea('B');
const simplexNoise2D = createNoise2D(rng);
const noise2D = fbm2d(simplexNoise2D, 2);

type Render = (t: number) => void;
export function renderer(ctx: CanvasRenderingContext2D, width: number, height: number): Render {

  const skyGradient = ctx.createLinearGradient(0, 0, 0, height / 4 * 3);
  skyGradient.addColorStop(0.0, '#1c014add');
  skyGradient.addColorStop(0.5, '#d40485dd');
  skyGradient.addColorStop(0.71, '#fd9554ee');
  skyGradient.addColorStop(1.0, '#000000ee');

  function renderSky() {
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height / 4 * 3);
  }

  const maxGridWidth = 64;
  const minGridWidth = 4;
  const gridWidth = Math.max(minGridWidth, Math.min((width / 16) | 0, maxGridWidth));
  const maxGridHeight = 64;
  const minGridHeight = 32;
  const gridHeight = Math.max(minGridHeight, Math.min((height / 16) | 0, maxGridHeight));

  const grid = new Grid2D(gridWidth, gridHeight, 3);

  function updateTerrain(t: number) {
    const gridPoint = vec3.create();
    iterateGrid2D(grid, (p, x, y, i) => {
      const speed = 0.02; //2;
      const terrainOffset = Math.floor(t * speed);
      const roadWidth = 0.03;
      const twistynessPeriod = 210;
      const roadTwistyness = 6 * Math.max(0, Math.sin((y - terrainOffset) / twistynessPeriod));
      const cornerPeriod = 10;
      const roadWinding = Math.sin(
        (y - terrainOffset) / cornerPeriod
      ) * roadTwistyness;
      const road = Math.max(
        roadWidth - 1,
        -Math.cos(((x + roadWinding) / grid.width - 0.5) * Math.PI * 2)
      ) + 1;
      const noiseScale = 0.15;
      const hillinessPeriod = 220;
      const hilliness = Math.abs(Math.sin((y - terrainOffset) / hillinessPeriod));
      const mountainHeight = 5;
      const mountainOffset = 2;
      const mountains = mountainOffset + noise2D(x * noiseScale, (y - terrainOffset) * noiseScale) * mountainHeight * hilliness;
      const elevation = road * mountains;
      vec3.set(gridPoint,
        -grid.width / 2 + x,
        -5 + elevation,
        5 + (grid.height - y) - t * speed % 1
      );
      vec3.transformMat4(gridPoint, gridPoint, projectionMatrix);
      // convert from ndc to pixel coordinates
      gridPoint[0] = (1 + gridPoint[0]) / 2 * width;
      gridPoint[1] = (1 + gridPoint[1]) / 2 * height;
      p[i] = gridPoint[0];
      p[i + 1] = gridPoint[1];
      p[i + 2] = (grid.height - y + (terrainOffset % 1)) / grid.height;
    });
  }

  const projectionMatrix = mat4.perspective(mat4.create(), 45, width / height, 0.1, 200);
  function drawGrid2D() {
    const { width: gridWidth, height: gridHeight, points, components: gridComponents } = grid;

    function index(x: number, y: number) {
      return (y * gridWidth + x) * gridComponents;
    }

    function moveTo(x: number, y: number) {
      const i = index(x, y);
      // Not quite sure why but rounding here saves ~2ms/frame
      ctx.moveTo(points[i], points[i + 1]);
    }

    function lineTo(x: number, y: number) {
      const i = index(x, y);
      ctx.lineTo(points[i], points[i + 1]);
    }

    function isInvisible(x: number, y: number) {
      const vertices = [
        index(x, y),
        index(x + 1, y),
        index(x + 1, y + 1),
        index(x, y + 1),
      ];

      // not on screen
      if (
        !vertices.some(v => points[v] >= 0) ||
        !vertices.some(v => points[v] <= width) ||
        !vertices.some(v => points[v + 1] >= 0) ||
        !vertices.some(v => points[v + 1] <= height)
      ) {
        return true;
      }


      const ax = points[vertices[1]] - points[vertices[0]];
      const ay = -points[vertices[1] + 1] - -points[vertices[0] + 1];
      const bx = points[vertices[3]] - points[vertices[0]];
      const by = -points[vertices[3] + 1] - -points[vertices[0] + 1];
      const cx = points[vertices[2]] - points[vertices[0]];
      const cy = -points[vertices[2] + 1] - -points[vertices[0] + 1];

      const magnitudeACrossB = (ax * by) - (ay * bx);
      const magnitudeACrossC = (ax * cy) - (ay * cx);

      if (magnitudeACrossB < 0 && magnitudeACrossC < 0) return true;

      return false;
    }

    ctx.strokeStyle = 'purple';
    ctx.fillStyle = '#03020afa';

    for (let y = 0; y < gridHeight - 1; y++) {
      const z = points[index(0, y) + 2];
      const fadeDistance = 0.8;
      ctx.globalAlpha = 1 - Math.max(0, z - fadeDistance) * (1 / (1 - fadeDistance));
      for (let x = 0; x < gridWidth - 1; x++) {
        // culling quads in javascript seems to be worth it
        if (isInvisible(x, y)) {
          continue;
        }

        // drawing each rect individually is faster and avoids self intersection issues
        ctx.beginPath();
        moveTo(x, y);
        lineTo(x + 1, y);
        lineTo(x + 1, y + 1);
        lineTo(x, y + 1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  return function render(t: number) {
    renderSky();

    updateTerrain(t);

    drawGrid2D();
  };
}

