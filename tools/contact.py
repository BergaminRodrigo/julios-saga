from PIL import Image, ImageDraw
import json
man=json.load(open('public/assets/julio/julio.manifest.json'))
PRINCIPAL={'idle':1,'walk':3,'run':3,'jump':2,'fall':0,'attack':1,'attack_charged':1,'block':1,'hurt':0,'crouch':1,'climb':2}
order=list(man.keys())
cell=330; cols=3; rows=(len(order)+cols-1)//cols
sheet=Image.new('RGBA',(cols*cell,rows*cell),(28,22,16,255))
d=ImageDraw.Draw(sheet)
for i,k in enumerate(order):
    a=man[k]; idx=min(PRINCIPAL.get(k,0),a['frames']-1)
    fw=a['frameWidth']
    fr=Image.open('public/assets/julio/'+a['file']).crop((idx*fw,0,idx*fw+fw,a['frameHeight']))
    cx=(i%cols)*cell; cy=(i//cols)*cell
    # checkerboard bg to see transparency edges
    for yy in range(0,cell,16):
        for xx in range(0,cell,16):
            if (xx//16+yy//16)%2: d.rectangle([cx+xx,cy+yy,cx+xx+16,cy+yy+16],fill=(40,32,24,255))
    s=min((cell-30)/fw,(cell-30)/a['frameHeight'])
    fr2=fr.resize((int(fw*s),int(a['frameHeight']*s)))
    sheet.paste(fr2,(cx+(cell-fr2.width)//2, cy+cell-fr2.height-4),fr2)
    d.text((cx+6,cy+4),f"{k} #{idx} {fw}x{a['frameHeight']}",fill=(240,180,90,255))
    d.rectangle([cx,cy,cx+cell-1,cy+cell-1],outline=(80,64,40,255))
sheet.save('tools/shots/contact.png'); print('frames:',order)
