from PIL import Image
import numpy as np
im=Image.open("handoff/julio-s-saga/project/assets/characters/julio/julio-spritesheet.png").convert("RGBA")
a=np.asarray(im).astype(np.int32); r,g,b=a[...,0],a[...,1],a[...,2]
mx=np.maximum(np.maximum(r,g),b); mn=np.minimum(np.minimum(r,g),b)
content=(mx>24)|((mx-mn)>10)
gold=(r>150)&(g>80)&(g<195)&(b<105)&((r-b)>80)
for (by0,by1) in [(58,225)]:
    reg=slice(by0,min(by0+36,by1+1)); content[reg][gold[reg]]=False
y0,y1=65,224
colc=content[y0:y1+1].sum(0)
def runs(m,gap,minw):
    idx=np.where(m)[0];out=[]
    if not len(idx):return out
    s=p=idx[0]
    for v in idx[1:]:
        if v-p>gap:
            if p-s+1>=minw:out.append((int(s),int(p)))
            s=v
        p=v
    if p-s+1>=minw:out.append((int(s),int(p)))
    return out
cr=[rn for rn in runs(colc>2,12,6) if rn[1]-rn[0]>=14]
print("runs(w):",[(r0,r1,r1-r0) for r0,r1 in cr])
# show colc around gutter 600-700
print("colc 600..700:",[int(colc[x]) for x in range(600,700,5)])
