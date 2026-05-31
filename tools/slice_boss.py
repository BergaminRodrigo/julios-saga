import numpy as np
from PIL import Image
from pathlib import Path
SRC=Path("handoff/julio-s-saga/project/assets/bosses/abacate-anciao/abacate-anciao-sheet.png")
OUT=Path("public/assets/boss"); OUT.mkdir(parents=True,exist_ok=True)
im=Image.open(SRC).convert("RGBA"); W,H=im.size; print("boss sheet",W,H)
a=np.asarray(im).astype(np.int32); r,g,b=a[...,0],a[...,1],a[...,2]
mx=np.maximum(np.maximum(r,g),b); mn=np.minimum(np.minimum(r,g),b)
content=(mx>46)|((mx-mn)>16)
def keycrop(x0,y0,x1,y1,name):
    sub=content[y0:y1,x0:x1]
    ys=np.where(sub.any(1))[0]; xs=np.where(sub.any(0))[0]
    if not len(xs): print(name,"EMPTY"); return
    bx0,bx1,by0,by1=x0+xs[0],x0+xs[-1]+1,y0+ys[0],y0+ys[-1]+1
    crop=np.asarray(im).copy()[by0:by1,bx0:bx1]
    m=content[by0:by1,bx0:bx1]
    crop[...,3]=np.where(m,crop[...,3],0)
    Image.fromarray(crop,"RGBA").save(OUT/name)
    print(f"{name:18} bbox x[{bx0}-{bx1}] y[{by0}-{by1}] -> {bx1-bx0}x{by1-by0}")
# estimated regions (sheet 1313x1198). central main avocado:
keycrop(360,70,760,420,"boss_main.png")
# FASE 1 standalone (top-right)
keycrop(940,150,1240,470,"boss_phase1.png")
# FASE 2 (bottom-left)
keycrop(40,770,360,1110,"boss_phase2.png")
# FASE 3 (bottom-center/right)
keycrop(650,760,1060,1140,"boss_phase3.png")
