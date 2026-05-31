# Build Júlio anim strips from hand-supplied per-action frame folders.
#
#   public/assets/julio_src/<action>/0.png,1.png,...   (drop clean frames here)
#
# For each action that has frames, this keys a near-black background if present,
# trims, and lays the frames onto a uniform feet-anchored cell -> one strip PNG
# + an updated entry in julio.manifest.json (marked source:"frames" so Boot plays
# the FULL animation for it, while untouched actions keep their single static
# frame from the concept-sheet slicer).
import json, re, numpy as np
from PIL import Image
from pathlib import Path
from collections import deque

SRC = Path("public/assets/julio_src")
OUT = Path("public/assets/julio")
man_path = OUT / "julio.manifest.json"
man = json.load(open(man_path)) if man_path.exists() else {}

FPS  = {"idle":6,"walk":10,"run":12,"jump":10,"attack":14,"attack_charged":8,
        "block":8,"hurt":10,"crouch":8,"climb":8,"fall":8}
LOOP = {"idle","walk","run","climb"}

def num(p):
    m = re.findall(r"\d+", p.stem)
    return int(m[0]) if m else 0

def _flood_bg(seedmask):
    # mark background = pixels matching seedmask that are reachable from the image
    # border (so white/black detail ENCLOSED by the character is preserved)
    H,W = seedmask.shape
    bg = np.zeros((H,W), bool); q = deque()
    for x in range(W):
        for y in (0,H-1):
            if seedmask[y,x] and not bg[y,x]: bg[y,x]=True; q.append((y,x))
    for y in range(H):
        for x in (0,W-1):
            if seedmask[y,x] and not bg[y,x]: bg[y,x]=True; q.append((y,x))
    while q:
        y,x = q.popleft()
        for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny,nx = y+dy,x+dx
            if 0<=ny<H and 0<=nx<W and seedmask[ny,nx] and not bg[ny,nx]:
                bg[ny,nx]=True; q.append((ny,nx))
    return bg

def load_keyed(path):
    im = Image.open(path).convert("RGBA")
    a = np.asarray(im).astype(np.int32)
    r,g,b,al = a[...,0],a[...,1],a[...,2],a[...,3]
    mx = np.maximum(np.maximum(r,g),b); mn = np.minimum(np.minimum(r,g),b)
    border = np.concatenate([r[0],r[-1],r[:,0],r[:,-1]])
    if (al < 250).mean() > 0.04:                 # already transparent -> trust alpha
        mask = al > 16
    elif border.mean() > 200:                    # white background -> flood-fill it
        white = (mx > 232) & ((mx-mn) < 18)
        mask = ~_flood_bg(white)
    else:                                         # dark background -> key near-black
        mask = mx > 28
    out = a.astype(np.uint8); out[...,3] = np.where(mask,255,0).astype(np.uint8)
    return Image.fromarray(out,"RGBA"), mask

def content_bbox(mask):
    ys = np.where(mask.any(1))[0]; xs = np.where(mask.any(0))[0]
    if not len(xs): return None
    return xs[0], ys[0], xs[-1]+1, ys[-1]+1

built = []
for action in sorted(p.name for p in SRC.iterdir() if p.is_dir()):
    files = sorted([p for p in (SRC/action).glob("*.png")], key=num)
    if not files: continue
    frames = []                       # (crop, leftExt, rightExt, height)
    for f in files:
        img, mask = load_keyed(f)
        bb = content_bbox(mask)
        if bb is None: continue
        l,t,rr,bbm = bb
        crop = img.crop((l,t,rr,bbm))
        cx = (l+rr)/2 - l             # bbox centre (frames are drawn centred)
        frames.append((crop, cx, crop.width-cx, crop.height))
    if not frames: continue
    half = max(max(le,re) for _,le,re,_ in frames)
    cw = int(np.ceil(half*2)) + 8
    ch = int(max(h for *_,h in frames)) + 6
    strip = Image.new("RGBA",(cw*len(frames),ch),(0,0,0,0))
    for i,(crop,le,_,h) in enumerate(frames):
        px = i*cw + int(round(cw/2 - le)); py = ch - h - 3   # feet centred, on floor
        strip.paste(crop,(px,py),crop)
    strip.save(OUT/f"{action}.png")
    man[action] = {"file":f"{action}.png","frameWidth":cw,"frameHeight":ch,
                   "frames":len(frames),"fps":FPS.get(action,8),
                   "loop":action in LOOP,"source":"frames"}
    built.append(f"{action}: {len(frames)}f  {cw}x{ch}")

json.dump(man, open(man_path,"w"), indent=2)
print("built from folders:")
for b in built: print("  ", b)
if not built: print("  (nenhum frame encontrado em public/assets/julio_src/*/)")
