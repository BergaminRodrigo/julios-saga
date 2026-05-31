from PIL import Image, ImageDraw
import json, sys
man=json.load(open('public/assets/julio/julio.manifest.json'))
PRINCIPAL={'idle':0,'walk':0,'run':1,'jump':1,'fall':1,'attack':3,'attack_charged':1,'block':1,'hurt':0,'crouch':1,'climb':0}
keys=sys.argv[1:]
imgs=[]
for k in keys:
    a=man[k]; idx=min(PRINCIPAL.get(k,0),a['frames']-1); fw=a['frameWidth']
    fr=Image.open('public/assets/julio/'+a['file']).crop((idx*fw,0,idx*fw+fw,a['frameHeight']))
    imgs.append((k,idx,fr))
pad=10; cw=max(f.width for _,_,f in imgs); ch=max(f.height for _,_,f in imgs)
out=Image.new('RGBA',(len(imgs)*(cw+pad)+pad, ch+40),(30,24,18,255))
d=ImageDraw.Draw(out)
for i,(k,idx,fr) in enumerate(imgs):
    x=pad+i*(cw+pad)
    for yy in range(0,ch+40,16):
        for xx in range(x,x+cw,16):
            if (xx//16+yy//16)%2: d.rectangle([xx,yy+30,xx+16,yy+46],fill=(44,36,26,255))
    out.paste(fr,(x+(cw-fr.width)//2, 30+ch-fr.height),fr)
    d.text((x,8),f"{k} #{idx}",fill=(240,180,90,255))
out.save('tools/shots/inspect.png')
