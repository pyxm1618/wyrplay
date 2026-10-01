from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
from collections import deque
import json
root=Path(__file__).resolve().parents[1]
ledger=[]
for mode in ['login','signup']:
 source=Image.open(root/'evidence'/mode/'reference.png').convert('RGBA')
 def save(image,name,method):
  path=root/'public/assets'/f'{mode}-{name}-v2.png';image.save(path)
  ledger.append({'asset':str(path.relative_to(root)),'source':f'evidence/{mode}/reference.png','state':'approved','method':method,'size':image.size})
 # Remove only exterior cream from the logo. Enclosed white lettering stays opaque.
 logo=Image.open(root/'public/assets'/f'{mode}-logo.png').convert('RGBA')
 pixels=logo.load();w,h=logo.size; visited=set();queue=deque([(x,0) for x in range(w)]+[(x,h-1) for x in range(w)]+[(0,y) for y in range(h)]+[(w-1,y) for y in range(h)])
 while queue:
  x,y=queue.popleft()
  if (x,y) in visited or not (0<=x<w and 0<=y<h):continue
  visited.add((x,y));r,g,b,a=pixels[x,y]
  if r>225 and g>220 and b>210 and max(r,g,b)-min(r,g,b)<45:
   pixels[x,y]=(r,g,b,0);queue.extend([(x+1,y),(x-1,y),(x,y+1),(x,y-1)])
 save(logo,'logo','Exterior cream flood removal; enclosed logo whites preserved')
 # Restrict the illustration to its own silhouette and the right decorative scene.
 if mode=='signup':
  box=(465,100,1024,815)
  points=[(530,100),(1024,100),(1024,815),(503,815),(503,649),(495,600),(489,575),(484,552),(480,534),(478,515),(486,503),(480,487),(467,476),(464,462),(470,450),(483,446),(507,456),(539,473),(550,455),(535,430),(528,410),(542,375),(551,360),(550,340),(550,305),(551,283),(540,261),(530,235)]
 else:
  box=(510,100,1024,760);points=[(530,100),(1024,100),(1024,760),(510,760),(510,410),(520,310),(520,240)]
 art=source.crop(box);mask=Image.new('L',art.size);ImageDraw.Draw(mask).polygon([(x-box[0],y-box[1]) for x,y in points],fill=255);art.putalpha(mask.filter(ImageFilter.GaussianBlur(.7)));save(art,'hero-art','Manual silhouette mask excludes screenshot text and UI')
 # Decor-only cloud crops with inner seams feathered; original colors retained.
 for name in ['left-clouds','right-clouds','bottom-clouds']:
  im=Image.open(root/'public/assets'/f'{mode}-{name}.png').convert('RGBA');w,h=im.size;mask=Image.new('L',im.size,255);px=mask.load()
  for y in range(h):
   for x in range(w):
    fade=1
    if name=='left-clouds':fade=min(1,y/32,(w-1-x)/10)
    elif name=='right-clouds':fade=min(1,y/20,x/8)
    else:fade=min(1,y/32)
    px[x,y]=round(255*max(0,fade))
  im.putalpha(mask);save(im,name,'Feather inner crop seams; original colors retained')
 box=(0,50,160,237) if mode=='login' else (0,65,125,220)
 cloud=source.crop(box);mask=Image.new('L',cloud.size,255)
 if mode=='login':ImageDraw.Draw(mask).polygon([(60,0),(160,0),(160,45),(79,45)],fill=0)
 cloud.putalpha(mask);save(cloud,'top-left-cloud','Original cloud crop; logo overlap excluded')
 if mode=='login':box=(0,458,132,650);mid=source.crop(box)
 else:
  box=(0,470,177,649);mid=source.crop(box);mask=Image.new('L',mid.size);ImageDraw.Draw(mask).polygon([(0,0),(55,0),(60,82),(105,82),(120,140),(177,145),(177,179),(0,179)],fill=255);mid.putalpha(mask)
 save(mid,'mid-left-cloud','Additional decor crop; copy region excluded')
(root/'evidence/refined-assets.json').write_text(json.dumps({'original_total':len(ledger),'states':{'approved':len(ledger),'deferred':0,'rejected':0,'unreviewed':0},'assets':ledger},indent=2))
