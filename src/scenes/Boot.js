// Preload assets, then load Júlio's anim strips straight from the manifest the
// slicer produced (single source of truth — frame sizes never drift from code).
import { W, H, PAL, FONT, CSS, PRINCIPAL } from '../config.js';

const A = 'public/assets';

export class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    this.add.text(W/2, H - 60, 'carregando...', { fontFamily:'"JetBrains Mono", monospace', fontSize:'14px', color:CSS.muted }).setOrigin(0.5);
    this.load.on('loaderror', f => console.warn('asset 404:', f.src));

    this.load.json('jman', `${A}/julio/julio.manifest.json`);
    this.load.image('boss', `${A}/boss/boss_main.png`);
    this.load.image('pub_interior', `${A}/bg/pub-interior.png`);
    this.load.image('pub_exterior', `${A}/bg/pub-exterior.png`);
    this.load.image('forest', `${A}/bg/forest.png`);
    this.load.image('boss_arena', `${A}/bg/boss-arena.png`);
    this.load.image('portrait', `${A}/ui/julio-portrait.png`);
    this.load.image('burger', `${A}/burguer/burguer.png`);
  }

  create() {
    const man = this.cache.json.get('jman');
    this.registry.set('jman', man);

    for (const [key, a] of Object.entries(man))
      this.load.spritesheet(`julio_${key}`, `${A}/julio/${a.file}`,
        { frameWidth: a.frameWidth, frameHeight: a.frameHeight });

    this.load.once('complete', () => {
      for (const [key, a] of Object.entries(man)) {
        const lock = key === 'attack' || key === 'attack_charged' || key === 'hurt';
        if (a.source === 'frames') {
          this.anims.create({
            key,
            frames: this.anims.generateFrameNumbers(`julio_${key}`, { start: 0, end: a.frames - 1 }),
            frameRate: a.fps,
            repeat: a.loop ? -1 : 0,
          });
        } else {
          const idx = Math.min(PRINCIPAL[key] ?? 0, a.frames - 1);
          this.anims.create({
            key,
            frames: [{ key: `julio_${key}`, frame: idx }],
            duration: lock ? 380 : 1000,
            repeat: a.loop ? -1 : 0,
          });
        }
      }
      const splash = document.getElementById('boot');
      if (splash) splash.remove();
      this.scene.start('Title');
    });
    this.load.start();
  }
}
