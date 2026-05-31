// Julio's Saga — shared config, palette and asset manifest.
// Palette lifted from the design handoff (asset-browser.html CSS vars).
export const PAL = {
  bg:0x15110c, panel:0x1f1812, panel2:0x271e16, line:0x3a2c1f,
  ink:0xefe3d2, muted:0xb39b80, faint:0x8a7458,
  ember:0xe08a3c, ember2:0xf0b35a, leaf:0x9bb24a, blood:0x9c3b34,
};
export const CSS = { ink:'#efe3d2', muted:'#b39b80', ember:'#e08a3c', ember2:'#f0b35a', leaf:'#9bb24a' };
export const FONT = '"Pixelify Sans", system-ui, sans-serif';

export const W = 960, H = 540;          // base render resolution (16:9)

// Player display scale (sprite cells are ~140-164px tall in source art).
export const JULIO_SCALE = 0.62;

// Animation manifest — mirrors public/assets/julio/julio.manifest.json
// (produced by tools/slice_julio.py). Each anim is its own strip texture.
export const JULIO_ANIMS = {
  idle:           { frameWidth:150, frameHeight:159, frames:4, fps:6,  loop:true  },
  walk:           { frameWidth:101, frameHeight:159, frames:6, fps:10, loop:true  },
  run:            { frameWidth:116, frameHeight:134, frames:5, fps:12, loop:true  },
  jump:           { frameWidth:145, frameHeight:134, frames:4, fps:10, loop:false },
  attack:         { frameWidth:103, frameHeight:146, frames:6, fps:14, loop:false },
  attack_charged: { frameWidth:206, frameHeight:146, frames:3, fps:8,  loop:false },
  block:          { frameWidth:155, frameHeight:141, frames:4, fps:8,  loop:false },
  hurt:           { frameWidth:155, frameHeight:141, frames:4, fps:10, loop:false },
  crouch:         { frameWidth:132, frameHeight:149, frames:3, fps:8,  loop:false },
  climb:          { frameWidth:132, frameHeight:149, frames:3, fps:8,  loop:true  },
  fall:           { frameWidth:132, frameHeight:149, frames:3, fps:8,  loop:false },
};

// For now each action shows ONE static "principal" frame (no animation cycle).
// Index into that action's strip — picked as the most readable pose. Flip back
// to full animation later by restoring generateFrameNumbers in Boot.js.
export const PRINCIPAL = {
  idle:1, walk:3, run:3, jump:2, fall:0, attack:1, attack_charged:1,
  block:1, hurt:0, crouch:1, climb:2,
};

// Julio stats (transcribed from the character card in the handoff README).
export const JULIO = {
  name:'Júlio', klass:'Chef Viking', level:35, hp:145, mp:60,
};
