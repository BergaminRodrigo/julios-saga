// RPG-style dialogue box overlay with character portrait + text.
// Everything lives in one container so close() removes ALL of it.
import { PAL, CSS, FONT } from './config.js';

export class Dialogue {
  constructor(scene, { character = 'Júlio', text = '', autoMs = 5000, onClose = null } = {}) {
    this.scene = scene;
    this.onClose = onClose;
    const W = scene.scale.width, H = scene.scale.height;
    const by = H - 180, bw = W - 60, bh = 160, bx = 30;

    const c = scene.add.container(0, 0).setScrollFactor(0).setDepth(2000);
    this.box = c;
    const close = () => this.close();

    // modal overlay (click anywhere closes)
    const overlay = scene.add.rectangle(W/2, H/2, W, H, 0x000000, 0.65)
      .setInteractive({ useHandCursor: true }).on('pointerdown', close);

    // portrait bottom-left
    const port = scene.add.image(40, H - 20, 'portrait').setOrigin(0, 1).setScale(0.28);

    // dialogue box
    const panel = scene.add.rectangle(bx, by, bw, bh, PAL.panel, 0.95)
      .setOrigin(0, 0).setStrokeStyle(2, PAL.ember);
    const name = scene.add.text(bx + 16, by + 12, character,
      { fontFamily: FONT, fontSize: '18px', color: CSS.ember2 });
    const body = scene.add.text(bx + 16, by + 40, text,
      { fontFamily: '"JetBrains Mono", monospace', fontSize: '14px', color: CSS.ink, wordWrap: { width: bw - 32 } });
    const prompt = scene.add.text(bx + bw - 20, by + bh - 16, '▼ clique / tecla',
      { fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: CSS.muted }).setOrigin(1, 1);
    scene.tweens.add({ targets: prompt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    c.add([overlay, port, panel, name, body, prompt]);

    scene.input.keyboard.once('keydown', close);   // any key closes
    this._timer = scene.time.delayedCall(autoMs, close);  // auto-dismiss
  }

  close() {
    if (this._closed) return;
    this._closed = true;
    if (this._timer) this._timer.remove();
    this.box.destroy(true);          // destroy container + all children
    if (this.onClose) this.onClose();
  }
}
