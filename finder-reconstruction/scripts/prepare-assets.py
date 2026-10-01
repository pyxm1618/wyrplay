from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1]
im=Image.open(root/'evidence/reference.png').convert('RGB')
crops={'logo':(40,8,160,51),'hero-character':(517,49,849,262),'left-top':(0,49,60,263),'left-edge':(0,366,21,1245),'right-edge':(828,328,849,1734),'left-bottom':(0,1245,261,1627),'bottom-left':(0,1713,46,1852),'bottom-right':(806,1713,849,1852),'bulb':(41,1734,141,1821)}
ys=[496,604,719,827,940,1045,1158,1269,1372,1483]
for n,y in enumerate(ys,1): crops[f'question-{n:02}']=(600,y,711,y+83)
for name,box in crops.items():im.crop(box).save(root/f'public/assets/{name}.png')
(root/'evidence/assets.json').write_text(json.dumps({'source':'reference.png','method':'original screenshot crops; no generative redraw or interpolation','crops':crops},indent=2))
regions=[{'name':'header','box':[42,9,777,42],'selector':'.site-header'},{'name':'search','box':[43,263,762,61],'selector':'.search-form'},{'name':'popular-searches','box':[43,325,762,41],'selector':'.popular-searches'},{'name':'filters','box':[21,396,221,845],'selector':'.filters'},{'name':'question-panel','box':[257,396,570,1170],'selector':'.question-panel'},{'name':'selection-bar','box':[21,1627,807,86],'selector':'.selection-bar'},{'name':'category-banner','box':[43,1734,763,94],'selector':'.category-banner'}]
for i,y in enumerate([485,595,705,815,925,1035,1147,1258,1368,1478],1):regions.append({'name':f'card-{i}','box':[265,y,555,101 if i<8 else 96],'selector':f'.question-card:nth-child({i})','group':'cards'})
(root/'evidence/regions.json').write_text(json.dumps({'reference':'reference.png','css_viewport_width':849,'expected':{'url':'http://127.0.0.1:4188/','title':'WYRPLAY — Find Questions','viewport':{'width':849,'height':900},'dpr':1,'full_page':True,'screenshot_scale':'css'},'regions':regions},indent=2))
