import numpy as np
from PIL import Image
im=Image.open('public/assets/julio_src/idle/idle.png').convert('RGBA')
a=np.asarray(im).astype(np.int32); r,g,b,al=a[...,0],a[...,1],a[...,2],a[...,3]
mx=np.maximum(np.maximum(r,g),b)
print("alpha: min",al.min(),"frac<250",round((al<250).mean(),3))
print("corners RGB:",a[0,0,:3].tolist(), a[0,-1,:3].tolist(), a[-1,0,:3].tolist(), a[-1,-1,:3].tolist())
print("max-channel: bg sample rows mean",int(mx[:20,:20].mean()))
for thr in (28,45,60,75,90):
    print(f"thr {thr}: kept frac",round((mx>thr).mean(),3))
