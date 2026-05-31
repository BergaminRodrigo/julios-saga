import json, numpy as np
from PIL import Image
from pathlib import Path

SRC = Path("handoff/julio-s-saga/project/assets/characters/julio/julio-spritesheet.png")
OUT = Path("public/assets/julio"); OUT.mkdir(parents=True, exist_ok=True)

im = Image.open(SRC).convert("RGBA")
a = np.asarray(im).astype(np.int32)
r,g,b = a[...,0],a[...,1],a[...,2]
mx=np.maximum(np.maximum(r,g),b); mn=np.minimum(np.minimum(r,g),b)
content = (mx>18)|((mx-mn)>8)           # keep dark wood (spatula handle) too; bg #0d0d0d=13 still drops
H,W = content.shape

def runs(mask1d, gap, minw):
    idx=np.where(mask1d)[0]; out=[]
    if not len(idx): return out
    s=p=idx[0]
    for v in idx[1:]:
        if v-p>gap: 
            if p-s+1>=minw: out.append((s,p))
            s=v
        p=v
    if p-s+1>=minw: out.append((s,p))
    return out

rowc = content.sum(1)
bands = runs(rowc>3, gap=8, minw=40)            # coarse content bands

# Remove the gold UI label text above each cluster. Two passes:
#  1) scrub gold pixels in the top of the band (handles labels that overlap a
#     raised spatula, e.g. ATAQUE — sprite tops are hair/silver, never gold);
#  2) if a thin content strip still sits at the very top SEPARATED by a gap from
#     the sprite mass (e.g. CAINDO, whose dark outline survives the low key
#     threshold), clear that whole strip.
gold = (r>150)&(g>80)&(g<195)&(b<105)&((r-b)>80)
for (by0,by1) in bands:
    reg = slice(by0, min(by0+44, by1+1))
    content[reg][gold[reg]] = False
    sub = runs(content[by0:by1+1].sum(1) > 3, gap=4, minw=2)
    if len(sub) >= 2:
        s0,e0 = sub[0]
        if (e0-s0) < 22 and (sub[1][0]-e0) >= 4:        # thin label, gap to sprite
            content[by0+s0:by0+e0+1] = False

# keyed RGBA (bg -> transparent), built AFTER label scrub
keyed = a.copy().astype(np.uint8); keyed[...,3] = np.where(content,255,0).astype(np.uint8)
keyed_im = Image.fromarray(keyed,"RGBA")
keyed_im.save(OUT/"_keyed_full.png")

# layout: order of (anim, frames) clusters per band, left->right
LAYOUT = [
  [("idle",4),("walk",6)],
  [("run",5),("jump",4)],
  [("attack",6),("attack_charged",3)],
  [("block",4),("hurt",4)],
  [("crouch",3),("climb",3),("fall",3)],
]
FPS = {"idle":6,"walk":10,"run":12,"jump":10,"attack":14,"attack_charged":8,
       "block":8,"hurt":10,"crouch":8,"climb":8,"fall":8}
LOOP = {"idle":1,"walk":1,"run":1,"climb":1}

# pick the 5 sprite bands (tallest runs)
bands = sorted(bands, key=lambda t:-(t[1]-t[0]))[:5]
bands = sorted(bands)
assert len(bands)==5, f"expected 5 sprite bands got {len(bands)}"

def tight(x0,x1,y0,y1):
    sub=content[y0:y1+1, x0:x1+1]
    ys=np.where(sub.any(1))[0]; xs=np.where(sub.any(0))[0]
    if not len(xs) or not len(ys): return None
    return (x0+xs[0], y0+ys[0], x0+xs[-1]+1, y0+ys[-1]+1)

manifest={}
for (by0,by1), clusters in zip(bands, LAYOUT):
    # trim label rows: keep rows whose content-count is a real fraction of the
    # band peak (labels are thin text -> low count; sprites -> high count)
    brow = content[by0:by1+1].sum(1)
    keep = np.where(brow > 0.30*brow.max())[0]
    y0,y1 = by0+keep[0], by0+keep[-1]
    # column runs within sprite rows; drop stray thin runs (floating spatula etc.)
    colc = content[y0:y1+1].sum(0)
    cr = [rn for rn in runs(colc>2, gap=12, minw=6) if (rn[1]-rn[0])>=14]
    # Assign each column-run to one of the labelled clusters by its position.
    # (Gap-thresholding fails here: a raised spatula opens internal gaps WIDER
    # than the real gutter between clusters. Positional binning is robust — each
    # cluster's extent then comes only from the runs that actually belong to it,
    # so a stray spatula in the gutter can't steal a frame from its neighbour.)
    nc=len(clusters)
    xs=np.where(colc>2)[0]; lo,hi=int(xs[0]),int(xs[-1]); span=hi-lo
    assigned=[[] for _ in range(nc)]
    for rn in cr:
        c=(rn[0]+rn[1])/2
        ci=min(nc-1, int((c-lo)/span*nc))
        assigned[ci].append(rn)
    groups=[]
    for ci in range(nc):
        rl=assigned[ci]
        groups.append([(rl[0][0], rl[-1][1])] if rl
                      else [(int(lo+ci/nc*span), int(lo+(ci+1)/nc*span))])
    for (anim,nframes), grp in zip(clusters, groups):
        # Register frames to frame 0 by cross-correlating the lower-body column
        # profile (torso+legs, ignoring the raised spatula). A whole-frame integer
        # shift removes the perceived left/right "sliding" between frames without
        # distorting any frame; vertical is already stable (all feet rest on y1).
        MAXLAG = 26
        gx0=grp[0][0]; gx1=grp[-1][1]; fw=(gx1-gx0)/nframes
        Wf=int(round(fw))                                  # fixed slice width (equal profiles)
        slices=[]   # (full-slice crop, lower-body profile) per frame
        bh=y1-y0; low0=int(bh*0.45)                       # bottom 55% = body+legs
        for i in range(nframes):
            xs=int(round(gx0+i*fw)); xe=xs+Wf
            sub=content[y0:y1, xs:xe].astype(np.int32)
            prof=sub[low0:].sum(0).astype(np.float64)
            crop=keyed_im.crop((xs, y0, xe, y1))
            slices.append((crop, prof))
        ref=slices[0][1]
        def best_lag(p):
            best,bs=0,-1.0
            for lag in range(-MAXLAG,MAXLAG+1):
                if lag>0:  s=float((p[lag:]*ref[:len(ref)-lag]).sum())
                elif lag<0:s=float((p[:len(p)+lag]*ref[-lag:]).sum())
                else:      s=float((p*ref).sum())
                if s>bs: bs,best=s,lag
            return best
        lags=[best_lag(p) for (_,p) in slices]            # +lag => frame sits right of ref
        cw=Wf+2*MAXLAG; ch=int(bh)
        strip=Image.new("RGBA",(cw*nframes,ch),(0,0,0,0))
        for i,(crop,_) in enumerate(slices):
            px=i*cw+(MAXLAG-lags[i])                       # shift each frame onto the ref
            strip.paste(crop,(px,0),crop)
        strip.save(OUT/f"{anim}.png")
        manifest[anim]={"file":f"{anim}.png","frameWidth":int(cw),"frameHeight":int(ch),
                        "frames":int(nframes),"fps":FPS[anim],"loop":bool(LOOP.get(anim,0))}
        print(f"{anim:16} {nframes}f  cell {cw}x{ch}  y[{y0}-{y1}] x[{gx0}-{gx1}]")

json.dump(manifest, open(OUT/"julio.manifest.json","w"), indent=2)
print("\nwrote", OUT/"julio.manifest.json")
