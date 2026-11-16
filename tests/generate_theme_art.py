"""Rebuild the 10 new Vietnamese theme illustrations (requires cairosvg + Pillow).
Static art contains NO holiday captions: dates/names only appear in the settings form.
Each art layer stays isolated so animation never warps architecture, faces or the moon.
"""
from io import BytesIO
from pathlib import Path
import math
import cairosvg
from PIL import Image

ART=Path(__file__).resolve().parents[1]/'src/features/seasonal/art'
TAU=math.tau

def circle(x,y,r,fill,extra=''):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" {extra}/>'
def ellipse(x,y,rx,ry,fill,extra=''):return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}" {extra}/>'
def path(d,fill,extra=''):return f'<path d="{d}" fill="{fill}" {extra}/>'
def rect(x,y,w,h,fill,rx=0,extra=''):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" {extra}/>'
def star(x,y,r,color='#ffe293',r2=None):
    r2=r2 or r*.44
    pts=' '.join(f'{x+ (r if j%2==0 else r2)*math.sin(j*math.pi/5):.2f},{y-(r if j%2==0 else r2)*math.cos(j*math.pi/5):.2f}' for j in range(10))
    return f'<polygon points="{pts}" fill="{color}" stroke="#fff3b9" stroke-width="1"/>'
def cloud(x,y,s=1):
    return f'<g transform="translate({x} {y}) scale({s})" opacity=".85">'+ellipse(20,13,33,12,'#ffeddd')+circle(0,10,15,'#fff5ec')+circle(28,4,22,'#fdf0e1')+circle(53,12,12,'#ffdfce')+'</g>'
def petal(x,y,s=1,fill='#fc93b7',rotation=0):
    return f'<g transform="translate({x} {y}) rotate({rotation}) scale({s})">'+path('M0 0 C-19 -20 -11 -39 0 -47 C13 -37 19 -16 0 0Z',fill,'stroke="#ffe6ec" stroke-width="1.3"')+'</g>'
def lotus(x,y,s=1):
    p=ellipse(0,7,63,11,'#2b9b79','opacity=".78"')
    for i in [-55,-32,0,32,55]:p+=petal(i*.3,0,.92 if i==0 else .7,'#f89dbc',i*.7)
    p+=circle(0,0,8,'#f6cc67')+circle(0,0,4,'#fff2ab')
    return f'<g transform="translate({x} {y}) scale({s})">{p}</g>'
def flower(x,y,s=1,col='#f493a9'):
    p=''
    for i in range(5):p+=ellipse(0,-12,8,16,col,f'transform="rotate({i*72})" stroke="#ffe9ed" stroke-width="1"')
    p+=circle(0,0,6,'#ffcc5c')+circle(-2,-1,2,'#fff2ca')
    return f'<g transform="translate({x} {y}) scale({s})">{p}</g>'
def leaf(x,y,s=1,rotation=0):
    return f'<g transform="translate({x} {y}) rotate({rotation}) scale({s})">'+path('M0 0 Q9 -30 52 -31 Q46 3 0 0Z','url(#leaf)','stroke="#a5eac0" stroke-width="2"')+path('M0 0 L48 -28','none','stroke="#bee8b3" stroke-width="1.3"')+'</g>'
def roof(x,y,w=146,col='#ac3944'):
    return path(f'M{x} {y} Q{x+w*.25} {y-32} {x+w*.5} {y-29} Q{x+w*.75} {y-30} {x+w} {y} L{x+w-8} {y+9} Q{x+w*.5} {y-7} {x+8} {y+9}Z',col,'stroke="#f4c982" stroke-width="4"')
def lantern(x,y,scale=1):
    return f'<g transform="translate({x} {y}) scale({scale})">'+path('M0 -28V-19','none','stroke="#efd69c" stroke-width="2"')+ellipse(0,0,18,24,'url(#red)','stroke="#ffd47a" stroke-width="2"')+path('M-5 -23 Q-15 0 -5 23 M5 -23 Q15 0 5 23 M0 23 V41','none','stroke="#ffcd75" stroke-width="2"')+circle(0,3,8,'#ffb65e','opacity=".54"')+'</g>'
def butterfly(x,y,s=1):
    return f'<g transform="translate({x} {y}) scale({s})">'+ellipse(-14,-7,15,11,'url(#rose)','transform="rotate(28 -14 -7)"')+ellipse(14,-7,15,11,'url(#rose)','transform="rotate(-28 14 -7)"')+ellipse(-11,12,10,7,'#e58fd0','transform="rotate(-25 -11 12)"')+ellipse(11,12,10,7,'#e58fd0','transform="rotate(25 11 12)"')+rect(-2,-12,4,29,'#7b3c68',2)+'</g>'
def heart(x,y,s=1,col='#ff93ae'):
    return f'<g transform="translate({x} {y}) scale({s})">'+path('M0 32 C-49 -5 -31 -28 -13 -23 C-4 -22 0 -13 0 -13 C0 -13 6 -28 19 -24 C44 -15 37 4 0 32Z',col,'stroke="#ffd7e4" stroke-width="2"')+'</g>'
def skyline():
    return ''.join(rect(x,260-(i%4)*17,14+(i%3)*8,66+(i%4)*17,'#20385c',2) for i,x in enumerate(range(35,460,35)))
def rice():
    return ellipse(218,258,116,35,'#956243')+ellipse(218,249,103,27,'#f4d09a')+ellipse(218,247,93,18,'#faf6db')+''.join(circle(165+(i*23)%105,238+(i*13)%26,2.5,'#cab87b') for i in range(33))
def common_defs():
    return '''<defs>
    <linearGradient id="gold" x2=".1" y2="1"><stop stop-color="#fff4bd"/><stop offset=".5" stop-color="#f6c566"/><stop offset="1" stop-color="#ae6538"/></linearGradient>
    <linearGradient id="red" x2="1" y2="1"><stop stop-color="#ff725b"/><stop offset=".48" stop-color="#df283e"/><stop offset="1" stop-color="#870d32"/></linearGradient>
    <linearGradient id="rose" x2="1" y2="1"><stop stop-color="#ffdadd"/><stop offset=".5" stop-color="#f789b3"/><stop offset="1" stop-color="#c7539e"/></linearGradient>
    <linearGradient id="leaf" x2="1" y2="1"><stop stop-color="#cbf0a0"/><stop offset=".5" stop-color="#4ea975"/><stop offset="1" stop-color="#136d59"/></linearGradient>
    <linearGradient id="water" x2="1" y2="1"><stop stop-color="#b7ffea"/><stop offset=".5" stop-color="#288d9d"/><stop offset="1" stop-color="#164970"/></linearGradient>
    <linearGradient id="plum" x2="1" y2="1"><stop stop-color="#ff9ac0"/><stop offset=".5" stop-color="#7b4c82"/><stop offset="1" stop-color="#382453"/></linearGradient>
    <radialGradient id="halo"><stop stop-color="#ffe8a1" stop-opacity=".8"/><stop offset="1" stop-color="#fff5c2" stop-opacity="0"/></radialGradient>
    </defs>'''
def render(body,w=460,h=340):return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{common_defs()}{body}</svg>'
def save_svg(svg,dest,width,height):
    png=cairosvg.svg2png(bytestring=svg.encode(),output_width=width,output_height=height)
    im=Image.open(BytesIO(png)).convert('RGBA')
    im.save(dest,format='WEBP',quality=86,method=6)

def scene_nationalday():
    p=circle(282,172,155,'url(#halo)')+rect(50,286,380,18,'#613832',3)
    p+=rect(128,189,250,90,'#ca9e71',2)+rect(140,198,228,63,'#f0d7ae',2)
    for x in range(157,353,29):p+=rect(x,202,14,60,'#a26b59',1)+rect(x+2,204,4,59,'#fce2b6')
    p+=rect(111,272,287,14,'url(#gold)',2)+rect(150,176,207,15,'url(#gold)',2)
    p+=rect(217,155,74,17,'#a87955',2)+rect(222,152,64,6,'#edd59d')
    for x in [95,408]:p+=ellipse(x,270,34,28,'#3f9465')+ellipse(x+8,247,26,33,'#4a955b')
    p+=path('M98 128 L98 273','none','stroke="url(#gold)" stroke-width="7"')+star(97,120,8)
    return p

def scene_womenvn():
    p=circle(255,150,169,'url(#halo)')+path('M130 243 Q170 207 305 225 L353 308 L142 308Z','url(#rose)','stroke="#ffe0bb" stroke-width="4"')
    for x,y,s in [(185,145,1.0),(247,105,1.36),(309,151,1.10),(227,195,.92),(291,213,.76)]:
        p+=flower(x,y,s,'#f481a8')+flower(x-9,y-6,s*.45,'#ffcfdf')
        p+=leaf(x+15,y+24,.65,120)
    p+=path('M122 246 Q200 272 321 268','none','stroke="#ffc6d5" stroke-width="10"')
    p+=path('M183 259 Q135 231 130 301 Q193 284 209 266Z','url(#red)')+path('M215 268 Q263 231 285 311 Q235 299 203 271Z','url(#rose)')
    return p

def scene_family():
    p=circle(242,156,177,'url(#halo)')+path('M60 218 L221 87 L403 218','none','stroke="#f3cf9d" stroke-width="17" stroke-linejoin="round"')
    p+=path('M97 215 L221 113 L362 218 V310 H97Z','#cf9d81','stroke="#fff2ce" stroke-width="5"')+rect(119,226,222,84,'#af745d',5)
    p+=circle(185,179,31,'#f7d0ac')+circle(273,176,30,'#efba97')+circle(230,229,22,'#ffdab4')
    p+=ellipse(177,265,56,62,'#a05769')+ellipse(287,265,60,63,'#6b8e88')+ellipse(234,275,43,47,'#f5c36c')
    p+=heart(242,88,.75,'#ffb698')+heart(363,110,.34,'#ffd18a')
    return p

def scene_vulan():
    p=circle(232,92,79,'url(#halo)')+ellipse(244,296,208,23,'url(#water)')+ellipse(257,322,160,10,'#7ecac2','opacity=".35"')
    p+=rect(262,174,141,91,'#753c58',2)+roof(248,177,166,'#a94353')
    for x in [282,320,358,385]:p+=rect(x,191,8,72,'url(#gold)',2)
    p+=rect(250,262,164,7,'url(#gold)',2)
    p+=lotus(141,288,.75)+lotus(340,303,.54)+lotus(207,314,.4)
    p+=cloud(54,130,.82)+star(385,75,5)
    return p

def scene_hungking():
    p=circle(228,123,115,'url(#halo)')
    for x,s in [(-15,1.4),(190,1.0),(340,1.0)]:p+=path(f'M{x} 278 Q{x+85*s} {89} {x+190*s} 278Z','#3d6e61','opacity=".84"')
    p+=rect(156,162,185,123,'#d4ad79',4)+roof(141,154,213,'#ad3943')
    for x in [172,193,318,337]:p+=rect(x,170,9,115,'url(#gold)',2)
    p+=rect(217,206,58,79,'#6b423d',8)+rect(230,234,28,51,'#4e322f',2)
    p+=rect(144,288,213,9,'url(#gold)',3)+cloud(22,111,.75)+cloud(336,101,.77)
    return p

def scene_culture():
    p=circle(343,93,115,'none','stroke="#d7b27b" stroke-width="7" stroke-dasharray="6 9" opacity=".68"')
    for r in [80,98]:p+=circle(343,93,r,'none','stroke="#c59a62" stroke-width="2" opacity=".65"')
    p+=circle(234,144,137,'url(#halo)')
    p+=path('M174 140 C170 205 114 250 131 312 L292 312 Q255 235 249 153Z','url(#red)','stroke="#fcd1a3" stroke-width="3"')
    p+=circle(215,111,32,'#ffdcb9')+path('M181 105 Q184 38 231 61 Q270 86 248 156 Q236 144 234 135Z','#312a4d')
    p+=path('M145 81 Q218 8 290 81 Q225 100 145 81Z','url(#gold)','stroke="#f9edcc" stroke-width="3"')
    p+=path('M216 100 Q224 160 275 235','none','stroke="#e9c0aa" stroke-width="6"')
    p+=lotus(298,287,.88)+lotus(83,297,.58)
    return p

def scene_womensday():
    p=circle(235,145,158,'url(#halo)')
    p+=path('M109 219 Q220 292 342 219 L321 313 H140Z','url(#plum)','stroke="#ffe1e4" stroke-width="5"')
    for x,y,s,c in [(143,172,1,'#f8a6cb'),(206,108,1.1,'#ff8fa7'),(287,143,1.13,'#f494c4'),(247,201,.87,'#fdc3de'),(326,208,.8,'#ffc09c')]:
        p+=flower(x,y,s,c)+leaf(x+13,y+20,.59,94)
    p+=path('M103 242 Q248 265 358 242','none','stroke="#ffe0ec" stroke-width="8"')
    p+=butterfly(358,73,.62)
    return p

def scene_doanngo():
    p=circle(244,155,164,'url(#halo)')
    for x,y,s,r in [(47,89,1.75,55),(163,61,1.3,35),(320,74,1.1,20),(392,145,1.6,145)]:p+=leaf(x,y,s,r)
    p+=ellipse(217,268,169,44,'#ad764e')+ellipse(216,255,157,34,'#deb587')+ellipse(218,252,145,26,'#6d7c46')
    p+=circle(129,239,32,'url(#red)')+circle(179,220,26,'#d87c50')+circle(324,253,31,'#8a5164')
    p+=rect(207,212,72,41,'#f4f3d9',8)+ellipse(243,215,45,10,'#ffefcc')
    for x,y in [(105,220),(155,185),(317,221),(368,204)]:p+=leaf(x,y,.77,142)
    return p

def scene_nguyentieu():
    p=circle(255,115,100,'url(#halo)')+circle(255,115,59,'#f4dfa4')+circle(244,110,51,'#ffeab7','opacity=".60"')
    p+=cloud(41,139,.8)+cloud(281,148,.87)
    p+=rect(133,250,221,49,'#60344d',6)+roof(112,238,260,'#c14d43')
    for x in [159,213,265,319]:p+=rect(x,247,10,52,'url(#gold)',2)
    for x,y,s in [(113,99,.9),(366,115,1.0),(294,197,.65)]:p+=lantern(x,y,s)
    p+=lotus(108,311,.43)+lotus(350,312,.5)
    return p

def scene_newyear():
    p=circle(242,131,148,'url(#halo)')+skyline()+rect(34,298,407,14,'#314867',3)
    for x,y,r in [(119,118,45),(319,87,40),(387,143,30)]:
        for a in range(0,360,30):
            dx=math.cos(math.radians(a))*r;dy=math.sin(math.radians(a))*r
            p+=path(f'M{x+dx*.45:.1f} {y+dy*.45:.1f} L{x+dx:.1f} {y+dy:.1f}','none','stroke="#f9cd85" stroke-width="3" stroke-linecap="round"')
    p+=circle(242,185,64,'none','stroke="url(#gold)" stroke-width="6"')+path('M242 185V148 M242 185L269 205','none','stroke="#ffebc0" stroke-width="5" stroke-linecap="round"')
    return p

SCENES={
    'nationalday':scene_nationalday,'womenvn':scene_womenvn,'family':scene_family,'vulan':scene_vulan,
    'hungking':scene_hungking,'culture':scene_culture,'womensday':scene_womensday,'doanngo':scene_doanngo,
    'nguyentieu':scene_nguyentieu,'newyear':scene_newyear,
}
PALETTES={
    'nationalday':('#d84b42','#ffd47d'), 'womenvn':('#d06b9d','#ffe1d9'),
    'family':('#ec9e66','#fff0a8'), 'vulan':('#9e5686','#ffbca2'),
    'hungking':('#746b53','#eccc7d'), 'culture':('#2d998c','#efdca7'),
    'womensday':('#bd73c4','#ffe6f0'), 'doanngo':('#669c55','#e9d878'),
    'nguyentieu':('#a6537b','#ffd6a0'), 'newyear':('#6354ad','#f7d989'),
}
def piece(theme):
    if theme=='nationalday':return path('M25 30 C54 16 85 34 113 18 C135 22 157 40 178 25 L178 113 C147 127 123 101 99 114 C69 128 51 104 25 120Z','url(#red)','stroke="#ffc870" stroke-width="3"')+star(99,73,34,'#ffdf62')
    if theme in ('womenvn','womensday','culture'):return petal(95,125,2.1,'#f592bc',25)
    if theme=='family':return heart(105,95,2.0,'#ffac95')
    if theme=='vulan':return lotus(103,116,1.42)
    if theme=='hungking':return cloud(31,58,2.2)
    if theme=='doanngo':return leaf(60,121,2.0,-20)
    if theme=='nguyentieu':return lantern(107,96,2.06)
    if theme=='newyear':return star(100,94,45,'#fff0ba')
    raise ValueError(theme)
def medallion(theme,i):
    col,accent=PALETTES[theme]
    # Distinct visual placements and motifs across the eight functional cards.
    x=48+(i%3-1)*5;y=48+((i//3)%3-1)*4
    shell=circle(x,y,42,'url(#halo)')+circle(x,y,36,col,'opacity=".25"')
    if theme in ('womenvn','womensday','culture'):
        motif=flower(x,y,1.2,col) if i%3 else lotus(x,y,0.68)
    elif theme=='family':motif=heart(x,y-.5,1.08,col) if i%2 else path(f'M{x-23} {y+4} L{x} {y-18} L{x+24} {y+4} V{y+23} H{x-23}Z',col,'stroke="#ffefc7" stroke-width="3"')
    elif theme=='vulan':motif=lotus(x,y+9,.48) if i%2 else lantern(x,y,.8)
    elif theme=='hungking':motif=roof(x-28,y+12,56,col)+rect(x-19,y+17,39,15,'url(#gold)',2)
    elif theme=='doanngo':motif=leaf(x-22,y+14,.9,i*14) if i%2 else circle(x,y,20,'url(#red)')
    elif theme=='nguyentieu':motif=lantern(x,y,.76) if i%2 else circle(x,y,22,'#fbe5a7')
    elif theme=='nationalday':motif=star(x,y,26,'#ffe4a0') if i%2 else path(f'M{x-27} {y-20} Q{x} {y-4} {x+27} {y-20} V{y+22} Q{x} {y+10} {x-27} {y+22}Z','url(#red)')+star(x,y,12)
    else:motif=star(x,y,23,'#fff0c7') if i%2 else circle(x,y,20,'none','stroke="url(#gold)" stroke-width="5"')
    shell+=motif
    shell+=circle(x+27,y-27,5,accent,'opacity=".8"')
    return shell

def main():
    ART.mkdir(parents=True,exist_ok=True)
    for name,make in SCENES.items():
        save_svg(render(make()),ART/f'{name}-base-v2.webp',300,222)
        save_svg(render(piece(name),200,185),ART/f'{name}-piece-v2.webp',200,185)
        for i in range(1,9):
            save_svg(render(medallion(name,i),96,96),ART/f'{name}-card-{i}.webp',96,96)
    print('Generated',len(SCENES),'theme art sets /',len(SCENES)*10,'WebP files')
if __name__=='__main__':main()
