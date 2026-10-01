from pathlib import Path
from PIL import Image,ImageDraw
from collections import deque
import json
root=Path(__file__).resolve().parents[1]; original=Image.open(root/'evidence/reference.png').convert('RGBA')
# Item-specific masks exclude neighboring question text, retaining the illustration.
mask_sizes={1:(28,33),3:(22,24),4:(20,23),5:(24,27),7:(14,22),8:(24,20),10:(25,25)}
for n,size in mask_sizes.items():
 p=root/f'public/assets/question-{n:02}.png';im=Image.open(p).convert('RGBA');ImageDraw.Draw(im).rectangle((0,0,*size),fill=(255,253,250,255));im.save(p)
extra={'filter-age':(42,474,68,500),'filter-group':(42,617,69,644),'filter-occasion':(42,763,69,791),'filter-style':(42,946,69,976),'filter-difficulty':(42,1058,69,1085),'crown':(485,401,532,441),'people':(337,562,356,578)}
for name,box in extra.items(): original.crop(box).save(root/f'public/assets/{name}.png')
# Remove only edge-connected near-white/cream backdrop, preserving enclosed eye highlights.
names=['logo','hero-character','bulb',*extra,*[f'question-{n:02}' for n in range(1,11)]]
for name in names:
 p=root/f'public/assets/{name}.png';im=Image.open(p).convert('RGBA');pix=im.load();w,h=im.size
 def backdrop(x,y):
  r,g,b,a=pix[x,y];return r>229 and g>219 and b>205 and max(r,g,b)-min(r,g,b)<42
 queue=deque();seen=set()
 for x in range(w):
  for y in [0,h-1]:
   if backdrop(x,y):queue.append((x,y));seen.add((x,y))
 for y in range(h):
  for x in [0,w-1]:
   if backdrop(x,y):queue.append((x,y));seen.add((x,y))
 while queue:
  x,y=queue.popleft();r,g,b,a=pix[x,y];pix[x,y]=(r,g,b,0)
  for nx,ny in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
   if 0<=nx<w and 0<=ny<h and (nx,ny) not in seen and backdrop(nx,ny):seen.add((nx,ny));queue.append((nx,ny))
 im.save(p)
ledger=json.loads((root/'evidence/assets.json').read_text());ledger['extra_crops']=extra;ledger['postprocessing']='Explicit neighboring-text masks for question artwork; edge-connected cream backdrop removal; no resize, invented image detail or generative model used.';(root/'evidence/assets.json').write_text(json.dumps(ledger,indent=2))
