// Forest of the Dark Vegan + Boss 01: Abacate Ancião (3 phases).
import { W, H, PAL, FONT, CSS } from '../config.js';
import { Julio } from '../player.js';
import { Controls } from '../controls.js';
import { Dialogue } from '../dialogue.js';

const A = 'public/assets';

let WORLD_W = 2800;
let ARENA_X  = 1900;
const GROUND_Y = 470;

const WIN_TEXT = [
  '⚔️ ABACATE ANCIÃO DERROTADO ⚔️',
  '',
  'As raízes recuam.',
  'A floresta silencia.',
  '',
  'Pela primeira vez em muito tempo,',
  'o céu volta a aparecer entre as copas.',
  '',
  'O poder do Abacate Ancião se desfaz em',
  'folhas levadas pelo vento, e um antigo',
  'pergaminho emerge do coração da floresta.',
  '',
  'Ao abri-lo, você encontra a verdadeira',
  'missão desta jornada:',
  '',
  '🎂  Feliz Aniversário!  🎂',
  '',
  'Nenhum boss é mais forte que a sua determinação.',
  'Nenhuma dungeon é maior que os caminhos',
  'que você já percorreu.',
  'Nenhuma conquista neste reino supera',
  'a pessoa incrível que você é.',
  '',
  'Que este novo nível da sua vida venha repleto',
  'de aventuras épicas, boas histórias,',
  'conquistas lendárias e muitos',
  'momentos para celebrar.',
  '',
  'Obrigado por fazer parte desta',
  'guilda chamada vida.',
  '',
  '⭐  NOVA CONQUISTA DESBLOQUEADA  ⭐',
  '',
  '"Mais um nível alcançado"',
  '',
  'Parabéns pelo seu aniversário!',
].join('\n');

export class Game extends Phaser.Scene {
  constructor() { super('Game'); }

  create() {
    this.cameras.main.fadeIn(320, 0, 0, 0);
    this.over = false;
    this.inArena = false;

    this._buildForest();
    ARENA_X = Math.round(WORLD_W * 0.78);
    this.physics.world.setBounds(0, 0, WORLD_W, H);
    this._buildGround();

    this.julio = new Julio(this, 120, GROUND_Y);
    this.julio.hp = 0;
    this.physics.add.collider(this.julio.s, this.solids);
    this.cameras.main.setBounds(0, 0, WORLD_W, H);
    this.cameras.main.startFollow(this.julio.s, true, 0.12, 0.12);

    this.pits = this.physics.add.group({ allowGravity: true });
    this.physics.add.overlap(this.pits, this.julio.s, (p) => {
      this.julio.hurt(p.x, 14); p.destroy();
    });
    this.boss = null; this.engaged = false; this._swingDone = false; this._bossTouchCd = 0;

    // burgers (heal on pickup)
    this._spawnBurgers();

    this.ctrl = new Controls(this, { attack: true, crouch: true });

    // music
    this.sound.stopAll();
    if (!this.cache.audio.exists('music_forest_boss')) {
      this.load.audio('music_forest_boss', `${A}/music/forest-boss.mp3`);
      this.load.once('complete', () => this._playGameMusic());
      this.load.start();
    } else {
      this._playGameMusic();
    }

    this._buildHud();

    // forest entry dialogues
    this.dialogueOpen = true;
    new Dialogue(this, {
      character: 'Júlio',
      text: 'Por Odin, que fome...',
      onClose: () => {
        this.time.delayedCall(400, () => {
          new Dialogue(this, {
            character: 'Júlio',
            text: 'Será que o pessoal da cozinha anotou tudo\nque precisava pegar no mercado? Hm...',
            onClose: () => { this.dialogueOpen = false; }
          });
        });
      }
    });
  }

  // ---- world ---------------------------------------------------------------
  _playGameMusic() {
    this._gameMusic = this.sound.add('music_forest_boss', { loop: true, volume: 0.6 });
    this._gameMusic.play();
  }

  _spawnBurgers() {
    this.burgers = this.physics.add.group();
    const positions = [400, 800, 1200, 1600];
    positions.forEach((x, i) => {
      let b;
      if (this.textures.exists('burger')) {
        b = this.burgers.create(x, GROUND_Y - 60, 'burger');
        b.setDisplaySize(35, 35);
      } else {
        // placeholder: orange circle
        b = this.add.circle(x, GROUND_Y - 60, 16, 0xe08a3c);
        this.physics.add.existing(b, false);
        this.burgers.add(b);
      }
      b.setData('isLast', i === positions.length - 1);
      b.body.setAllowGravity(false);
    });
    this.physics.add.overlap(this.julio.s, this.burgers, (julio, burger) => {
      const isLast = burger.getData('isLast');
      if (isLast) {
        this.julio.hp = this.julio.maxHp;
      } else {
        this.julio.hp = Math.min(this.julio.hp + 30, this.julio.maxHp);
      }
      burger.destroy();
    });
  }

  _buildForest() {
    const bg = this.add.image(0, 0, 'forest').setOrigin(0, 0).setDepth(-20);
    bg.setScale(H / bg.height);
    WORLD_W = Math.round(bg.displayWidth);
  }

  _buildGround() {
    this.solids = this.physics.add.staticGroup();
    const ground = this.add.rectangle(WORLD_W/2, GROUND_Y + 40, WORLD_W, 80, 0x000000, 0);
    this.solids.add(ground);
    const lw = this.add.rectangle(-10, H/2, 20, H*2, 0x000000, 0);
    this.solids.add(lw);
  }

  // ---- boss arena ----------------------------------------------------------
  _enterArena() {
    if (this.inArena) return;
    this.inArena = true;
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this._buildArena());
  }

  _buildArena() {
    // replace forest bg with boss arena
    this.children.list
      .filter(c => c.texture && (c.texture.key === 'forest'))
      .forEach(c => c.destroy());

    const ARENA_W = 1536;
    this.physics.world.setBounds(0, 0, ARENA_W, H);
    this.cameras.main.setBounds(0, 0, ARENA_W, H);

    const bg = this.add.image(0, 0, 'boss_arena').setOrigin(0, 0).setDepth(-20);
    bg.setScale(H / bg.height);
    const aW = Math.round(bg.displayWidth);

    // ground for arena
    const ground = this.add.rectangle(aW/2, GROUND_Y + 40, aW, 80, 0x000000, 0);
    this.solids.add(ground);
    // left/right walls
    this.solids.add(this.add.rectangle(-10, H/2, 20, H*2, 0x000000, 0));
    this.solids.add(this.add.rectangle(aW + 10, H/2, 20, H*2, 0x000000, 0));

    // reset julio to left of arena, slightly smaller to match arena scale
    this.julio.s.setPosition(180, GROUND_Y);
    this.julio.s.setVelocity(0, 0);
    this.julio.s.setScale(0.46);      // ~75% of default 0.62
    this.cameras.main.fadeIn(400, 0, 0, 0);

    this._spawnBoss(aW);
  }

  // ---- boss ----------------------------------------------------------------
  _spawnBoss(arenaW) {
    this.engaged = true;
    const bx = Math.round(arenaW / 2);          // boss in the centre of the arena
    const b = this.physics.add.sprite(bx, GROUND_Y - 4, 'boss').setOrigin(0.5, 1);
    b.setScale(1.1); b.body.setAllowGravity(false); b.setImmovable(true);
    b.body.setSize(b.width * 0.5, b.height * 0.7).setOffset(b.width*0.25, b.height*0.3);
    b.maxHp = 120; b.hp = 120; b.phase = 1;
    this.boss = b;

    this.physics.add.collider(b, this.solids);
    this.physics.add.overlap(b, this.julio.s, () => {
      if (this._bossTouchCd <= 0 && !this.over) { this.julio.hurt(b.x, 12); this._bossTouchCd = 800; }
    });

    this.bossHud.setVisible(true);
    this._roar('A NATUREZA IRÁ VENCER');
    this.throwTimer = this.time.addEvent({ delay: 1700, loop: true, callback: () => this._bossAttack() });
  }

  _bossAttack() {
    if (!this.boss || this.over) return;
    const b = this.boss, dir = this.julio.s.x < b.x ? -1 : 1;
    const n = b.phase >= 3 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const pit = this.pits.create(b.x - 30, b.y - b.displayHeight*0.55, 'boss');
      pit.setDisplaySize(26, 30).setTint(0x6b4a2a).setCircle(13, 0, 0);
      pit.body.setAllowGravity(true);
      pit.setVelocity(dir * (250 + i*40), -(260 + b.phase*40));
      pit.setData('ttl', 4000);
    }
  }

  _bossPhase() {
    const b = this.boss, r = b.hp / b.maxHp;
    const np = r > 0.66 ? 1 : r > 0.33 ? 2 : 3;
    if (np === b.phase) return;
    b.phase = np;
    if (np === 2) { b.setTint(0x9bd24a); this.throwTimer.delay = 1300; this._roar('O NÚCLEO DESPERTOU'); }
    if (np === 3) { b.setTint(0x6fae3a); b.setScale(1.2); this.throwTimer.delay = 950; this._roar('A FLORESTA É MINHA!'); }
  }

  _roar(text) {
    const t = this.add.text(W/2, 120, text, { fontFamily:FONT, fontSize:'30px', color:CSS.leaf })
      .setOrigin(0.5).setScrollFactor(0).setDepth(950).setShadow(0,3,'#000',0,true,true);
    this.cameras.main.shake(200, 0.008);
    this.tweens.add({ targets: t, alpha: 0, y: 90, duration: 1300, onComplete: () => t.destroy() });
  }

  // ---- HUD -----------------------------------------------------------------
  _buildHud() {
    this.add.text(16, 12, 'JÚLIO  Nv 35', { fontFamily:FONT, fontSize:'16px', color:CSS.ember2 })
      .setScrollFactor(0).setDepth(900);
    this.add.rectangle(16, 36, 220, 16, 0x000000, 0.5).setOrigin(0,0.5).setScrollFactor(0).setDepth(900)
      .setStrokeStyle(1, PAL.line);
    this.hpFill = this.add.rectangle(18, 36, 216, 12, PAL.blood).setOrigin(0,0.5).setScrollFactor(0).setDepth(901);

    this.bossHud = this.add.container(0, 0).setScrollFactor(0).setDepth(900).setVisible(false);
    const label = this.add.text(W/2, 16, 'ABACATE ANCIÃO', { fontFamily:FONT, fontSize:'18px', color:CSS.leaf }).setOrigin(0.5);
    const back  = this.add.rectangle(W/2, 40, 460, 16, 0x000000, 0.5).setStrokeStyle(1, PAL.line);
    this.bossFill = this.add.rectangle(W/2 - 228, 40, 456, 12, 0x7aa83a).setOrigin(0,0.5);
    this.bossHud.add([back, this.bossFill, label]);

    const hint = this.add.text(W/2, H-150, 'Use ⚔ para atacar · ⤒ para pular',
      { fontFamily:'"JetBrains Mono", monospace', fontSize:'12px', color:CSS.muted })
      .setOrigin(0.5).setScrollFactor(0).setDepth(900);
    this.time.delayedCall(4000, () => hint && hint.destroy());
  }

  // ---- victory screen ------------------------------------------------------
  _winScreen() {
    if (this.over) return;
    this.over = true;
    if (this.throwTimer) this.throwTimer.remove();
    if (this._gameMusic) this._gameMusic.stop();
    this.sound.stopAll();
    const playFinal = () => {
      this._victoryMusic = this.sound.add('music_final', { loop: false, volume: 0.6 });
      this._victoryMusic.play();
    };
    if (!this.cache.audio.exists('music_final')) {
      this.load.audio('music_final', `${A}/music/final.mp3`);
      this.load.once('complete', playFinal);
      this.load.start();
    } else {
      playFinal();
    }

    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.add.rectangle(W/2, H/2, W, H, PAL.bg, 1).setScrollFactor(0).setDepth(1200);

      // scrollable text panel
      const lines = WIN_TEXT;
      const txt = this.add.text(W/2, H + 40, lines, {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '13px',
        color: CSS.ink,
        align: 'center',
        lineSpacing: 6,
        wordWrap: { width: W - 80 },
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1201);

      // scroll up slowly then pause
      const totalH = txt.height + H + 80;
      this.tweens.add({
        targets: txt,
        y: -txt.height - 40,
        duration: totalH * 28,          // ~28ms per px
        ease: 'Linear',
        onComplete: () => {
          // achievement badge
          const badge = this.add.text(W/2, H/2, '⭐  NÍVEL 35 DESBLOQUEADO  ⭐\n\n"Mais um nível alcançado"', {
            fontFamily: FONT, fontSize: '26px', color: CSS.ember2, align: 'center', lineSpacing: 8,
          }).setOrigin(0.5).setScrollFactor(0).setDepth(1202).setAlpha(0);
          this.tweens.add({ targets: badge, alpha: 1, duration: 600 });
          this.time.delayedCall(3500, () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Title'));
          });
        },
      });

      this.cameras.main.fadeIn(600, 0, 0, 0);
    });
  }

  // ---- game over -----------------------------------------------------------
  _loseScreen() {
    if (this.over) return;
    this.over = true;
    if (this.throwTimer) this.throwTimer.remove();
    if (this._gameMusic) this._gameMusic.stop();
    this.add.rectangle(W/2, H/2, W, H, PAL.bg, 0.85).setScrollFactor(0).setDepth(1200);
    this.add.text(W/2, H/2 - 30, 'DERROTADO',
      { fontFamily:FONT, fontSize:'54px', color:CSS.leaf })
      .setOrigin(0.5).setScrollFactor(0).setDepth(1201).setShadow(0,4,'#000',0,true,true);
    this.add.text(W/2, H/2 + 34, 'Toque para tentar de novo',
      { fontFamily:'"JetBrains Mono", monospace', fontSize:'14px', color:CSS.muted })
      .setOrigin(0.5).setScrollFactor(0).setDepth(1201);
    this.input.once('pointerdown', () => {
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game'));
    });
  }

  // ---- loop ----------------------------------------------------------------
  update(_t, dt) {
    if (this.over || this.dialogueOpen) return;
    this.ctrl.poll();
    this.julio.update(this.ctrl, dt);
    if (this._bossTouchCd > 0) this._bossTouchCd -= dt;

    // trigger arena transition near end of forest
    if (!this.inArena && this.julio.s.x > ARENA_X) this._enterArena();

    if (this.boss) {
      this.boss.setFlipX(this.julio.s.x > this.boss.x);
      const box = this.julio.attackBox();
      if (box && !this._swingDone &&
          Phaser.Geom.Intersects.RectangleToRectangle(box, this.boss.getBounds())) {
        this.boss.hp = Math.max(0, this.boss.hp - 10);
        this._swingDone = true;
        this.boss.setTintFill(0xffffff);
        this.time.delayedCall(60, () => {
          if (!this.boss) return;
          const p = this.boss.phase;
          this.boss.clearTint();
          if (p === 2) this.boss.setTint(0x9bd24a);
          if (p === 3) this.boss.setTint(0x6fae3a);
        });
        this._bossPhase();
        if (this.boss.hp <= 0) {
          this.boss.destroy(); this.boss = null;
          this.time.delayedCall(800, () => this._winScreen());
        }
      }
      if (!this.julio.attackActive) this._swingDone = false;
    }

    // cull pits
    this.pits.children.iterate((p) => {
      if (!p) return;
      const ttl = p.getData('ttl') - dt; p.setData('ttl', ttl);
      if (ttl <= 0 || p.body.blocked.down || p.y > H + 50) p.destroy();
    });

    // hud
    this.hpFill.width = 216 * (this.julio.hp / this.julio.maxHp);
    if (this.boss) this.bossFill.width = 456 * (this.boss.hp / this.boss.maxHp);

    if (this.julio.dead) this.time.delayedCall(500, () => this._loseScreen());
  }
}
