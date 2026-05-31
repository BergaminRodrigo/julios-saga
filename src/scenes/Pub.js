// The Jarl Júlio pub — safe hub. Walk right to the door, enter the forest.
import { W, H, PAL, FONT, CSS } from '../config.js';
import { Julio } from '../player.js';
import { Controls } from '../controls.js';
import { Dialogue } from '../dialogue.js';

const A = 'public/assets';

export class Pub extends Phaser.Scene {
  constructor() { super('Pub'); }

  create() {
    this.cameras.main.fadeIn(280, 0, 0, 0);

    const bg = this.add.image(0, 0, 'pub_interior').setOrigin(0, 0);
    const sc = bg.height > 0 ? H / bg.height : 1;
    bg.setScale(sc);
    const worldW = bg.width > 0 ? bg.width * sc : W;
    this.physics.world.setBounds(0, 0, worldW, H);
    this.cameras.main.setBounds(0, 0, worldW, H);

    // invisible floor
    const floorY = H - 30;
    const floor = this.add.rectangle(worldW/2, floorY + 20, worldW, 60, 0x000000, 0);
    this.physics.add.existing(floor, true);

    // door glow at the far right (entrance to the forest)
    this.doorX = worldW - 90;
    const door = this.add.rectangle(this.doorX, floorY - 70, 70, 150, PAL.leaf, 0.12)
      .setStrokeStyle(2, PAL.leaf, 0.5);
    this.tweens.add({ targets: door, alpha: 0.28, duration: 900, yoyo: true, repeat: -1 });
    this.add.text(this.doorX, floorY - 158, 'FLORESTA →', { fontFamily:FONT, fontSize:'16px', color:CSS.leaf })
      .setOrigin(0.5);

    // player
    this.julio = new Julio(this, 120, floorY);
    this.physics.add.collider(this.julio.s, floor);
    this.cameras.main.startFollow(this.julio.s, true, 0.1, 0.1);

    this.ctrl = new Controls(this, { attack:false, crouch:false });
    this.dialogueOpen = true;

    this.sound.stopAll();
    if (!this.cache.audio.exists('music_pub')) {
      this.load.audio('music_pub', `${A}/music/music-pub.mp3`);
      this.load.once('complete', () => this._playPubMusic());
      this.load.start();
    } else {
      this._playPubMusic();
    }

    // opening dialogue (blocks movement until closed)
    new Dialogue(this, {
      character: 'Júlio',
      text: 'LURDEE, DESLIGA A PANELA\nQUE TENHO QUE SAIR!',
      onClose: () => { this.dialogueOpen = false; }
    });

    // HUD
    this.add.text(16, 14, 'PUB · JARL JÚLIO', { fontFamily:FONT, fontSize:'20px', color:CSS.ember2 })
      .setScrollFactor(0).setDepth(900);
    this.hint = this.add.text(W/2, 40, 'Use ◀ ▶ para andar — chegue à porta',
      { fontFamily:'"JetBrains Mono", monospace', fontSize:'13px', color:CSS.muted })
      .setOrigin(0.5).setScrollFactor(0).setDepth(900);

    this.entered = false;
  }

  update(_t, dt) {
    if (this.dialogueOpen) return;    // block update while dialogue open
    this.ctrl.poll();
    this.julio.update(this.ctrl, dt);
    if (!this.entered && this.julio.s.x > this.doorX - 50) {
      this.entered = true;
      if (this._pubMusic) this._pubMusic.stop();
      this.cameras.main.fadeOut(320, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game'));
    }
  }

  _playPubMusic() {
    try {
      this._pubMusic = this.sound.add('music_pub', { loop: true, volume: 0.6 });
      this._pubMusic.play();
    } catch (e) {
      console.error('music_pub failed:', e);
    }
  }
}
