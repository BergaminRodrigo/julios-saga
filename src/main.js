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
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: { activePointers: 3 },        // multi-touch: move + jump together
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1500 }, debug: false },
  },
  scene: [Boot, Title, Intro, Pub, Game],
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
