// Julio's Saga — Phaser bootstrap. Phaser is loaded as a global (UMD) by index.html.
import { W, H, PAL } from './config.js';
import { Boot }  from './scenes/Boot.js';
import { Title } from './scenes/Title.js';
import { Intro } from './scenes/Intro.js';
import { Pub }   from './scenes/Pub.js';
import { Game }  from './scenes/Game.js';

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const config = {
  type: isMobile ? Phaser.CANVAS : Phaser.AUTO,
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
    mode: Phaser.Scale.FIT,           // keep 16:9, no distortion
    autoCenter: Phaser.Scale.CENTER_BOTH,
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

// Recompute FIT/centering when the device rotates or the viewport resizes.
function refreshScale() { game.scale.refresh(); }
window.addEventListener('orientationchange', () => setTimeout(refreshScale, 100));
window.addEventListener('resize', refreshScale);

// On mobile, go fullscreen on the first tap (removes the browser URL bar so
// the 16:9 canvas uses the whole screen height). Needs a user gesture.
if (isMobile) {
  const goFs = () => {
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req && !document.fullscreenElement) req.call(el).catch(() => {});
    setTimeout(refreshScale, 150);
    window.removeEventListener('pointerdown', goFs);
  };
  window.addEventListener('pointerdown', goFs);
}
