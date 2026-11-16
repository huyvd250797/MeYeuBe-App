/* Each scene composites authored art in one transparent canvas. Distances use design pixels. */
(function(w,doc){
  'use strict';
  const width=240,height=184,tau=Math.PI*2;
  const canvasScale=1.25;
  const assets=new Map(),states=new WeakMap(),lights=new Map();
  const art='./src/features/seasonal/art/';
  const pulse=(time,rate=1)=>Math.sin(time*rate*tau);
  const fract=x=>x-Math.floor(x);
  const ease=x=>x*x*(3-2*x);
  const fade=p=>ease(Math.min(1,p*6,(1-p)*6));

  function load(file){
    if(assets.has(file)) return assets.get(file);
    const promise=new Promise(resolve=>{
      const image=new Image();
      image.onload=()=>resolve(image);
      image.onerror=()=>{assets.delete(file);resolve(null)};
      image.src=art+file;
    });
    assets.set(file,promise);
    return promise;
  }

  function sprite(ctx,img,x,y,w,h,angle=0,alpha=1){
    if(!img||alpha<=0)return;
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.translate(x,y);
    if(angle)ctx.rotate(angle);
    ctx.drawImage(img,-w/2,-h/2,w,h);
    ctx.restore();
  }

  function glow(ctx,color,x,y,w,h,alpha){
    if(!lights.has(color)){
      const texture=doc.createElement('canvas');
      texture.width=texture.height=64;
      const brush=texture.getContext('2d');
      const gradient=brush.createRadialGradient(32,32,0,32,32,32);
      gradient.addColorStop(0,color);
      gradient.addColorStop(1,color+'00');
      brush.fillStyle=gradient;
      brush.fillRect(0,0,64,64);
      lights.set(color,texture);
    }
    ctx.save();
    ctx.globalCompositeOperation='screen';
    sprite(ctx,lights.get(color),x,y,w,h,0,alpha);
    ctx.restore();
  }

  function line(ctx,points,color,thickness,opacity=1){
    ctx.save();
    ctx.globalAlpha=opacity;
    ctx.strokeStyle=color;
    ctx.lineWidth=thickness;
    ctx.lineJoin=ctx.lineCap='round';
    ctx.beginPath();
    points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    ctx.stroke();
    ctx.restore();
  }

  function drifting(ctx,image,t,{count=8,start=57,spread=167,top=-15,travel=201,min=6,grow=3,duration=8,wind=14,depth=1}={}){
    for(let i=0;i<count;i++){
      const life=duration+(i%4)*.71;
      const p=fract(t/life+i*.618);
      const size=min+(i%4)*grow;
      const x=start+(i*47)%spread+Math.sin(p*5+i)*wind;
      sprite(ctx,image,x,top+travel*p,size,size*image.height/image.width, p*3*(i%2?1:-1),fade(p)*depth);
    }
  }

  function stars(ctx,t,points,color){
    for(const [x,y,size,i] of points){
      const opacity=.18+.7*(.5+.5*pulse(t,.21+i*.045));
      glow(ctx,color,x,y,size*4,size*4,opacity*.51);
      line(ctx,[[x-size,y],[x+size,y]],color,.7,opacity);
      line(ctx,[[x,y-size],[x,y+size]],color,.7,opacity);
    }
  }

  function ribbon(ctx,t,x=58,y=140){
    ctx.save();
    ctx.strokeStyle='#f99658';
    ctx.globalAlpha=.58;
    ctx.lineWidth=5;
    ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.bezierCurveTo(90,y-19+10*pulse(t,.22),151,y+19-11*pulse(t+.3,.22),193,y-11);
    ctx.stroke();
    ctx.restore();
  }

  function flag(ctx,img,t,moving){
    const x=82,y=27,w=127,h=75;
    if(!img){line(ctx,[[x,y],[x,y+h+21]],'#e5ae63',3);return}
    // Constant mast. Cloth deformation grows gradually toward the free edge.
    line(ctx,[[x-3,y-4],[x-3,130]],'#c18749',4);
    line(ctx,[[x-4,y-5],[x-4,130]],'#f9d994',1.4);
    const columns=moving?24:1;
    for(let i=0;i<columns;i++){
      const u=i/columns;
      const lift=moving ? Math.sin(t*2.8-u*5.5)*u*8 : 0;
      const stretch=moving ? 1+Math.sin(t*2.8-u*5.5-1)*u*.1 : 1;
      ctx.drawImage(img,img.width*u,0,img.width/columns,img.height,x+w*u,y+lift,w/columns+.45,h*stretch);
    }
  }

  function lantern(ctx,img,t,star){
    const pivotX=170,pivotY=25;
    const tilt=.13*pulse(t,.29)+.028*pulse(t,.57);
    ctx.save();
    ctx.translate(pivotX,pivotY);
    ctx.rotate(tilt);
    if(star) sprite(ctx,img,0,57,89,103);
    else{
      line(ctx,[[0,0],[0,28]],'#e9ab60',1.1);
      glow(ctx,'#ff892c',0,49,94,84,.37);
      const lanternGradient=ctx.createLinearGradient(-21,0,21,0);
      lanternGradient.addColorStop(0,'#a71529');
      lanternGradient.addColorStop(.5,'#ff6c34');
      lanternGradient.addColorStop(1,'#b41929');
      ctx.fillStyle=lanternGradient;
      ctx.beginPath();ctx.ellipse(0,48,21,18,0,0,tau);ctx.fill();
      for(const x of [-12,-6,0,6,12]){
        ctx.strokeStyle='#ffb454';ctx.lineWidth=.65;
        ctx.beginPath();ctx.moveTo(x*.65,31);ctx.quadraticCurveTo(x*1.4,49,x*.65,65);ctx.stroke();
      }
      line(ctx,[[-10,31],[10,31]],'#f9c657',3);
      line(ctx,[[-9,65],[9,65]],'#f9c657',3);
      line(ctx,[[0,65],[0,82]],'#ed9337',2.3);
    }
    ctx.restore();
  }

  function cloud(ctx,t,altitude){
    const p=fract(t/12+.18);
    const x=-25+p*280;
    for(let i=0;i<6;i++){
      glow(ctx,'#dcecf4',x+15*i,altitude-6*Math.sin(i),54+i*6,26,fade(p)*.56);
    }
  }

  function party(ctx,img,t,confetti){
    for(let i=0;i<3;i++){
      const x=125+i*24,y=41;
      const flicker=.5+.5*pulse(t,.69+i*.12);
      glow(ctx,'#ffbd62',x,y-1,32,29,.23+flicker*.23);
      sprite(ctx,img,x+(flicker-.5)*1.7,y-2,7+flicker*2,16+flicker*3,(flicker-.5)*.26,.9);
    }
    if(!confetti)return;
    const colors=['#ffd262','#fe8bbd','#b8e8f7','#daa7ff'];
    for(let i=0;i<12;i++){
      const p=fract(t/(4.3+i%3*.44)+i*.618);
      const x=155+(i%2?1:-1)*p*(30+(i*19)%80);
      const y=68-p*184+p*p*230+i%4*4;
      ctx.save();
      ctx.translate(x,y);ctx.rotate(i+p*7);
      ctx.globalAlpha=fade(p)*.95;
      ctx.fillStyle=colors[i%4];
      ctx.fillRect(-2,-1.5,4+i%2,2.5);
      ctx.restore();
    }
  }

  // New festival motion layers are separate from static artwork. No whole-scene
  // deformation: the temple, mausoleum, moon and people stay geometrically stable.
  function firework(ctx,t,x,y,color,phase=0){
    const progress=fract(t/3.7+phase),radius=8+progress*48;
    for(let i=0;i<12;i++){
      const angle=i*tau/12,inner=radius*.45,outer=radius;
      line(ctx,[[x+Math.cos(angle)*inner,y+Math.sin(angle)*inner],
        [x+Math.cos(angle)*outer,y+Math.sin(angle)*outer]],color,1.4,fade(progress)*.84);
    }
    glow(ctx,color,x,y,radius*3,radius*3,fade(progress)*.38);
  }
  function floatingPiece(ctx,img,t,count=7,upward=false){
    if(!img)return;
    for(let i=0;i<count;i++){
      const p=fract(t/(6.5+i%3*.76)+i*.271),size=11+i%3*4;
      const x=45+(i*43)%178+Math.sin(p*6+i)*8;
      const y=upward?184-p*208:-21+p*216;
      sprite(ctx,img,x,y,size,size*1.03,p*(i%2?3:-3),fade(p)*.8);
    }
  }
  function pulsingLight(ctx,t,spots,color){
    spots.forEach(([x,y,r],i)=>{
      const alpha=.2+.42*(.5+.5*pulse(t+i*.31,.39+i*.029));
      glow(ctx,color,x,y,r*3,r*3,alpha);
    });
  }
  function driftingLantern(ctx,img,t){
    for(let i=0;i<3;i++){
      const p=fract(t/(12+i*2.5)+i*.32),x=82+i*46+9*pulse(t+i*.32,.12),y=174-p*157;
      sprite(ctx,img,x,y,32-i*4,40-i*5,.04*pulse(t+i*.6,.2),fade(p)*.72);
      glow(ctx,'#ffbc72',x,y,41,44,fade(p)*.3);
    }
  }
  function dragonfly(ctx,t,x,y,scale=1){
    ctx.save();ctx.translate(x,y);ctx.rotate(.12*pulse(t,.37));ctx.scale(scale,scale);
    ctx.fillStyle='#c7f5e8';ctx.globalAlpha=.56+.15*pulse(t,.91);
    for(const sign of [-1,1]){
      ctx.beginPath();ctx.ellipse(sign*12,-6,14,4,sign*.4,0,tau);ctx.fill();
      ctx.beginPath();ctx.ellipse(sign*11,4,11,3,-sign*.35,0,tau);ctx.fill();
    }
    line(ctx,[[0,-9],[0,20]],'#e1bc80',2,.93);
    ctx.restore();
  }
  function butterflyMotion(ctx,img,t){
    for(let i=0;i<2;i++){
      const p=fract(t/(8+i*1.8)+i*.31),x=62+p*155,y=104-41*Math.sin(Math.PI*p)+12*pulse(t,.32+i*.1);
      const wing=.63+.37*Math.abs(pulse(t,.83));
      sprite(ctx,img,x-6,y,25*wing,27,-.7,fade(p));
      sprite(ctx,img,x+6,y,25*wing,27,.7,fade(p));
      line(ctx,[[x,y-9],[x,y+9]],'#80597a',2,fade(p));
    }
  }
  function draw(ctx,id,mode,base,piece,time){
    const moving=mode!=='still',t=moving?time:0;
    ctx.clearRect(0,0,width,height);
    switch(id){
      case 'nationalday':
        sprite(ctx,base,147,112,196,145);
        flag(ctx,piece,t,mode==='flagWave' && moving);
        if(moving && mode==='fireworks'){
          firework(ctx,t,152,40,'#ffd68a',.04);
          firework(ctx,t,208,79,'#ffe7ad',.49);
        }
        break;
      case 'womenvn':
        sprite(ctx,base,148,100,176,142);
        if(moving&&mode==='rosePetals')floatingPiece(ctx,piece,t,9);
        if(moving&&mode==='silkRibbon'){
          ribbon(ctx,t,74,130);
          pulsingLight(ctx,t,[[197,77,16],[149,108,13]],'#ffd6ed');
        }
        break;
      case 'family':
        sprite(ctx,base,143,105,179,138);
        if(moving&&mode==='floatingHearts')floatingPiece(ctx,piece,t,6,true);
        if(moving&&mode==='homeGlow')pulsingLight(ctx,t,[[143,96,26],[190,121,17],[101,142,14]],'#ffca9e');
        break;
      case 'vulan':
        sprite(ctx,base,143,100,190,140);
        if(moving&&mode==='floatingLotus'){
          for(let i=0;i<3;i++){
            const p=fract(t/(13+i*2)+i*.31);
            const x=67+p*146,y=146+i*9+Math.sin(t*.8+i)*2;
            sprite(ctx,piece,x,y,27+i*3,20+i*2,0,.46+.24*Math.sin(p*Math.PI));
          }
        }
        if(moving&&mode==='candlelight')pulsingLight(ctx,t,[[97,145,18],[155,163,20],[214,147,14]],'#ffca86');
        break;
      case 'hungking':
        sprite(ctx,base,140,106,198,143);
        if(moving&&mode==='heritageClouds'){
          const p=fract(t/19+.24);
          sprite(ctx,piece,32+p*200,51,94,35,0,fade(p)*.5);
        }
        if(moving&&mode==='banners'){
          for(let i=0;i<6;i++){
            const x=78+i*43,y=116+i%2*9;
            line(ctx,[[x,y-23],[x,y+42]],'#e8c386',1.5,.72);
            ctx.save();ctx.translate(x,y-23);ctx.rotate(.09*pulse(t+i*.18,.36));
            ctx.fillStyle=i%2?'#edba5d':'#cf4e62';
            ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(16,7);ctx.lineTo(0,14);ctx.closePath();ctx.fill();ctx.restore();
          }
        }
        break;
      case 'culture':
        sprite(ctx,base,143,101,182,146);
        if(moving&&mode==='lotusPetals')floatingPiece(ctx,piece,t,8);
        if(moving&&mode==='brocade'){
          ctx.save();ctx.translate(204,58);ctx.rotate(t*.025);
          ctx.strokeStyle='#e4c582';ctx.lineWidth=1.1;ctx.globalAlpha=.4;
          for(const r of [19,31,43]){ctx.beginPath();ctx.arc(0,0,r,0,tau);ctx.stroke()}
          for(let i=0;i<12;i++){const a=i*tau/12;line(ctx,[[Math.cos(a)*15,Math.sin(a)*15],[Math.cos(a)*44,Math.sin(a)*44]],'#f0d09c',1,.32)}
          ctx.restore();
        }
        break;
      case 'womensday':
        sprite(ctx,base,144,100,174,142);
        if(moving&&mode==='butterflies')butterflyMotion(ctx,piece,t);
        if(moving&&mode==='petals')floatingPiece(ctx,piece,t,9);
        break;
      case 'doanngo':
        sprite(ctx,base,143,104,185,139);
        if(moving&&mode==='dragonflies'){
          dragonfly(ctx,t,135+29*pulse(t,.13),68+11*pulse(t,.28),.82);
          dragonfly(ctx,t+.7,205-21*pulse(t,.11),99+8*pulse(t,.21),.57);
        }
        if(moving&&mode==='summerLeaves')floatingPiece(ctx,piece,t,7);
        break;
      case 'nguyentieu':
        sprite(ctx,base,144,102,185,146);
        if(moving&&mode==='lanternGlow'){
          driftingLantern(ctx,piece,t);
          pulsingLight(ctx,t,[[140,77,18],[204,119,22]],'#ffbe83');
        }
        if(moving&&mode==='moonClouds'){
          const p=fract(t/17+.25);
          sprite(ctx,piece,79+p*128,64,22,32,0,.12*fade(p));
          cloud(ctx,t,75);
        }
        break;
      case 'newyear':
        sprite(ctx,base,146,105,196,139);
        if(moving&&mode==='fireworks'){
          firework(ctx,t,123,58,'#ffd991',.05);
          firework(ctx,t,196,44,'#d2b8ff',.46);
          firework(ctx,t,218,95,'#ffcd95',.71);
        }
        if(moving&&mode==='confetti'){
          floatingPiece(ctx,piece,t,10);
          party(ctx,piece,t,true);
        }
        break;
      case 'tet':
        sprite(ctx,base,139,84,162,145,-.019*pulse(t,.21));
        if(!piece||!moving)break;
        if(mode==='lantern') lantern(ctx,piece,t,false);
        else drifting(ctx,piece,t,{count:9,start:59,spread:147,duration:6.6,min:8,grow:2,wind:18,top:-11});
        break;
      case 'beach':{
        sprite(ctx,base,135,104,196,154);
        if(!piece||!moving)break;
        const surf=.5+.5*pulse(t,.21);
        sprite(ctx,piece,128+12*surf,127+8*surf,156+8*surf,33+9*surf,-.17,.24+.43*surf);
        if(mode==='clouds') cloud(ctx,t,47);
        break;
      }
      case 'reunification':
        if(mode==='ribbon')ribbon(ctx,t);
        flag(ctx,piece,t,moving);
        sprite(ctx,base,140,134,184,81);
        break;
      case 'children':
        sprite(ctx,base,135,138,166,82);
        sprite(ctx,piece,146+5*pulse(t,.22),83+(mode==='balloons'?13:3)*pulse(t,.16),111,112,.075*pulse(t,.21));
        if(mode==='stars') stars(ctx,t,[[76,64,3,0],[202,52,4,1],[217,94,4,2],[81,107,2,3]],'#ffe49c');
        break;
      case 'birthday':
        sprite(ctx,base,153,106,166,131);
        if(moving)party(ctx,piece,t,mode==='confetti');
        else for(const x of [125,149,173])sprite(ctx,piece,x,39,8,16);
        break;
      case 'midautumn':
        sprite(ctx,base,113,85,126,119);
        if(mode==='clouds')cloud(ctx,t,91);
        lantern(ctx,piece,t,true);
        break;
      case 'school':{
        sprite(ctx,base,139,128,165,99);
        if(!moving){sprite(ctx,piece,159,57,63,44,-.22);break}
        const p=fract(t/(mode==='plane'?7.4:9.1)+.35);
        const x=28+188*p,y=96-64*p-22*Math.sin(Math.PI*p);
        if(mode==='chalk'){
          for(let i=1;i<13;i++){
            const q=p-i*.032;
            if(q<0)break;
            const xx=28+188*q,yy=96-64*q-22*Math.sin(Math.PI*q);
            line(ctx,[[xx,yy],[xx+3.5,yy-1.2]],'#f8e9c3',1.2,fade(p)*(1-i/14));
          }
        }
        sprite(ctx,piece,x,y,62,43,-.23+.15*pulse(t,.19),fade(p));
        break;
      }
      case 'halloween':{
        sprite(ctx,base,143,99,153,139);
        if(moving){
          const alpha=.36+.40*(.5+.5*pulse(t,.31));
          [[130,112,15,14],[167,112,15,14],[149,134,34,13]].forEach(([x,y,w,h])=>glow(ctx,'#ffae33',x,y,w,h,alpha));
        }
        if(mode==='bats'){
          for(let i=0;i<2;i++){
            const p=fract(t/(6.1+i*1.2)+.31+i*.44);
            const wing=.71+.29*pulse(t+i,.96);
            sprite(ctx,piece,34+p*182,78-47*p+12*Math.sin(p*7),46-i*9,(22-i*4)*wing,-.13,fade(p));
          }
        }else sprite(ctx,piece,199,54,38,18,.09);
        break;
      }
      case 'teachers':{
        sprite(ctx,base,146,101,138,145,-.018*pulse(t,.19));
        if(mode==='petals'&&piece)drifting(ctx,piece,t,{count:8,start:49,spread:156,duration:7.8,min:7,grow:3,wind:19});
        if(mode==='heart'){
          const p=fract(t/6+.25),points=[];
          for(let i=0;i<=40*ease(Math.min(1,p*2));i++){
            const a=i/40*tau;
            points.push([75+1.4*16*Math.sin(a)**3,76-1.4*(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))]);
          }
          line(ctx,points,'#ffd0cc',1.7,fade(p)*.84);
        }
        break;
      }
      case 'christmas':
        sprite(ctx,base,142,103,150,145);
        if(mode==='snow'&&piece)drifting(ctx,piece,t,{count:12,start:45,spread:168,duration:8.6,min:4,grow:2,wind:14,depth:.9});
        if(mode==='flakes'){
          [[82,44,13],[197,37,11],[209,89,9],[75,117,8],[192,145,12]].forEach(([x,y,n],i)=>{
            const p=.5+.5*pulse(t+i*.56,.17+i*.025);
            glow(ctx,'#bce7ff',x,y,n*3.0,n*3.0,p*.38);
            sprite(ctx,piece,x,y,n+2*p,n+2*p,i*.4+t*.08,.29+p*.71);
          });
        }
        break;
    }
  }

  // V17.22.7: the photographic themes now render motion on a dedicated high-DPI overlay canvas.
  // This removes generic CSS particles and replaces them with per-theme sprite motion, glows and masked highlights.
  const photoThemes=new Set(['tet','beach','reunification','children','birthday','midautumn','school','halloween','teachers','christmas','nationalday','womenvn','family','vulan','hungking','culture','womensday','doanngo','nguyentieu','newyear']);

  function photoCanvasFit(state){
    if(!state.canvas||!state.element||state.disposed)return;
    const rect=state.element.getBoundingClientRect();
    const cssW=Math.max(1,Math.round(rect.width||240));
    const cssH=Math.max(1,Math.round(rect.height||184));
    const dpr=Math.max(1,Math.min(2,w.devicePixelRatio||1));
    const pixelW=Math.round(cssW*dpr),pixelH=Math.round(cssH*dpr);
    if(state.canvas.width!==pixelW||state.canvas.height!==pixelH){
      state.canvas.width=pixelW;state.canvas.height=pixelH;
      state.canvas.style.width=cssW+'px';state.canvas.style.height=cssH+'px';
      state.scaleX=pixelW/width;state.scaleY=pixelH/height;
      if(state.ctx)state.ctx.setTransform(state.scaleX,0,0,state.scaleY,0,0);
      paint(state);
    }
  }

  function shapePetal(ctx,x,y,w,h,angle,fill,stroke,alpha=.9){
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);
    ctx.fillStyle=fill;ctx.beginPath();
    ctx.moveTo(0,-h*.56);
    ctx.bezierCurveTo(w*.52,-h*.26,w*.42,h*.36,0,h*.56);
    ctx.bezierCurveTo(-w*.42,h*.36,-w*.52,-h*.26,0,-h*.56);
    ctx.closePath();ctx.fill();
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.7;ctx.stroke()}
    ctx.restore();
  }
  function shapeLeaf(ctx,x,y,w,h,angle,alpha=.82){
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);
    const g=ctx.createLinearGradient(0,-h*.5,0,h*.5);g.addColorStop(0,'#e4ffb0');g.addColorStop(.55,'#7cb44c');g.addColorStop(1,'#2f6d30');
    ctx.fillStyle=g;ctx.beginPath();
    ctx.moveTo(0,-h*.55);
    ctx.quadraticCurveTo(w*.56,-h*.18,w*.18,h*.55);
    ctx.quadraticCurveTo(0,h*.40,-w*.18,h*.55);
    ctx.quadraticCurveTo(-w*.56,-h*.18,0,-h*.55);
    ctx.fill();
    line(ctx,[[0,-h*.45],[0,h*.40]],'#f4ffd2',.65,.58);
    ctx.restore();
  }
  function shapeHeart(ctx,x,y,size,alpha=.55){
    const pts=[];
    for(let i=0;i<=32;i++){
      const a=i/32*tau;
      pts.push([x+size*.95*16*Math.sin(a)**3/18,y-size*(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))/18]);
    }
    line(ctx,pts,'#ffe6d0',1.35,alpha);
    glow(ctx,'#ffd1b0',x,y,size*3,size*3,alpha*.26);
  }
  function twinkles(ctx,t,points,color='#ffe3a8'){
    points.forEach(([x,y,size,phase])=>{
      const p=.45+.55*(.5+.5*pulse(t+.2+phase,.32+phase*.05));
      glow(ctx,color,x,y,size*4.4,size*4.4,p*.22);
      line(ctx,[[x-size,y],[x+size,y]],color,.95,p*.82);
      line(ctx,[[x,y-size],[x,y+size]],color,.95,p*.82);
    });
  }
  function streakGlow(ctx,t,x1,y1,x2,y2,widthGlow,color,alpha=.2){
    const travel=.5+.5*pulse(t,.15);
    const x=x1+(x2-x1)*travel,y=y1+(y2-y1)*travel;
    glow(ctx,color,x,y,widthGlow*2.4,widthGlow*1.4,alpha);
  }
  function cloudBand(ctx,t,anchors,color='#edf5ff'){
    anchors.forEach(([x,y,wc,hc,phase])=>{
      const drift=(.5+.5*pulse(t*.55+phase,.12))*12;
      for(let i=0;i<4;i++)glow(ctx,color,x+drift+i*wc*.18,y+Math.sin(i+phase)*1.5,wc*(.48+i*.08),hc*(.8+i*.05),.09+.03*i);
    });
  }
  function fallingSprite(ctx,img,t,opts={}){
    if(!img)return;
    const count=opts.count||8,x0=opts.start||128,range=opts.range||96,top=opts.top||-16,travel=opts.travel||210,size=opts.size||12,grow=opts.grow||4,duration=opts.duration||8,wind=opts.wind||18,spin=opts.spin||2.8;
    for(let i=0;i<count;i++){
      const p=fract(t/(duration+i%3*.7)+i*.173);
      const x=x0+(i*37)%range+Math.sin(p*6+i*1.7)*wind;
      const y=top+travel*p;
      const s=size+(i%3)*grow;
      sprite(ctx,img,x,y,s,s*img.height/img.width,p*spin*(i%2?1:-1),fade(p)*.95);
    }
  }
  function driftLanterns(ctx,img,t,anchors){
    if(!img)return;
    anchors.forEach(([x,y,amp,phase,sz])=>{
      const tilt=.12*pulse(t+phase,.24)+.04*pulse(t+phase,.51);
      const dy=amp*pulse(t+phase,.18);
      sprite(ctx,img,x,y+dy,sz,sz*img.height/img.width,tilt,.95);
      glow(ctx,'#ffbf6d',x,y+dy+8,sz*1.6,sz*1.8,.18+.12*(.5+.5*pulse(t+phase,.47)));
    });
  }
  function sparkleRain(ctx,t,anchors,color){
    anchors.forEach(([x,y,w,h,phase])=>{
      for(let i=0;i<5;i++){
        const p=fract(t/(5.2+i*.35)+phase+i*.1);
        const xx=x+w*p,yy=y+h*(.35+.18*Math.sin(p*6.28+i));
        glow(ctx,color,xx,yy,8,8,.12+.08*Math.sin((t+phase+i)*1.4)**2);
      }
    });
  }
  function batFlight(ctx,img,t,startY=72){
    if(!img)return;
    for(let i=0;i<3;i++){
      const p=fract(t/(6.2+i*.8)+i*.28);
      const wing=.78+.22*pulse(t+i,.92);
      sprite(ctx,img,112+p*110,startY-36*p+8*Math.sin(p*6+i),26-i*3,(12-i*1.5)*wing,-.08+.08*Math.sin(p*6+i),fade(p));
    }
  }
  function balloonFloat(ctx,img,t,x,y,wBalloon){
    if(!img)return;
    const bob=4*pulse(t,.18),tilt=.06*pulse(t,.21)+.03*pulse(t,.43);
    sprite(ctx,img,x,y+bob,wBalloon,wBalloon*img.height/img.width,tilt,.98);
  }
  function candleFlames(ctx,t,anchors){
    anchors.forEach(([x,y])=>{
      const f=.5+.5*pulse(t+(x+y)*.01,.85);
      glow(ctx,'#ffbf73',x,y-6,18,20,.18+.12*f);
      ctx.save();ctx.globalAlpha=.72+.18*f;ctx.fillStyle='#ffe79c';ctx.beginPath();ctx.moveTo(x,y-14);ctx.quadraticCurveTo(x+4,y-7,x,y-2);ctx.quadraticCurveTo(x-4,y-7,x,y-14);ctx.fill();ctx.restore();
    });
  }
  function drawPaperPlaneTrail(ctx,t,img){
    const p=fract(t/7.5+.23),x=118+88*p,y=104-44*p-18*Math.sin(Math.PI*p);
    for(let i=1;i<12;i++){
      const q=p-i*.028;if(q<0)break;
      const xx=118+88*q,yy=104-44*q-18*Math.sin(Math.PI*q);
      line(ctx,[[xx,yy],[xx+3,yy-1]],'#fff4c8',1,.25*(1-i/12));
    }
    if(img)sprite(ctx,img,x,y,48,48*img.height/img.width,-.22+.12*pulse(t,.23),fade(p));
  }
  function drawTeacherSunbeam(ctx,t){
    const beam=.18+.10*(.5+.5*pulse(t,.12));
    ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=beam;
    const g=ctx.createLinearGradient(170,20,220,125);g.addColorStop(0,'#fff1c4');g.addColorStop(1,'rgba(255,241,196,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(170,20);ctx.lineTo(240,56);ctx.lineTo(240,125);ctx.lineTo(196,101);ctx.closePath();ctx.fill();ctx.restore();
  }
  function waterLotus(ctx,img,t,points){
    points.forEach(([x,y,wLotus,phase])=>{
      const drift=2.5*pulse(t+phase,.16),lift=.8*pulse(t+phase,.28);
      if(img)sprite(ctx,img,x+drift,y+lift,wLotus,wLotus*img.height/img.width,0,.88);
      glow(ctx,'#ffcf89',x+drift,y+lift+4,wLotus*1.3,wLotus*.9,.14+.10*(.5+.5*pulse(t+phase,.46)));
      line(ctx,[[x-wLotus*.55,y+9],[x+wLotus*.55,y+9]],'#ffddb255',1.4,.28);
    });
  }
  function snowDriftDetailed(ctx,img,t){
    for(let i=0;i<16;i++){
      const p=fract(t/(8.8+i%4*.46)+i*.17);
      const x=122+(i*11)%108+Math.sin(p*7+i)*7;
      const y=-14+210*p;
      const s=5+(i%4)*2.2;
      if(img && i%3===0) sprite(ctx,img,x,y,s,s, p*1.8,.25+.45*fade(p));
      else {
        ctx.save();ctx.globalAlpha=.32+.36*fade(p);ctx.fillStyle='#f2fbff';ctx.beginPath();ctx.arc(x,y,s*.26,0,tau);ctx.fill();ctx.restore();
      }
    }
  }
  function fireworksGolden(ctx,t,bursts){
    bursts.forEach(([x,y,color,phase,scale])=>{
      const progress=fract(t/3.9+phase),radius=8+progress*(28*scale);
      for(let i=0;i<14;i++){
        const a=i*tau/14;
        line(ctx,[[x+Math.cos(a)*radius*.35,y+Math.sin(a)*radius*.35],[x+Math.cos(a)*radius,y+Math.sin(a)*radius]],color,1.1,fade(progress)*.78);
      }
      glow(ctx,color,x,y,radius*2.6,radius*2.6,fade(progress)*.24);
    });
  }
  function photoPaint(state){
    const ctx=state.ctx;if(!ctx)return;
    const sx=state.scaleX||1,sy=state.scaleY||1;
    ctx.setTransform(sx,0,0,sy,0,0);ctx.clearRect(0,0,width,height);
    if(state.mode==='still')return;
    const t=state.time||0; const id=state.id, mode=state.mode, piece=state.piece;
    switch(id){
      case 'tet':
        if(mode==='blossoms')fallingSprite(ctx,piece,t,{count:10,start:124,range:96,travel:214,size:14,grow:4,duration:8.6,wind:14,spin:3.2});
        else driftLanterns(ctx,piece,t,[[174,36,5,.1,34],[210,50,7,.4,28]]);
        twinkles(ctx,t,[[150,54,3,.1],[214,82,2,.6],[189,130,2,.2]],'#ffd978');
        break;
      case 'newyear':
        if(mode==='fireworks')fireworksGolden(ctx,t,[[150,36,'#ffd98f',.05,1],[203,48,'#c8b8ff',.32,.86],[216,90,'#ffc786',.58,.78]]);
        else {
          for(let i=0;i<12;i++){
            const p=fract(t/(5.3+i*.19)+i*.07),x=132+(i*9)%96+Math.sin(i+p*9)*4,y=32+p*122,s=4+(i%3);
            ctx.save();ctx.translate(x,y);ctx.rotate(p*8+i);ctx.globalAlpha=.18+.54*fade(p);ctx.fillStyle=i%2?'#ffd68d':'#f6c3ff';ctx.fillRect(-s*.45,-s*.18,s*.9,s*.36);ctx.restore();
          }
        }
        break;
      case 'nguyentieu':
        if(mode==='lanternGlow')driftLanterns(ctx,piece,t,[[148,56,4,.1,28],[191,46,5,.43,24],[216,78,6,.72,20]]);
        else cloudBand(ctx,t,[[118,56,20,8,.1],[158,48,24,10,.42],[198,53,18,8,.71]],'#eff5ff');
        break;
      case 'womensday':
        if(mode==='butterflies'){
          for(let i=0;i<2;i++){
            const p=fract(t/(7.6+i*1.2)+i*.25),x=138+p*72,y=90-26*Math.sin(Math.PI*p)+10*pulse(t,.29+i*.07),wing=.72+.28*Math.abs(pulse(t+i,.95));
            shapePetal(ctx,x-5,y,8*wing,12*wing,-.7,'#ffe9c8','#f7c5cf',fade(p));
            shapePetal(ctx,x+5,y,8*wing,12*wing,.7,'#ffe9c8','#f7c5cf',fade(p));
            line(ctx,[[x,y-7],[x,y+7]],'#87697c',1.2,fade(p));
          }
        } else fallingSprite(ctx,piece,t,{count:9,start:120,range:100,size:10,grow:3,duration:7.8,wind:17,spin:3.4});
        break;
      case 'hungking':
        if(mode==='heritageClouds')cloudBand(ctx,t,[[124,62,20,8,.14],[170,51,24,10,.48],[210,58,18,7,.76]],'#dfe7ee');
        else if(piece){
          for(let i=0;i<3;i++){
            const sway=.08*pulse(t+i*.4,.21);
            sprite(ctx,piece,156+i*24,118+i*4,24,24*piece.height/piece.width,sway,.45+.18*(i%2));
          }
        }
        break;
      case 'reunification':
        if(mode==='flag') sprite(ctx,piece,188,88,62,62*piece.height/piece.width,.04*pulse(t,.24),.95);
        else twinkles(ctx,t,[[170,44,3,.1],[198,62,4,.42],[218,82,3,.73],[207,124,3,.29]],'#ffd67c');
        break;
      case 'doanngo':
        if(mode==='dragonflies'){
          const a=.5+.5*pulse(t,.18),b=.5+.5*pulse(t+.9,.15);
          dragonfly(ctx,t,157+18*a,66+9*pulse(t,.32),.72);
          dragonfly(ctx,t+.8,210-16*b,92+7*pulse(t,.27),.55);
        } else {
          for(let i=0;i<6;i++){
            const p=fract(t/(9.1+i*.28)+i*.13);
            shapeLeaf(ctx,128+(i*18)%92+Math.sin(i+p*7)*8,-10+194*p,12+(i%2)*3,18+(i%3)*2,.25+Math.sin(i+p*6)*.35,fade(p)*.95);
          }
        }
        break;
      case 'children':
        if(mode==='balloons')balloonFloat(ctx,piece,t,188,76,62);
        else twinkles(ctx,t,[[145,56,3,.1],[196,45,4,.41],[220,86,3,.69],[172,112,2,.22]],'#ffe89f');
        break;
      case 'family':
        if(mode==='floatingHearts'){
          for(let i=0;i<4;i++){
            const p=fract(t/(7.6+i*.7)+i*.18),x=150+(i*18)%66+Math.sin(i+p*6)*5,y=140-80*p;
            shapeHeart(ctx,x,y,7+i%2,fade(p)*.45);
          }
        } else {
          glow(ctx,'#ffd1a2',179,86,36,34,.12+.08*(.5+.5*pulse(t,.22)));
          glow(ctx,'#ffd1a2',206,116,30,30,.10+.07*(.5+.5*pulse(t+.5,.31)));
          streakGlow(ctx,t,154,96,220,116,26,'#ffe0b6',.11);
        }
        break;
      case 'vulan':
        if(mode==='floatingLotus')waterLotus(ctx,piece,t,[[139,146,26,.1],[184,152,22,.42],[220,140,30,.75]]);
        else twinkles(ctx,t,[[141,144,3,.1],[183,150,3,.42],[219,138,4,.75]],'#ffc77c');
        break;
      case 'beach':
        if(mode==='wave')sparkleRain(ctx,t,[[136,118,88,22,.15],[148,138,72,18,.55]],'#fff0b5');
        else {
          for(let i=0;i<4;i++){
            const sway=.18*pulse(t+i*.4,.18);
            shapeLeaf(ctx,160+i*18,32+i*3,18,28,sway,.45);
          }
          cloudBand(ctx,t,[[136,52,22,10,.2],[186,44,28,12,.6]],'#f6fbff');
        }
        break;
      case 'nationalday':
        if(mode==='flagWave')sprite(ctx,piece,182,78,54,54*piece.height/piece.width,.05*pulse(t,.24),.94);
        else fireworksGolden(ctx,t,[[154,44,'#ffd889',.08,.9],[200,58,'#ffdd98',.41,.75]]);
        break;
      case 'midautumn':
        if(mode==='starLantern')driftLanterns(ctx,piece,t,[[190,58,6,.18,34]]);
        else cloudBand(ctx,t,[[130,58,24,10,.18],[170,47,20,8,.44],[214,55,18,8,.72]],'#f2e9ff');
        twinkles(ctx,t,[[182,42,3,.1],[208,82,2,.44]],'#ffd59b');
        break;
      case 'school':
        if(mode==='plane')drawPaperPlaneTrail(ctx,t,piece);
        else {
          const p=fract(t/5.2+.3),x=152+66*p,y=86-20*p;
          line(ctx,[[x,y],[x+22,y-8],[x+34,y-22]],'#fff7d6',1.2,fade(p)*.8);
        }
        break;
      case 'womenvn':
        if(mode==='rosePetals')fallingSprite(ctx,piece,t,{count:8,start:132,range:92,size:10,grow:3,duration:8.2,wind:14,spin:2.6});
        else {
          streakGlow(ctx,t,150,92,220,78,28,'#ffd8ea',.15);
          twinkles(ctx,t,[[174,70,3,.16],[210,104,2,.48]],'#ffe8f2');
        }
        break;
      case 'halloween':
        if(mode==='pumpkin'){
          glow(ctx,'#ffaf4b',183,98,28,24,.18+.12*(.5+.5*pulse(t,.34)));
          glow(ctx,'#ffaf4b',209,96,18,16,.14+.1*(.5+.5*pulse(t+.6,.41)));
        } else batFlight(ctx,piece,t,74);
        break;
      case 'teachers':
        if(mode==='petals')fallingSprite(ctx,piece,t,{count:8,start:126,range:96,size:9,grow:3,duration:8.1,wind:16,spin:3});
        else {drawTeacherSunbeam(ctx,t); shapeHeart(ctx,192,72,10,.45+.15*(.5+.5*pulse(t,.4)));}
        break;
      case 'culture':
        if(mode==='lotusPetals')fallingSprite(ctx,piece,t,{count:7,start:130,range:94,size:10,grow:3,duration:8.9,wind:15,spin:2.4});
        else {
          for(const r of [18,28,38]){ctx.save();ctx.translate(214,46);ctx.rotate(t*.08);ctx.strokeStyle='#e2c17d55';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,r,0,tau);ctx.stroke();ctx.restore();}
          twinkles(ctx,t,[[202,42,2,.1],[224,52,2,.5]],'#f5d69d');
        }
        break;
      case 'christmas':
        if(mode==='snow')snowDriftDetailed(ctx,piece,t);
        else {
          twinkles(ctx,t,[[143,39,4,.12],[181,65,3,.41],[209,92,2,.76],[162,128,2,.28]],'#d8f0ff');
          streakGlow(ctx,t,154,58,212,80,24,'#bde6ff',.12);
        }
        break;
      case 'birthday':
        if(mode==='confetti'){
          for(let i=0;i<12;i++){
            const p=fract(t/(4.8+i*.22)+i*.11),x=136+(i*8)%92+Math.sin(i+p*9)*5,y=26+p*112,s=5+(i%2);
            ctx.save();ctx.translate(x,y);ctx.rotate(i+p*7);ctx.globalAlpha=.2+.6*fade(p);ctx.fillStyle=['#ffd26f','#ff9fcf','#c8efff','#d9b8ff'][i%4];ctx.fillRect(-s*.45,-s*.18,s*.9,s*.36);ctx.restore();
          }
        } else candleFlames(ctx,t,[[174,66],[192,61],[209,67]]);
        break;
    }
  }

  function createPhotoScene(id,mode){
    const element=doc.createElement('div');
    element.className='seasonScene seasonSceneReference';
    element.dataset.art=id;
    element.dataset.motion=mode;
    element.setAttribute('aria-hidden','true');
    const picture=doc.createElement('img');
    picture.className='seasonReferenceArt';
    picture.src=art+id+'-photo-hero-v3.webp';
    picture.alt='';
    picture.decoding='async';
    picture.draggable=false;
    element.append(picture);
    const canvas=doc.createElement('canvas');
    canvas.className='seasonReferenceOverlay';
    canvas.setAttribute('aria-hidden','true');
    canvas.style.position='absolute';canvas.style.inset='0';canvas.style.width='100%';canvas.style.height='100%';canvas.style.pointerEvents='none';
    element.append(canvas);
    const ctx=canvas.getContext('2d');
    const state={element,canvas,ctx,id,mode,time:0,last:null,lastPaint:null,frame:0,requested:false,ready:true,disposed:false,overlay:true,reference:true,scaleX:1,scaleY:1,observer:null,piece:null};
    if(ctx)ctx.imageSmoothingEnabled=true;
    states.set(element,state);
    const resize=()=>photoCanvasFit(state);
    if(typeof ResizeObserver!=='undefined'){
      state.observer=new ResizeObserver(resize);state.observer.observe(element);
    }else w.setTimeout(resize,0);
    load(id+'-piece-v2.webp').then(img=>{ if(state.disposed)return; state.piece=img; paint(state); if(state.requested)schedule(state); });
    picture.addEventListener('load',resize,{once:true});
    w.setTimeout(resize,0);
    return element;
  }

  function create(id,mode){
    if(photoThemes.has(id))return createPhotoScene(id,mode);
    const element=doc.createElement('div');
    element.className='seasonScene';
    element.dataset.art=id;
    element.dataset.motion=mode;
    element.setAttribute('aria-hidden','true');
    const canvas=doc.createElement('canvas');
    canvas.className='seasonArt';
    canvas.width=width*canvasScale;
    canvas.height=height*canvasScale;
    element.append(canvas);
    const ctx=canvas.getContext('2d');
    if(!ctx){
      const image=doc.createElement('img');
      image.className='seasonArt';
      image.src=art+id+'-base-v2.webp';
      image.alt='';
      canvas.replaceWith(image);
      return element;
    }
    ctx.scale(canvasScale,canvasScale);
    const state={ctx,id,mode,time:0,last:null,lastPaint:null,frame:0,requested:false,ready:false,disposed:false};
    states.set(element,state);
    Promise.all([load(id+'-base-v2.webp'),load(id+'-piece-v2.webp')]).then(([base,piece])=>{
      if(state.disposed)return;
      Object.assign(state,{base,piece,ready:true});
      paint(state);
      schedule(state);
    });
    return element;
  }

  function paint(state){
    if(state.overlay)return photoPaint(state);
    draw(state.ctx,state.id,state.mode,state.base,state.piece,state.time);
  }

  function schedule(state){
    if(!state.ready||!state.requested||state.mode==='still'||state.frame||state.disposed)return;
    state.frame=w.requestAnimationFrame(now=>{
      state.frame=0;
      if(!state.requested||state.disposed)return;
      if(state.last!==null)state.time+=Math.min(44,now-state.last)/1000;
      state.last=now;
      // 30fps painting cap: native rAF stays smooth, but reduces canvas work on mobile.
      if(state.lastPaint===null || now-state.lastPaint>=32){
        state.lastPaint=now;
        paint(state);
      }
      schedule(state);
    });
  }

  function setRunning(element,on){
    const state=states.get(element);
    if(!state||state.requested===on)return;
    state.requested=on;
    element.classList.toggle('scene-active',on && state.mode!=='still');
    if(on)schedule(state);
    else{
      w.cancelAnimationFrame(state.frame);
      state.frame=0;
      state.last=null;
      state.lastPaint=null;
    }
  }

  function remove(element){
    if(!element)return;
    const state=states.get(element);
    if(state){setRunning(element,false);state.disposed=true; if(state.observer)state.observer.disconnect()}
    element.remove();
  }

  w.mybSeasonalIllustration={create,setRunning,remove};
})(window,document);
