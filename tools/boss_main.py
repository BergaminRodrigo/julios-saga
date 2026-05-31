import numpy as np
from PIL import Image
from pathlib import Path
from collections import deque
SRC=Path("handoff/julio-s-saga/project/assets/bosses/abacate-anciao/abacate-anciao-sheet.png")
OUT=Path("public/assets/boss"); OUT.mkdir(parents=True,exist_ok=True)
im=Image.open(SRC).convert("RGBA")
x0,y0,x1,y1=360,70,760,420
crop=np.asarray(im).astype(np.int32)[y0:y1,x0:x1]
r,g,b=crop[...,0],crop[...,1],crop[...,2]
mx=np.maximum(np.maximum(r,g),b); mn=np.minimum(np.minimum(r,g),b)
m=(mx>46)|((mx-mn)>16)
H,W=m.shape
# largest connected component via BFS from densest central seed
seen=np.zeros_like(m,bool)
best=None
for sy in range(H//2-20,H//2+20,8):
    for sx in range(W//2-20,W//2+20,8):
        if m[sy,sx] and not seen[sy,sx]:
            q=deque([(sy,sx)]); seen[sy,sx]=True; comp=[]
            while q:
                y,x=q.popleft(); comp.append((y,x))
                for dy,dx in((1,0),(-1,0),(0,1),(0,-1)):
                    ny,nx=y+dy,x+dx
                    if 0<=ny<H and 0<=nx<W and m[ny,nx] and not seen[ny,nx]:
                        seen[ny,nx]=True; q.append((ny,nx))
            if best is None or len(comp)>len(best): best=comp
keep=np.zeros_like(m,bool)
for y,x in best: keep[y,x]=True
# fill internal holes per-row between first/last kept (avocado body is solid)
out=np.asarray(im).copy()[y0:y1,x0:x1]
out[...,3]=np.where(keep,out[...,3],0)
ys=np.where(keep.any(1))[0]; xs=np.where(keep.any(0))[0]
out=out[ys[0]:ys[-1]+1, xs[0]:xs[-1]+1]
Image.fromarray(out,"RGBA").save(OUT/"boss_main.png")
print("boss_main",out.shape[1],"x",out.shape[0],"comp_px",len(best))
