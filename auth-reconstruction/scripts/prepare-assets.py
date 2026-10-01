from pathlib import Path
from PIL import Image
import json, shutil
root = Path(__file__).resolve().parents[1]
sources = Path('/Users/milushangdi/Desktop/wyr设计稿')
ledger = []
for mode, filename in [('login', '登录页.png'), ('signup', '注册页.png')]:
    source = sources / filename
    shutil.copy2(source, root / 'evidence' / mode / 'reference.png')
    image = Image.open(source)
    regions = {
        'logo': (54, 12, 247, 85) if mode == 'signup' else (60, 12, 240, 81),
        'hero-art': (465, 100, 1024, 815) if mode == 'signup' else (510, 100, 1024, 760),
        'top-left-cloud': (0, 85, 125, 220) if mode == 'signup' else (0, 81, 160, 237),
        'left-clouds': (0, 595, 177, 1536) if mode == 'signup' else (0, 600, 198, 1536),
        'right-clouds': (854, 815, 1024, 1536) if mode == 'signup' else (852, 760, 1024, 1536),
        'bottom-clouds': (177, 1386, 854, 1536) if mode == 'signup' else (198, 1388, 852, 1536),
        'favorite': (223, 1150, 388, 1266) if mode == 'signup' else (254, 1144, 386, 1224),
        'discussion': (427, 1147, 602, 1265) if mode == 'signup' else (452, 1145, 595, 1226),
        'world': (650, 1144, 807, 1265) if mode == 'signup' else (650, 1142, 795, 1223),
    }
    for name, box in regions.items():
        output = root / 'public/assets' / f'{mode}-{name}.png'
        image.crop(box).save(output)
        ledger.append({'source': str(source), 'asset': str(output.relative_to(root)), 'crop': box, 'size': Image.open(output).size, 'state': 'approved', 'evidence': 'Reference crop; no regeneration or interpolation'})
(root / 'evidence/assets.json').write_text(json.dumps({'original_total': len(ledger), 'states': {'approved':len(ledger),'deferred':0,'rejected':0,'unreviewed':0}, 'assets':ledger}, indent=2))
for mode in ['login', 'signup']:
    signup = mode == 'signup'
    regions = {
        'reference':'reference.png', 'css_viewport_width':1024,
        'expected': {'url':'http://127.0.0.1:4189/sign-up/' if signup else 'http://127.0.0.1:4189/', 'title':'WYRPLAY — Create Your Account' if signup else 'WYRPLAY — Sign In', 'viewport': {'width':1024, 'height':900}, 'dpr':1,'full_page':True,'screenshot_scale':'css'},
        'regions': [
            {'name':'header','box':[0,0,1024,90],'selector':'.site-header'},
            {'name':'auth-card','box':[177,649,677,737] if signup else [198,658,654,730],'selector':'.auth-card'},
            {'name':'google-button','box':[237,849,558,94] if signup else [246,854,564,92],'selector':'.google-button'},
            {'name':'magic-button','box':[237,966,558,95] if signup else [246,970,564,95],'selector':'.magic-button'},
            {'name':'title-ink','box':[274,714,487,56] if signup else [434,710,184,63],'box_type':'ink','selector':'.auth-card h2'},
            {'name':'hero-art','box':[465,100,559,715] if signup else [510,100,514,660],'selector':'.hero-art'},
        ]
    }
    (root/'evidence'/mode/'regions.json').write_text(json.dumps(regions,indent=2))
