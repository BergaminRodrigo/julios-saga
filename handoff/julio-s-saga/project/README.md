# Julio's Saga — Asset Pack

Art and reference assets for **Julio's Saga**, a simple 2D browser game.
This folder is organized as a **handoff package for Claude Code**: open it as a
project, read this file first, then build the game against the assets below.

> Theme: a Viking gastropub chef, **Jarl Júlio**, battles food-themed bosses.
> Pixel-art style, warm torch-lit palette, Norse + burger-joint flavor.

---

## 📁 Folder structure

```
.
├── README.md                     ← you are here (read first)
├── asset-browser.html            ← open in a browser to preview every asset
├── assets/
│   ├── animations.json           ← machine-readable sprite-sheet animation map
│   ├── characters/
│   │   └── julio/
│   │       ├── julio-spritesheet.png      (1254×1254) all player animations
│   │       ├── julio-portrait.png         (1024×1536) full-body hero render
│   │       └── julio-character-card.png   (1254×1254) RPG stat sheet
│   ├── bosses/
│   │   └── abacate-anciao/
│   │       └── abacate-anciao-sheet.png   (1313×1198) boss + 3 phases + minions
│   ├── backgrounds/
│   │   ├── pub-jarl-julio.png    (1536×1024) full original (exterior + interior)
│   │   ├── pub-exterior.png      (1536×589)  storefront — overworld / hub entrance
│   │   └── pub-interior.png      (1536×435)  bar scene — dialogue / shop / safe room
│   └── reference/                low-res previews + a distorted dupe (NOT for shipping)
```

---

## 🎮 Assets at a glance

| Asset | Use in game |
|---|---|
| `julio-spritesheet.png` | Player character animations (see breakdown below) |
| `julio-portrait.png`    | Title screen, dialogue portrait, pause/menu, character select |
| `julio-character-card.png` | Reference for stats/skills (don't ship as-is; transcribe values) |
| `abacate-anciao-sheet.png` | First boss — 3 phases with escalating forms + 2 minion types |
| `pub-exterior.png`      | Hub / level-select entrance, parallax background |
| `pub-interior.png`      | Shop, dialogue, save point, between-fight safe room |

---

## 🧍 Player — Júlio "Chef da Tribo"

The spritesheet (`julio-spritesheet.png`) is a **labeled concept layout**, NOT a
uniform grid. Frames vary in size and sit on a near-black background
(approx `#0d0d0d`). Before use you must either (a) slice each labeled row into
individual transparent PNGs, or (b) re-pack into a uniform atlas + key out the
black background. See `assets/animations.json` for the row map and frame counts.

**Animation rows (top→bottom, left→right):**

| State | Frames | Notes |
|---|---|---|
| `idle`           | 4 | Standing, breathing, spatula in hand |
| `walk`           | 6 | Cape flowing |
| `run`            | 5 | Leaning forward |
| `jump`           | 4 | Crouch → launch → apex → descend |
| `attack`         | 6 | Spatula swing reads as a sweeping arc (melee) |
| `attack_charged` | 3 | Wind-up → ground slam with spark FX (heavy/charged hit) |
| `block`          | 4 | Guard stance, ends with a shield-spark |
| `hurt`           | 4 | Taking damage / knockback, red impact spark |
| `crouch`         | 3 | Ducking |
| `climb`          | 3 | Climbing a ladder |
| `fall`           | 3 | Airborne → hard landing with dust puff |

### Stats (transcribed from the character card — tune freely)
- **Class:** Chef Viking · **Level:** 15 · **HP:** 145 · **MP:** 60
- **Attributes:** STR 16 · DEX 14 · CON 15 · INT 10 · WIS 12 · CHA 13
- **Gear:** Iron Spatula · Bearskin Cape · Runic Chef Coat · Legendary Burger · Ember Amulet
- **Skills:**
  - *Brasa Sagrada* — AoE fire damage + burn over time
  - *Burger Supremo* — heals the whole party
  - *Grito do Chef* — buffs team attack
  - *Fumaça Tática* — lowers enemy accuracy

---

## 🥑 Boss 01 — Abacate Ancião ("Elder Avocado")

*"Discípulo do Bruxo Kale."* A giant druidic avocado who rules the Dark Vegan
Forest and wants meat erased from the nine realms.

**Phases** (sprite for each is on the sheet):
1. **Fase 1 — "A Natureza Irá Vencer"** — base form, throws pits.
2. **Fase 2 — "O Núcleo Despertou"** — core glows, drips guacamole, stronger.
3. **Fase 3 — "A Floresta É Minha!"** — overgrown root-titan, full power.

**Attacks:** Pit Throw · Binding Roots · Guacamole Explosion · Chasing Vines ·
Leaf Storm · Summon Allies.

**Minions:** a spear-wielding **Carrot** and a shielded **Broccoli** (bottom-right
of the sheet) — summoned during the fight.

> The sheet also includes a color palette swatch (top-right). A distorted
> duplicate lives in `assets/reference/` — ignore it, it's not production art.

---

## 🍺 Backgrounds — The Jarl Júlio Pub

Norse gastropub, "PUB · Gastro Beer House."
- **Exterior** — storefront with barrel sign, runes, sandwich board. Good as the
  hub / level-select facade or a parallax backdrop.
- **Interior** — bar with fireplace, taps, menu board, Júlio behind the counter.
  Ideal for shop / dialogue / save-point scenes.

**Menu (lore/UI text):** Burgers — Supremo, Viking, Berserker, Veggie ·
Beers — Pilsen, IPA, Stout, Red Ale · Mead — Tradicional, Frutas, Especiado.
Tap handles are named **Thor, Freya, Vidar, Ulir**.

---

## 🛠️ Suggested build (for Claude Code)

- Plain **HTML5 `<canvas>`** + vanilla JS, or a light engine (Kaboom.js / Phaser).
- Load `assets/animations.json` to drive the player state machine.
- **First task:** slice `julio-spritesheet.png` rows into per-frame transparent
  PNGs (or an atlas) — everything else depends on this.
- Suggested loop: pub hub (interior) → enter forest → Abacate Ancião 3-phase fight.
- Keep the warm, torch-lit pixel palette consistent across new UI/FX.
