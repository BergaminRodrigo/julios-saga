from PIL import Image
import json
cfg=json.load(open('public/assets/julio/julio.manifest.json'))
for k,a in cfg.items():
    w,h=Image.open('public/assets/julio/'+a['file']).size
    cells=w/a['frameWidth']
    ok=(w%a['frameWidth']==0) and h==a['frameHeight'] and abs(cells-a['frames'])<0.001
    print(f"{k:16} png {w}x{h}  cell {a['frameWidth']}x{a['frameHeight']} x{a['frames']}  cells={cells:.3f}  {'OK' if ok else '<<MISMATCH'}")
