// Shared input: on-screen touch buttons (mobile) + keyboard (desktop).
// Exposes a plain state object the player reads each frame.
import { PAL, FONT } from './config.js';

export class Controls {
  constructor(scene, { attack = true, crouch = true } = {}) {
    this.scene = scene;
    this.state = { left:false, right:false, jump:false, attack:false, down:false };
    this._jumpEdge = false;     // true for one frame on a fresh jump press
    this._atkEdge  = false;

    this._bindKeyboard();
    this._buildButtons(attack, crouch);
  }

  _bindKeyboard() {
    const kb = this.scene.input.keyboard;
    const k = kb ? kb.addKeys('LEFT,RIGHT,UP,DOWN,A,D,W,S,SPACE,J,K') : {};
    this._keys = k;
  }

  _btn(x, y, r, glyph, color, onDown, onUp) {
    const s = this.scene;
    const g = s.add.circle(x, y, r, PAL.panel2, 0.55)
      .setStrokeStyle(2, color, 0.9).setScrollFactor(0).setDepth(1000)
      .setInteractive(new Phaser.Geom.Circle(r, r, r), Phaser.Geom.Circle.Contains);
    const t = s.add.text(x, y, glyph, { fontFamily:FONT, fontSize:`${Math.round(r*1.1)}px`, color:'#efe3d2' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(1001);
    const press = (on) => { g.setFillStyle(on ? color : PAL.panel2, on ? 0.8 : 0.55); };
    g.on('pointerdown', () => { press(true);  onDown(); });
    g.on('pointerup',   () => { press(false); onUp(); });
    g.on('pointerout',  () => { press(false); onUp(); });
    return { g, t };
  }

  _buildButtons(attack, crouch) {
    const s = this.scene, h = s.scale.height, w = s.scale.width;
    const r = 40, pad = 26, by = h - r - pad;
    // D-pad: left / right bottom-left
    this._btn(pad + r,            by, r, '◀', PAL.ember,
      () => this.state.left = true,  () => this.state.left = false);
    this._btn(pad + r*3 + 16,     by, r, '▶', PAL.ember,
      () => this.state.right = true, () => this.state.right = false);
    // Action: jump / attack bottom-right
    this._btn(w - pad - r,        by, r, '⤒', PAL.leaf,
      () => { this.state.jump = true; this._jumpEdge = true; }, () => this.state.jump = false);
    if (attack)
      this._btn(w - pad - r*3 - 16, by, r, '⚔', PAL.blood,
        () => { this.state.attack = true; this._atkEdge = true; }, () => this.state.attack = false);
    if (crouch)
      this._btn(w - pad - r,    by - r*2 - 14, r*0.8, '▼', PAL.faint,
        () => this.state.down = true, () => this.state.down = false);
  }

  // call once per update at top
  poll() {
    const k = this._keys, st = this.state;
    const kbLeft  = k.LEFT?.isDown  || k.A?.isDown;
    const kbRight = k.RIGHT?.isDown || k.D?.isDown;
    const kbDown  = k.DOWN?.isDown  || k.S?.isDown;
    const kbJump  = k.UP?.isDown || k.W?.isDown || k.SPACE?.isDown;
    const kbAtk   = k.J?.isDown || k.K?.isDown;

    this.left  = st.left  || kbLeft;
    this.right = st.right || kbRight;
    this.down  = st.down  || kbDown;

    const jumpNow = st.jump || kbJump;
    this.jumpPressed = (jumpNow && !this._jumpHeld) || this._jumpEdge;
    this._jumpHeld = jumpNow; this._jumpEdge = false;

    const atkNow = st.attack || kbAtk;
    this.attackPressed = (atkNow && !this._atkHeld) || this._atkEdge;
    this._atkHeld = atkNow; this._atkEdge = false;
  }
}
