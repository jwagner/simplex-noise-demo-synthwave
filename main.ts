
import { volumeControls } from './volumeControls';
import { renderer } from './renderer';


let freezeTime = 0;

function hashchange() {
  const freezeMatch = location.hash.match(/freeze=(\d+)/);
  freezeTime = freezeMatch ? +freezeMatch[1] * 1000 : 0;
}
window.addEventListener('hashchange', hashchange);
hashchange();


function mainloop(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  function createRenderer() {
    const canvasRect = canvas.getBoundingClientRect();
    canvas.width = Math.max(canvasRect.width, window.innerWidth) | 0;
    canvas.height = Math.max(canvasRect.height, window.innerHeight) | 0;

    return renderer(ctx, canvas.width, canvas.height);
  }

  let render = createRenderer();

  window.addEventListener('resize', () => {
    render = createRenderer();
  });

  const start = performance.now();

  function tick() {
    const t = freezeTime ? freezeTime : performance.now() - start;
    render(t);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const canvas = document.getElementById('canvas');
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('c is not a canvas');

const ctx = canvas.getContext('2d', { alpha: false });
if (ctx === null) throw new Error('canvas does not support context 2d');

mainloop(canvas, ctx);

const music = document.getElementById('music');
if (!(music instanceof HTMLAudioElement)) throw new Error('music is not audio');
const volume = document.getElementById('volume');
if (!(volume instanceof HTMLDivElement)) throw new Error('volume is not div');

volumeControls(
  music,
  volume
);