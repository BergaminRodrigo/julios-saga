from PIL import Image
import numpy as np
im = Image.open("handoff/julio-s-saga/project/assets/characters/julio/julio-spritesheet.png").convert("RGBA")
a = np.asarray(im).astype(np.int32)
r,g,b = a[...,0],a[...,1],a[...,2]
mx = np.maximum(np.maximum(r,g),b); mn=np.minimum(np.minimum(r,g),b)
content = (mx>24)|((mx-mn)>10)
print("img",im.size)
rowc = content.sum(1)
# find runs
runs=[]; ys=np.where(rowc>3)[0]
if len(ys):
  s=ys[0]; p=ys[0]
  for y in ys[1:]:
    if y-p>8:
      runs.append((s,p)); s=y
    p=y
  runs.append((s,p))
for (s,e) in runs:
  print(f"band y={s}-{e} h={e-s} peakcols={int(rowc[s:e+1].max())}")
