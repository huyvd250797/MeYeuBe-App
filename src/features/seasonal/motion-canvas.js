/* V17.22.6 — Authentic seasonal motion. Shape renderers are adapted from the
   20-theme motion concepts approved in the fixed-layout preview. Static source
   photos never undergo transform/filter/canvas redraw; only this transparent
   foreground is painted. Two presets per theme have different drawing logic. */
(function(root){
  'use strict';
  const TWO=Math.PI*2;
  const rand=(i,seed=0)=>{const a=Math.sin((i+1)*12.9898+(seed+1)*78.233)*43758.5453;return a-Math.floor(a)};
  const smooth=(a,b,t)=>a+(b-a)*t;
  const loop=v=>v-Math.floor(v);
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  function create(canvas,id,selectedMode){
    const ctx=canvas?.getContext?.('2d',{alpha:true});
    if(!ctx)return {start(){},stop(){},destroy(){},renderAt(){}};
    const theme={id};
    const mode=selectedMode;
    const density=1.3; // restrained motion: preserve readability and FPS on phones
    let time=0, running=false, frame=0, last=null, lastPaint=null, sizeW=0,sizeH=0;
    function resize(){
      const rect=canvas.getBoundingClientRect?.();
      const w=rect?.width||canvas.clientWidth||240;
      const h=rect?.height||canvas.clientHeight||145;
      const dpr=Math.min(2,Math.max(1,root.devicePixelRatio||1));
      const pixelW=Math.round(w*dpr),pixelH=Math.round(h*dpr);
      if(canvas.width!==pixelW||canvas.height!==pixelH){
        canvas.width=pixelW;canvas.height=pixelH;
        ctx.setTransform(dpr,0,0,dpr,0,0);
      }
      sizeW=w;sizeH=h;
    }
    function clear(){ctx.clearRect(0,0,sizeW,sizeH);return [sizeW,sizeH]}
function ellipse(x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TWO);ctx.fillStyle=fill;ctx.fill()}
function star(x,y,r,fill,rot=0){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.beginPath();for(let i=0;i<10;i++){let a=-Math.PI/2+i*Math.PI/5,rr=i%2? r*.44:r;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.restore()}
function sparkle(x,y,r,alpha=1,color='#ffde96'){ctx.save();ctx.globalAlpha=alpha;const g=ctx.createRadialGradient(x,y,0,x,y,r*2);g.addColorStop(0,color);g.addColorStop(.18,color+'aa');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*2,0,TWO);ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(x-r*1.4,y);ctx.lineTo(x+r*1.4,y);ctx.moveTo(x,y-r*1.6);ctx.lineTo(x,y+r*1.6);ctx.stroke();ctx.restore()}
function petal(x,y,s,a,c1='#ffd1e4',c2='#d75083',alpha=.9){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.globalAlpha=alpha;ctx.shadowColor=c2;ctx.shadowBlur=s*.3;ctx.beginPath();ctx.moveTo(0,-s*.52);ctx.bezierCurveTo(s*.48,-s*.6,s*.65,s*.18,0,s*.64);ctx.bezierCurveTo(-s*.38,s*.38,-s*.46,-s*.3,0,-s*.52);const g=ctx.createLinearGradient(-s*.4,-s*.5,s*.35,s*.5);g.addColorStop(0,c1);g.addColorStop(.56,c1);g.addColorStop(1,c2);ctx.fillStyle=g;ctx.fill();ctx.restore()}
function petals(w,h,t,colors=['#f9cbd9','#d87997'],count=12,seed=0){let n=Math.max(2,Math.round(count*density/3));for(let i=0;i<n;i++){let fall=13+rand(i,seed)*17, phase=rand(i,seed+11),p=loop(t*fall/(h+40)+phase),x=w*(.53+rand(i,seed+3)*.44)+Math.sin(t*.47+i*2.6)*7+Math.sin(t*.19+i)*5,y=-11+p*(h+28),s=3.8+rand(i,seed+8)*5.2,a=t*(.48+rand(i,9)*.36)+i*2,fade=Math.min(1,p*8,(1-p)*7),alpha=fade*(.42+rand(i,seed+14)*.36);petal(x,y,s,a,colors[0],colors[1],alpha)}}
function snow(w,h,t,flakes=false){let n=Math.round((flakes?16:34)*density/2);for(let i=0;i<n;i++){let depth=rand(i,15),s=flakes?1.9+depth*2.7:0.9+depth*3.5,v=(5+depth*13)*(flakes?.78:1),p=loop(t*v/(h+28)+rand(i,11)),x=w*(.47+rand(i,22)*.51)+Math.sin(t*(.17+depth*.36)+i*4)*2.9,y=-5+p*(h+12);ctx.save();ctx.globalAlpha=Math.min(1,p*17,(1-p)*15)*(.2+depth*.5);if(flakes&&i%5===0){ctx.strokeStyle='#e0f2ff';ctx.lineWidth=.55;for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(x+Math.cos(k*Math.PI/3)*s,y+Math.sin(k*Math.PI/3)*s);ctx.lineTo(x-Math.cos(k*Math.PI/3)*s,y-Math.sin(k*Math.PI/3)*s);ctx.stroke()}}else{ctx.fillStyle='#eef9ff';ctx.beginPath();ctx.arc(x,y,s*.55,0,TWO);ctx.fill()}ctx.restore()}}
function fireworks(w,h,t,subtle=false){for(let b=0;b<(subtle?2:3);b++){let cycle=subtle?5.9:4.8,phase=loop(t/cycle+b*.43),start=.24,age=(phase-start)/.53;if(age<0||age>1)continue;let x=w*(.68+b*.12),y=h*(.22+(b%2)*.12),rad=7+age*(subtle?28:35),alpha=Math.pow(1-age,1.65)*.56;ctx.save();ctx.strokeStyle=subtle?'#ffdba2':'#f8d8af';ctx.lineWidth=.8;ctx.globalAlpha=alpha;for(let j=0;j<14;j++){let a=j*TWO/14+rand(j,b)*.1;let r1=rad*.45,r2=rad*(.83+rand(j,b+6)*.18);ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1);ctx.lineTo(x+Math.cos(a)*r2,y+Math.sin(a)*r2);ctx.stroke()}ctx.restore()}}
function lantern(x,y,s,t,hang=false,color='#ffab54'){ctx.save();ctx.translate(x,y);ctx.rotate(hang?Math.sin(t*.53)*.055:Math.sin(t*.5)*.025);if(hang){ctx.strokeStyle='#f6cd9966';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(0,-s*.9);ctx.lineTo(0,-s*.5);ctx.stroke()}const grad=ctx.createRadialGradient(-s*.2,-s*.15,0,0,0,s*.7);grad.addColorStop(0,'#fff1b8');grad.addColorStop(.46,color);grad.addColorStop(1,'#cc542d');ctx.shadowColor='#ffc078';ctx.shadowBlur=s*.5;ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(0,0,s*.38,s*.52,0,0,TWO);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#ffe4a8aa';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-s*.18,-s*.48);ctx.quadraticCurveTo(0,0,-s*.17,s*.48);ctx.moveTo(s*.18,-s*.48);ctx.quadraticCurveTo(0,0,s*.17,s*.48);ctx.stroke();ctx.fillStyle='#8b2d21';ctx.fillRect(-s*.18,s*.48,s*.36,2);ctx.strokeStyle='#f6cf6e';ctx.beginPath();ctx.moveTo(0,s*.52);ctx.lineTo(0,s*.74);ctx.stroke();ctx.restore()}
function starLantern(x,y,s,t){ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*.65)*.075);ctx.strokeStyle='#ffdd9b88';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(0,-s*1.5);ctx.lineTo(0,-s);ctx.stroke();ctx.shadowColor='#ffb356';ctx.shadowBlur=10;ctx.beginPath();for(let k=0;k<10;k++){let a=-Math.PI/2+k*Math.PI/5,rr=k%2?s*.42:s;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();const grad=ctx.createRadialGradient(0,0,0,0,0,s);grad.addColorStop(0,'#ffedab');grad.addColorStop(.5,'#ffb747');grad.addColorStop(1,'#d33b30');ctx.fillStyle=grad;ctx.fill();ctx.shadowBlur=0;ctx.lineWidth=2.2;ctx.strokeStyle='#ffdf9a';ctx.stroke();for(let k=0;k<5;k++){let a=-Math.PI/2+k*TWO/5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*s,Math.sin(a)*s);ctx.strokeStyle='#ffecb799';ctx.lineWidth=.85;ctx.stroke()}ctx.strokeStyle='#eab45a';ctx.beginPath();ctx.moveTo(0,s*.72);ctx.lineTo(0,s*1.28);ctx.stroke();ctx.restore()}
function lanterns(w,h,t){let n=Math.max(1,Math.round(density/1.4));for(let i=0;i<n;i++){let x=w*(.81+i*.115)+Math.sin(t*.34+i)*2,y=h*(.34+i*.12)-Math.sin(t*.2+i)*3;lantern(x,y,12+i*2,t,true,'#ef9a52')}}
function cloud(x,y,s,a){ctx.save();ctx.globalAlpha=a;let g=ctx.createRadialGradient(x,y,0,x,y,s);g.addColorStop(0,'#d6e9f7bb');g.addColorStop(.6,'#b3cade63');g.addColorStop(1,'#ffffff00');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,s*1.8,s*.52,0,0,TWO);ctx.fill();ctx.restore()}
function clouds(w,h,t,misty=false){for(let i=0;i<(misty?3:2);i++){let x=w*.63+loop(t/(misty?67:90)+i*.52)*w*.42-20,y=h*(.32+(i%2)*.29);cloud(x,y,36+i*16,misty?.09:.055)}}
function wave(w,h,t){ctx.save();ctx.beginPath();ctx.rect(0,h*.60,w,h*.4);ctx.clip();for(let k=0;k<3;k++){ctx.beginPath();let yy=h*(.78+k*.052),amp=2+k*1.2;for(let x=w*.24;x<=w;x+=4){let y=yy+Math.sin(x*.03-t*(.5+k*.15)+k)*amp+Math.sin(x*.068+t*.35)*1.3;if(x===w*.24)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.strokeStyle=k===0?'#e5ffff70':'#d7efff4b';ctx.lineWidth=k===0?1.7:1.1;ctx.stroke()}for(let i=0;i<14*density/2;i++){let x=w*(.5+rand(i,7)*.48),y=h*(.79+rand(i,11)*.17),a=.23+.22*Math.sin(t*.6+i*2);ellipse(x,y,1.5,1,'rgba(236,255,255,'+a+')')}ctx.restore()}
function flag(x,y,s,t,starColor='#ffe770'){ctx.save();ctx.translate(x,y);ctx.shadowColor='#0005';ctx.shadowBlur=2;ctx.fillStyle='#9e8a87';ctx.fillRect(-s*.65,-s*.3,2,s*.93);let ww=s*.85,hh=s*.45,flutter=Math.sin(t*1.6)*s*.05;ctx.beginPath();ctx.moveTo(-s*.65,-s*.28);ctx.bezierCurveTo(-s*.18,-s*.28+flutter,s*.25,-s*.38-flutter,s*.24,-s*.23);ctx.lineTo(s*.24,-s*.23+hh);ctx.bezierCurveTo(-s*.18,-s*.23+hh+flutter,-s*.33,-s*.21+hh-flutter,-s*.65,-s*.28+hh);ctx.closePath();const g=ctx.createLinearGradient(-s*.7,0,s*.3,0);g.addColorStop(0,'#ef2930');g.addColorStop(.53,'#c71929');g.addColorStop(1,'#f54b3d');ctx.fillStyle=g;ctx.fill();ctx.shadowBlur=0;star(-s*.19,-s*.27+hh*.48,s*.11,starColor);ctx.restore()}
function ribbon(w,h,t){ctx.save();ctx.globalAlpha=.67;let x=w*.43,y=h*.77;ctx.beginPath();ctx.moveTo(x,y);for(let i=0;i<48;i++){let xx=x+i*(w*.57)/47,yy=y+Math.sin(i*.17-t*.45)*5+Math.sin(i*.07+t*.35)*4;if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy)}ctx.strokeStyle='#ff9ca2';ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle='#ffdc878c';ctx.lineWidth=1.5;ctx.stroke();ctx.restore()}
function balloon(x,y,s,c,t){ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*.4+x)*.12);let grad=ctx.createRadialGradient(-s*.16,-s*.3,0,0,0,s*.8);grad.addColorStop(0,'#fff6f0');grad.addColorStop(.2,c);grad.addColorStop(1,'#774264');ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(0,0,s*.5,s*.66,0,0,TWO);ctx.fill();ctx.beginPath();ctx.moveTo(-4,s*.62);ctx.lineTo(0,s*.79);ctx.lineTo(4,s*.62);ctx.fillStyle=c;ctx.fill();ctx.strokeStyle='#ffffff88';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(0,s*.78);ctx.bezierCurveTo(4,s, -5,s*1.3, 1,s*1.7);ctx.stroke();ctx.restore()}
function balloons(w,h,t){const cols=['#ff9eb8','#ffd47c','#8dd1ff'];for(let i=0;i<3*density/2;i++){let p=loop(t/(15+rand(i,5)*6)+rand(i,3)),x=w*(.66+rand(i,4)*.28)+Math.sin(t*.38+i)*8,y=h+45-p*(h+100);balloon(x,y,14+rand(i,8)*8,cols[i%3],t)}}
function confetti(w,h,t){const cols=['#ffdfb7','#f7a7b9','#c9dded','#f5ecc8'];for(let i=0;i<Math.round(10*density/2);i++){let p=loop(t/(12+rand(i,2)*8)+rand(i,6)),x=w*(.53+rand(i,7)*.45)+Math.sin(t*.31+i)*6,y=-10+p*(h+20),r=t*(.38+rand(i,6));ctx.save();ctx.translate(x,y);ctx.rotate(r);ctx.globalAlpha=Math.min(p*8,(1-p)*9,.5);ctx.fillStyle=cols[i%4];ctx.fillRect(-1,-2.7,2,5);ctx.restore()}}
function candle(x,y,s,t){ctx.save();ctx.translate(x,y);ctx.fillStyle='#fcf0d8';ctx.fillRect(-s*.15,s*.2,s*.3,s*.44);ctx.fillStyle='#e9b8c9';ctx.fillRect(-s*.15,s*.2,s*.3,s*.07);let fire=Math.sin(t*3.2)*.11+Math.sin(t*6.2)*.06;ctx.shadowBlur=10;ctx.shadowColor='#ffbc65';ctx.beginPath();ctx.moveTo(0,s*.18);ctx.bezierCurveTo(-s*.22,-s*.04,-s*.12,-s*.22-fire*s,0,-s*.54-fire*s);ctx.bezierCurveTo(s*.17,-s*.22,s*.19,-s*.04,0,s*.18);ctx.fillStyle='#ffc353';ctx.fill();ctx.shadowBlur=0;ctx.beginPath();ctx.ellipse(0,-s*.13,s*.07,s*.17,0,0,TWO);ctx.fillStyle='#fff6ca';ctx.fill();ctx.restore()}
function candles(w,h,t){for(let i=0;i<3;i++)candle(w*(.65+i*.09),h*.71,24+i*2,t+i)}
function butterfly(x,y,s,t){ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*.35+x)*.12);const a=.3+.7*Math.abs(Math.cos(t*4.4));ctx.fillStyle='#ffe9ca';ctx.globalAlpha=.8;ctx.beginPath();ctx.ellipse(-s*.3,0,s*.4*a,s*.28,-.5,0,TWO);ctx.ellipse(s*.3,0,s*.4*a,s*.28,.5,0,TWO);ctx.fill();ctx.fillStyle='#f09c98';ctx.beginPath();ctx.ellipse(-s*.18,s*.25,s*.26*a,s*.20,.2,0,TWO);ctx.ellipse(s*.18,s*.25,s*.26*a,s*.20,-.2,0,TWO);ctx.fill();ctx.strokeStyle='#5a3c3b';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-s*.21);ctx.lineTo(0,s*.35);ctx.stroke();ctx.restore()}
function butterflies(w,h,t){for(let i=0;i<2*density/2;i++){let p=loop(t/(12+i*4)+rand(i,22));let x=w*(.5+p*.46),y=h*(.6-p*.36)+Math.sin(t*1.2+i)*12;butterfly(x,y,16+i*2,t+i)}}
function dragonfly(x,y,s,t){ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*.33+x)*.2);ctx.strokeStyle='#d0ffea99';ctx.fillStyle='#e1fff3aa';ctx.lineWidth=1;let wing=Math.sin(t*9)**2*.4+.6;for(let k of [-1,1]){ctx.save();ctx.scale(k,1);ctx.beginPath();ctx.ellipse(s*.2,-s*.19,s*.38*wing,s*.095,-.3,0,TWO);ctx.ellipse(s*.2,s*.18,s*.34*wing,s*.08,.35,0,TWO);ctx.fill();ctx.restore()}ctx.strokeStyle='#277d7e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-s*.28);ctx.lineTo(0,s*.43);ctx.stroke();ellipse(0,-s*.34,2.8,2.8,'#6bd6c5');ctx.restore()}
function dragonflies(w,h,t){for(let i=0;i<2*density/2;i++){let p=loop(t/(10+i*4)+rand(i,25)),x=w*(.45+.47*p),y=h*(.55-.27*p)+Math.sin(t*1.4+i)*10;dragonfly(x,y,18+i*2,t)}}
function leaves(w,h,t){for(let i=0;i<Math.round(7*density/2);i++){let p=loop(t/(17+rand(i,2)*8)+rand(i,6)),x=w*(.57+rand(i,8)*.4)+Math.sin(t*.41+i)*7,y=-12+p*(h+20);petal(x,y,5+rand(i,3)*3,Math.sin(t*.35+i)*.6,'#b8d98a','#517849',.42)}}
function phoenix(w,h,t){for(let i=0;i<Math.round(9*density/2);i++){let p=loop(t/(14+rand(i,2)*9)+rand(i,6)),x=w*(.56+rand(i,8)*.41)+Math.sin(t*.33+i)*7,y=-10+p*(h+20);petal(x,y,5+rand(i,3)*3,Math.sin(t*.37+i)*.7,'#f7ae7f','#c64a42',.55)}}
function plane(w,h,t){const p=loop(t/8),x=w*(.45+.49*p),y=h*(.66-.34*p)+Math.sin(p*6)*8;ctx.save();ctx.translate(x,y);ctx.rotate(-.22+Math.sin(t*.5)*.1);ctx.fillStyle='#fff7e9';ctx.strokeStyle='#dbd4cc';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(-16,-5);ctx.lineTo(16,0);ctx.lineTo(-6,10);ctx.lineTo(-1,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
function bats(w,h,t){for(let i=0;i<3;i++){let p=loop(t/(11+i*2)+rand(i,55)),x=w*(.58+.4*p),y=h*(.17+.18*Math.sin(t*.6+i));ctx.save();ctx.translate(x,y);ctx.scale(1.0, .6+Math.sin(t*9+i)*.22);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-11,-7,-18,6,-25,2);ctx.quadraticCurveTo(-16,5,-12,9);ctx.quadraticCurveTo(-6,2,0,4);ctx.quadraticCurveTo(6,2,12,9);ctx.quadraticCurveTo(16,5,25,2);ctx.bezierCurveTo(18,6,11,-7,0,0);ctx.fillStyle='#2f1936e5';ctx.fill();ctx.restore()}}
function eyes(w,h,t){let a=.3+.7*((Math.sin(t*.9)+1)/2)**1.4;ctx.save();ctx.globalAlpha=a;sparkle(w*.82,h*.64,8,.55,'#ffa748');sparkle(w*.9,h*.65,8,.55,'#ffa748');ctx.restore()}
function hearts(w,h,t){for(let i=0;i<4*density/2;i++){let p=loop(t/(9+i*2)+rand(i,33)),x=w*(.65+rand(i,11)*.26)+Math.sin(t*.5+i)*6,y=h*.84-p*h*.57,s=7+rand(i,3)*7;ctx.save();ctx.translate(x,y);ctx.globalAlpha=Math.sin(Math.PI*p)*.42;ctx.strokeStyle='#ffe0a7';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(0,s*.3);ctx.bezierCurveTo(-s*.8,-s*.1,-s*.6,-s*.72,0,-s*.2);ctx.bezierCurveTo(s*.6,-s*.72,s*.8,-s*.1,0,s*.3);ctx.stroke();ctx.restore()}}
function lamp(w,h,t){let v=.5+.5*Math.sin(t*.85);ctx.save();ctx.globalAlpha=.2+.27*v;let g=ctx.createRadialGradient(w*.79,h*.62,0,w*.79,h*.62,76);g.addColorStop(0,'#ffe2a3a6');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(w*.55,h*.3,w*.45,h*.6);ctx.restore()}
function lotus(x,y,s,t){ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*.6)*.05);for(let k=0;k<7;k++){let a=(k/7)*Math.PI*.92-Math.PI*.45;petal(Math.cos(a)*s*.45,-Math.sin(a)*s*.24,s*.55,a*.75,'#ffe9d9','#f59bbb',.87)}sparkle(0,0,s*.36,.2,'#fff1b4');ctx.restore()}
function lotusFloat(w,h,t){for(let i=0;i<2*density/2;i++){let p=loop(t/(14+i*5)+rand(i,42)),x=w*(.51+.4*p),y=h*(.81+i*.11)+Math.sin(t*.45+i)*2;ctx.save();ctx.globalAlpha=.38;ctx.strokeStyle='#ffdbad';ctx.beginPath();ctx.ellipse(x,y+13,17,3,0,0,TWO);ctx.stroke();ctx.restore();lotus(x,y,14+i*4,t)}}
function flame(w,h,t){for(let i=0;i<2;i++){let x=w*(.70+i*.16),y=h*(.69+i*.08);candle(x,y,20,t+i)}}
function drum(w,h,t){const x=w*.82,y=h*.35,s=34;ctx.save();ctx.translate(x,y);ctx.rotate(t*.024);ctx.globalAlpha=.22;ctx.strokeStyle='#e8c184';ctx.lineWidth=1.1;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(0,0,s*(.48+k*.28),0,TWO);ctx.stroke()}for(let k=0;k<12;k++){let a=k*TWO/12;ctx.beginPath();ctx.moveTo(Math.cos(a)*s*.6,Math.sin(a)*s*.6);ctx.lineTo(Math.cos(a)*s*1.12,Math.sin(a)*s*1.12);ctx.stroke()}star(0,0,s*.38,'#f8d58a44',t*.08);ctx.restore()}

function festivalBanners(w,h,t){
  for(let i=0;i<2;i++){
    const x=w*(.70+i*.12),y=h*(.11+i*.04),len=42+i*6;
    const swing=Math.sin(t*.48+i)*3+Math.sin(t*.9+i*.8)*1.3;
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*.35+i)*.045);
    ctx.strokeStyle='#f2d1a06a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-15);ctx.lineTo(0,8);ctx.stroke();
    const color=i?'#da7b54':'#bb3e2f'; const g=ctx.createLinearGradient(-8,0,8,0);
    g.addColorStop(0,'#873326');g.addColorStop(.5,color);g.addColorStop(1,'#f4bb71');
    ctx.fillStyle=g;ctx.globalAlpha=.66;ctx.beginPath();ctx.moveTo(-8,8);ctx.lineTo(8,8);
    ctx.quadraticCurveTo(8+swing,8+len*.55,7+swing,len);
    ctx.lineTo(swing,len-9);ctx.lineTo(-7+swing,len);
    ctx.quadraticCurveTo(-9+swing,8+len*.55,-8,8);ctx.fill();ctx.restore();
  }
}
function chalkHeart(w,h,t){
  const x=w*.78,y=h*.46,s=16;
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=.26+.13*Math.sin(t*.9);
  ctx.strokeStyle='#fff1d5';ctx.lineWidth=1.1;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,s*.42);
  ctx.bezierCurveTo(-s*.9,-s*.12,-s*.6,-s*.86,0,-s*.25);
  ctx.bezierCurveTo(s*.62,-s*.86,s*.91,-s*.12,0,s*.42);ctx.stroke();ctx.restore();
}

function draw(){let [w,h]=clear();if(!w||!h||mode==='still')return;let t=time;switch(mode){
 case 'blossoms':petals(w,h,t,['#ffea98','#f9be32'],13,2);break;
 case 'rosePetals':petals(w,h,t,['#ffd1e2','#d65e7c'],12,3);break;
 case 'petals':if(theme.id==='teachers')phoenix(w,h,t);else petals(w,h,t,['#ffd1e2','#d65e7c'],12,3);break;
 case 'lotusPetals':petals(w,h,t,['#ffe2e8','#e5a0bc'],12,4);break;
 case 'summerLeaves':leaves(w,h,t);break;
 case 'lantern':case 'lanternGlow':lanterns(w,h,t);break;
 case 'starLantern':starLantern(w*.83,h*.55,24,t);break;
 case 'moonClouds':case 'heritageClouds':case 'clouds':clouds(w,h,t,true);break;
 case 'fireworks':fireworks(w,h,t,theme.id==='nationalday');break;
 case 'confetti':confetti(w,h,t);break;
 case 'butterflies':butterflies(w,h,t);break;
 case 'banners':festivalBanners(w,h,t);break;
 case 'flag':case 'flagWave':flag(w*.84,h*.55,44,t);break;
 case 'ribbon':case 'silkRibbon':ribbon(w,h,t);break;
 case 'dragonflies':dragonflies(w,h,t);break;
 case 'balloons':balloons(w,h,t);break;
 case 'stars':for(let i=0;i<5;i++)sparkle(w*(.62+i*.07),h*(.24+(i%3)*.2),2+rand(i)*2,.20+.13*Math.sin(t*.65+i));break;
 case 'homeGlow':lamp(w,h,t);break;
 case 'heart':chalkHeart(w,h,t);break;
 case 'floatingHearts':hearts(w,h,t);break;
 case 'floatingLotus':lotusFloat(w,h,t);break;
 case 'candlelight':flame(w,h,t);break;
 case 'wave':wave(w,h,t);break;
 case 'plane':plane(w,h,t);break;
 case 'chalk':phoenix(w,h,t);break;
 case 'pumpkin':eyes(w,h,t);break;
 case 'bats':bats(w,h,t);break;
 case 'snow':case 'flakes':snow(w,h,t,mode==='flakes');break;
 case 'candles':candles(w,h,t);break;
 case 'brocade':drum(w,h,t);break;
 default:petals(w,h,t);}}

    function renderAt(t){time=t;resize();draw()}
    function step(now){
      frame=0;
      if(!running)return;
      if(last!==null)time+=Math.min(50,Math.max(0,now-last))/1000;
      last=now;
      if(lastPaint===null||now-lastPaint>=32){lastPaint=now;resize();draw()}
      frame=root.requestAnimationFrame(step);
    }
    function start(){
      if(running||mode==='still')return;
      running=true;last=null;lastPaint=null;
      renderAt(time);
      frame=root.requestAnimationFrame(step);
    }
    function stop(){
      if(!running)return;
      running=false;
      if(frame)root.cancelAnimationFrame(frame);
      frame=0;last=null;lastPaint=null;
      resize();clear(); // no frozen objects when user turns motion off
    }
    function destroy(){stop();ctx.clearRect(0,0,sizeW,sizeH)}
    return {start,stop,destroy,renderAt};
  }
  root.mybSeasonalMotionCanvas={create};
})(window);
