from PIL import Image, ImageDraw
import json
man=json.load(open('public/assets/julio/julio.manifest.json'))
order=['idle','walk','run','jump','attack','attack_charged','block','hurt','crouch','climb','fall']
rowh=150; pad=6
maxframes=max(a['frames'] for a in man.values())
cw=120
W=cw*maxframes+pad; Htot=rowh*len(order)
out=Image.new('RGBA',(W,Htot),(28,22,16,255)); d=ImageDraw.Draw(out)
for r,k in enumerate(order):
    a=man[k]; fw=a['frameWidth']; strip=Image.open('public/assets/julio/'+a['file'])
    y=r*rowh
    d.text((4,y+2),k,fill=(240,180,90,255))
    for i in range(a['frames']):
        fr=strip.crop((i*fw,0,i*fw+fw,a['frameHeight']))
        s=min((cw-8)/fw,(rowh-22)/a['frameHeight']); fr=fr.resize((int(fw*s),int(a['frameHeight']*s)))
        x=i*cw+pad
        for yy in range(y+18,y+rowh,14):
            for xx in range(x,x+cw,14):
                if (xx//14+yy//14)%2: d.rectangle([xx,yy,xx+14,yy+14],fill=(42,34,24,255))
        out.paste(fr,(x+(cw-fr.width)//2, y+rowh-fr.height-2),fr)
        d.text((x+2,y+16),str(i),fill=(155,178,74,255))
    d.line([(0,y),(W,y)],fill=(70,56,36,255))
out.save('tools/shots/allframes.png'); print(out.size)
