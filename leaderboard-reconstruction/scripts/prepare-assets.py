from pathlib import Path
from PIL import Image
import json
root = Path(__file__).resolve().parents[1]
im = Image.open(root / 'evidence/reference.png').convert('RGBA')
# Only independent artwork is extracted. No question text, data or controls.
boxes = {
 'logo': (41, 7, 170, 53),
 'hero-art': (511, 50, 841, 343),
 'dog-cat': (257, 555, 422, 668),
 'travel': (456, 554, 626, 667),
 'pizza': (661, 555, 825, 668),
 'wealth': (299, 899, 362, 949),
 'city': (299, 963, 362, 1014),
 'music': (299, 1028, 362, 1078),
 'clock': (299, 1093, 362, 1144),
 'languages': (299, 1158, 362, 1209),
 'seasons': (299, 1223, 362, 1274),
 'space': (299, 1288, 362, 1339),
 'bulb': (42, 1029, 210, 1195),
 'footer-trophy': (55, 1639, 164, 1735),
 'sidebar-trophy': (48, 446, 105, 497),
 'medal-1': (510, 500, 572, 570),
 'medal-2': (307, 516, 371, 576),
 'medal-3': (711, 516, 776, 578),
}
ledger = []
for name, box in boxes.items():
    asset = im.crop(box)
    if name.startswith('medal'):
        # Remove only the connected cream canvas around the isolated medal.
        from collections import deque
        pixels = asset.load()
        width, height = asset.size
        queue = deque([(x,y) for x in range(width) for y in (0,height-1)] + [(x,y) for y in range(height) for x in (0,width-1)])
        visited = set()
        while queue:
            x,y = queue.popleft()
            if (x,y) in visited or not (0 <= x < width and 0 <= y < height): continue
            visited.add((x,y))
            r,g,b,a = pixels[x,y]
            if r > 225 and g > 222 and b > 206 and max(r,g,b)-min(r,g,b) < 35:
                pixels[x,y] = (r,g,b,0)
                queue.extend([(x-1,y),(x+1,y),(x,y-1),(x,y+1)])
    if name == 'footer-trophy':
        from PIL import ImageDraw
        mask = Image.new('L', asset.size, 0)
        ImageDraw.Draw(mask).polygon([(28,0),(56,3),(102,3),(109,10),(109,49),(88,63),(95,86),(97,93),(65,96),(53,86),(53,67),(20,52),(11,44),(5,29),(5,16),(11,12),(24,14)],fill=255)
        asset.putalpha(mask)
    if name == 'hero-art':
        # Remove the tiny subtitle fragment caught at the left crop boundary.
        from PIL import ImageDraw
        ImageDraw.Draw(asset).rectangle((0,233,13,257),fill=(0,0,0,0))
    asset.save(root / f'public/assets/{name}.png')
    ledger.append({'name': name, 'source': 'evidence/reference.png', 'box': list(box), 'state': 'approved', 'method': 'screenshot crop', 'transparent': name.startswith('medal') or name in ['hero-art', 'footer-trophy']})
# Decorative background consists only of the outer edges, free of page UI.
bg = Image.new('RGBA', im.size, (0, 0, 0, 0))
bg.paste(im.crop((0, 0, 27, 1812)), (0, 0))
bg.paste(im.crop((842, 0, 868, 1812)), (842, 0))
bg.paste(im.crop((0, 0, 62, 132)), (0, 0))
bg.paste(im.crop((0, 1298, 238, 1420)), (0, 1298))
bg.paste(im.crop((0, 1747, 868, 1812)), (0, 1747))
bg.save(root / 'public/assets/edge-decoration.png')
ledger.append({'name': 'edge-decoration', 'source': 'evidence/reference.png', 'state': 'approved', 'method': 'decorative edge extraction', 'transparent': True})
(root / 'evidence/assets.json').write_text(json.dumps({'original_total': len(ledger), 'approved': len(ledger), 'deferred': 0, 'confirmed_reject': 0, 'unreviewed': 0, 'assets': ledger}, indent=2))
regions = [
 ('header', [28,0,812,61], '.site-header'),
 ('hero', [28,61,812,280], '.hero'),
 ('category-tabs', [28,341,812,68], '.category-tabs'),
 ('sidebar', [27,429,197,833], '.sidebar'),
 ('top-three', [247,531,590,296], '.podium'),
 ('dog-card', [247,554,183,273], '.question-card.dog'),
 ('travel-card', [444,531,193,296], '.question-card.travel'),
 ('pizza-card', [651,554,185,273], '.question-card.pizza'),
 ('top-ten', [242,890,602,459], '.ranking-list'),
 ('pagination', [344,1367,428,31], '.pagination'),
 ('stats', [28,1421,404,181], '.stats-panel'),
 ('hall', [448,1421,392,165], '.hall-panel'),
 ('footer-cta', [29,1628,811,119], '.footer-cta'),
]
manifest={'reference':'reference.png','css_viewport_width':868,'expected':{'url':'http://127.0.0.1:4188/','title':'WYRPLAY — Leaderboards','viewport':{'width':868,'height':900},'dpr':1,'full_page':True,'screenshot_scale':'css'},'regions':[{'name':name,'box':box,'selector':selector} for name,box,selector in regions]}
(root/'evidence/regions.json').write_text(json.dumps(manifest,indent=2))
