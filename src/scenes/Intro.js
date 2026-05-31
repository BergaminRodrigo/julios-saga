// Lore intro screen shown between Title and Pub.
// 4 text slides, each 5s auto-advance, then goes to Pub.
import { W, H, PAL, FONT, CSS } from '../config.js';

const SLIDES = [
  {
    title: 'OS NOVE REINOS ESTAVAM EM PERIGO',
    body: 'No coração da Floresta Vegana Sombria,\num antigo ser despertou de seu sono de séculos.',
  },
  {
    title: 'O ABACATE ANCIÃO',
    body: 'Discípulo do Bruxo Kale, o Abacate Ancião acredita\nque a carne deve desaparecer dos nove reinos.\n\nSeu poder cresce a cada lua — raízes prendem viajantes,\nvinhas destroem aldeias, e nenhum guerreiro\nretornou da floresta.',
  },
  {
    title: 'UMA AMEAÇA AO BURGER SUPREMO',
    body: 'O Pub Jarl Júlio — o melhor gastropub nórdico\ndas nove reinos — está na mira.\n\nSem carne, não há Burger Supremo.\nSem Burger Supremo, não há razão para viver.',
  },
  {
    title: 'ENTRA EM CENA: JARL JÚLIO',
    body: 'Chef Viking. Nível 35. Porta-espátula sagrada.\n\nQuando nenhum herói se atreveu a entrar na floresta,\nJúlio larguou o avental, pegou a espátula\ne saiu pela porta do pub.',
    subtitle: 'A jornada começa agora.',
  },
];

export class Intro extends Phaser.Scene {
  constructor() { super('Intro'); }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this._idx = 0;
    this._buildSlide();
  }

  _buildSlide() {
    const s = SLIDES[this._idx];

    // dark bg
    this.add.rectangle(W/2, H/2, W, H, PAL.bg, 1).setScrollFactor(0);
    // ember glow top
    this.add.rectangle(W/2, 0, W, H, PAL.ember, 0.04).setOrigin(0.5, 0);

    // slide counter
    this.add.text(W - 20, 20, `${this._idx + 1} / ${SLIDES.length}`,
      { fontFamily:'"JetBrains Mono", monospace', fontSize:'12px', color:CSS.muted })
      .setOrigin(1, 0).setScrollFactor(0);

    // title
    this.add.text(W/2, H * 0.28, s.title,
      { fontFamily:FONT, fontSize:'26px', color:CSS.ember2, align:'center' })
      .setOrigin(0.5).setScrollFactor(0);

    // horizontal rule
    this.add.rectangle(W/2, H * 0.38, 460, 2, PAL.ember, 0.5).setScrollFactor(0);

    // body
    this.add.text(W/2, H * 0.52, s.body,
      { fontFamily:'"JetBrains Mono", monospace', fontSize:'15px', color:CSS.ink,
        align:'center', lineSpacing:8, wordWrap:{ width: W - 120 } })
      .setOrigin(0.5).setScrollFactor(0);

    // optional subtitle
    if (s.subtitle) {
      this.add.text(W/2, H * 0.78, s.subtitle,
        { fontFamily:FONT, fontSize:'20px', color:CSS.leaf, align:'center' })
        .setOrigin(0.5).setScrollFactor(0);
    }

    // prompt
    const last = this._idx === SLIDES.length - 1;
    const prompt = this.add.text(W/2, H - 36,
      last ? '▶  COMEÇAR A JORNADA' : '▶  próximo slide',
      { fontFamily:FONT, fontSize:'16px', color: last ? CSS.ember2 : CSS.muted })
      .setOrigin(0.5).setScrollFactor(0);
    this.tweens.add({ targets:prompt, alpha:0.3, duration:600, yoyo:true, repeat:-1 });

    // tap/click or auto-advance after 5s
    this.input.once('pointerdown', () => this._next());
    this.input.keyboard?.once('keydown', () => this._next());
    this._slideTimer = this.time.delayedCall(5000, () => this._next());
  }

  _next() {
    if (this._done) return;
    this._idx++;
    if (this._idx >= SLIDES.length) {
      this._done = true;
      // all slides done, go to Pub
      this.cameras.main.fadeOut(220, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Pub'));
    } else {
      // next slide — clear and rebuild
      this.children.removeAll(true);
      this._buildSlide();
    }
  }
}
