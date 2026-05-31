// Julio's Saga — Phaser bootstrap. Phaser is loaded as a global (UMD) by index.html.
import { W, H, PAL } from './config.js';
import { Boot }  from './scenes/Boot.js';
import { Title } from './scenes/Title.js';
import { Intro } from './scenes/Intro.js';
import { Pub }   from './scenes/Pub.js';
import { Game }  from './scenes/Game.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: W, height: H,
  backgroundColor: PAL.bg,
  pixelArt: true,
  roundPixels: true,
  // Keep GPU footprint mobile-safe: render at 1x regardless of device DPR.
  resolution: 1,
  render: {
    powerPreference: 'low-power',
    failIfMajorPerformanceCaveat: false,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    max: { width: W, height: H },
  },
  input: { activePointers: 3 },        // multi-touch: move + jump together
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1500 }, debug: false },
  },
  scene: [Boot, Title, Intro, Pub, Game],
};

const game = new Phaser.Game(config);

// Recover WebGL context loss (OS reclaims GPU memory on mobile).
game.canvas.addEventListener('webglcontextlost', (e) => {
  e.preventDefault();
}, false);
game.canvas.addEventListener('webglcontextrestored', () => {
  window.location.reload();
}, false);
