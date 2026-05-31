// Júlio — player controller shared by Pub and Game scenes.
import { JULIO_SCALE, JULIO } from './config.js';

const SPEED = 175;            // ground move (world px/s)
const RUN   = 250;
const JUMP  = -560;
const BODY_W = 46, BODY_H = 116;   // physics body in source-texture px

export class Julio {
  constructor(scene, x, y, { gravity = true } = {}) {
    this.scene = scene;
    this.man = scene.registry.get('jman');     // frame dims, from the manifest
    const s = scene.physics.add.sprite(x, y, 'julio_idle', 0);
    s.setOrigin(0.5, 1).setScale(JULIO_SCALE);
    s.setCollideWorldBounds(true);
    s.body.setAllowGravity(gravity);
    this.s = s;
    this.facing = 1;
    this.cur = '';
    this.locked = false;       // attack/hurt animation lock
    this.attackActive = false;
    this.invuln = 0;
    this.maxHp = JULIO.hp; this.hp = JULIO.hp;
    this.dead = false;
    this.play('idle');

    s.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim) => {
      if (anim.key === 'attack' || anim.key === 'attack_charged') { this.locked = false; this.attackActive = false; }
      if (anim.key === 'hurt') this.locked = false;
    });
  }

  // play an anim and fit the physics body to that frame's cell (feet-anchored)
  play(key, ignoreIfPlaying = true) {
    if (this.cur === key && ignoreIfPlaying) return;
    this.cur = key;
    this.s.anims.play(key, true);
    const a = this.man[key];
    // body centered horizontally, anchored to bottom of the cell (the feet)
    this.s.body.setSize(BODY_W, BODY_H);
    this.s.body.setOffset((a.frameWidth - BODY_W) / 2, a.frameHeight - BODY_H);
  }

  hurt(fromX, dmg = 12) {
    if (this.invuln > 0 || this.dead) return;
    this.hp = Math.max(0, this.hp - dmg);
    this.invuln = 700;
    this.locked = true;
    this.attackActive = false;
    const dir = this.s.x < fromX ? -1 : 1;
    this.s.setVelocity(dir * 180, -220);
    this.play('hurt', false);
    this.scene.cameras.main.shake(120, 0.006);
    if (this.hp <= 0) this.dead = true;
  }

  // world-space rectangle of the spatula swing while a hit is live
  attackBox() {
    if (!this.attackActive) return null;
    const w = 78 * JULIO_SCALE * 1.6, h = 90 * JULIO_SCALE;
    const x = this.facing === 1 ? this.s.x : this.s.x - w;
    return new Phaser.Geom.Rectangle(x, this.s.y - 110 * JULIO_SCALE, w, h);
  }

  update(ctrl, dt) {
    if (this.dead) { this.s.setVelocityX(0); return; }
    if (this.invuln > 0) this.invuln -= dt;
    const body = this.s.body, onGround = body.blocked.down || body.touching.down;
    this.s.setAlpha(this.invuln > 0 ? (Math.floor(this.invuln / 80) % 2 ? 0.4 : 1) : 1);

    // attack (ground only, not already locked)
    if (ctrl.attackPressed && onGround && !this.locked) {
      this.locked = true;
      this.s.setVelocityX(0);
      this.play('attack', false);
      this.scene.time.delayedCall(110, () => { this.attackActive = true; });
      this.scene.time.delayedCall(300, () => { this.attackActive = false; });
    }

    if (this.locked) return;   // hurt / attack in progress

    // horizontal
    let vx = 0;
    if (ctrl.left)  { vx = -SPEED; this.facing = -1; }
    if (ctrl.right) { vx =  SPEED; this.facing =  1; }
    if (ctrl.down && onGround) vx = 0;
    this.s.setVelocityX(vx);
    this.s.setFlipX(this.facing === -1);

    // jump
    if (ctrl.jumpPressed && onGround) { this.s.setVelocityY(JUMP); this.play('jump', false); }

    // animation state
    if (!onGround) {
      this.play('jump', false);  // jump plays once, stays on last frame til landing
    } else if (ctrl.down) {
      this.play('crouch');
    } else if (vx !== 0) {
      this.play('run');
    } else {
      this.play('idle');
    }
  }
}
