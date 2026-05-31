// Title screen — hero portrait, logo, tap/click to start.
import { W, H, PAL, FONT, CSS, JULIO } from '../config.js';

const A = 'public/assets';

export class Title extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    // dim exterior backdrop
    const bg = this.add.image(W/2, H/2, 'pub_exterior');
    bg.setScale(Math.max(W / bg.width, H / bg.height)).setTint(0x6b5a44).setAlpha(0.55);
    this.add.rectangle(W/2, H/2, W, H, PAL.bg, 0.55);
    this.add.rectangle(W/2, 0, W, H, PAL.ember, 0.06).setOrigin(0.5, 0);

    // portrait (1024x1536) on the right
    const port = this.add.image(W * 0.74, H + 10, 'portrait').setOrigin(0.5, 1);
    port.setScale((H * 1.02) / port.height);

    // logo + copy on the left
    const lx = W * 0.30;
    this.add.text(lx, H*0.30, 'JULIO\'S', { fontFamily:FONT, fontSize:'72px', color:CSS.ink })
      .setOrigin(0.5).setShadow(0, 4, '#000', 0, true, true);
    this.add.text(lx, H*0.30 + 64, 'SAGA', { fontFamily:FONT, fontSize:'92px', color:CSS.ember2 })
      .setOrigin(0.5).setShadow(0, 4, '#000', 0, true, true);
    this.add.text(lx, H*0.30 + 132, `${JULIO.klass} · Nv ${JULIO.level}`,
      { fontFamily:'"JetBrains Mono", monospace', fontSize:'15px', color:CSS.muted }).setOrigin(0.5);

    const prompt = this.add.text(lx, H*0.82, 'TOQUE PARA COMEÇAR',
      { fontFamily:FONT, fontSize:'22px', color:CSS.leaf }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.25, duration: 700, yoyo: true, repeat: -1 });

    // preload pub music for Intro → Pub transition
    if (!this.cache.audio.exists('music_pub')) {
      this.load.audio('music_pub', `${A}/music/music-pub.mp3`);
      this.load.start();
    }

    this.input.once('pointerdown', () => this.go());
    this.input.keyboard?.once('keydown', () => this.go());
  }

  go() {
    this.cameras.main.fadeOut(280, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Intro'));
  }
}
