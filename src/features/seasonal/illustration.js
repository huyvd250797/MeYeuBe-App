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
        // V17.22.21: the high-resolution photo renderer exclusively handles Doan Ngo.
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
        sprite(ctx,base,140,134,184,81);
        if(moving && mode==='flag')flag(ctx,piece,t,true);
        if(moving && mode==='ribbon')firework(ctx,t,185,49,'#ffca89',.28);
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

  // V17.22.9: the photographic themes now render motion on a dedicated high-DPI overlay canvas.
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


  function softTwinkles(ctx,t,points,color='#ffe3a8'){
    points.forEach(([x,y,size,phase])=>{
      const p=.38+.62*(.5+.5*pulse(t+phase,.28+phase*.06));
      glow(ctx,color,x,y,size*4.8,size*4.8,p*.18);
      ctx.save();ctx.globalAlpha=p*.45;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,Math.max(.8,size*.22),0,tau);ctx.fill();ctx.restore();
    });
  }
  function shimmerSweep(ctx,t,x1,y1,x2,y2,widthGlow,color,alpha=.16){
    const travel=.5+.5*pulse(t,.12);
    const x=x1+(x2-x1)*travel,y=y1+(y2-y1)*travel;
    glow(ctx,color,x,y,widthGlow*2.8,widthGlow*1.6,alpha);
  }
  function mistDrift(ctx,t,anchors,color='#edf5ff'){
    anchors.forEach(([x,y,wc,hc,phase])=>{
      const drift=(.5+.5*pulse(t*.45+phase,.12))*14;
      glow(ctx,color,x+drift,y+Math.sin(t*.35+phase)*1.5,wc,hc,.05);
      glow(ctx,color,x+drift+wc*.22,y+1.8*Math.sin(t*.28+phase+1),wc*.78,hc*.84,.06);
      glow(ctx,color,x+drift-wc*.18,y-1.5*Math.sin(t*.24+phase+2),wc*.65,hc*.72,.04);
    });
  }
  function floatingBokeh(ctx,t,items,color='#ffe6c5'){
    items.forEach(([x,y,dx,dy,size,phase])=>{
      const p=fract(t/(7.4+phase*2)+phase);
      const xx=x+dx*(p-.5)+Math.sin(t*.33+phase)*2.5;
      const yy=y+dy*(p-.5)-8*p;
      glow(ctx,color,xx,yy,size,size,.06+.05*fade(p));
    });
  }
  function spriteFallNatural(ctx,img,t,opts={}){
    if(!img)return;
    const count=opts.count||8,x0=opts.start||128,range=opts.range||96,top=opts.top||-18,travel=opts.travel||214,size=opts.size||12,grow=opts.grow||4,duration=opts.duration||8,wind=opts.wind||18,spin=opts.spin||2.6,alpha=opts.alpha||.92;
    for(let i=0;i<count;i++){
      const p=fract(t/(duration+(i%4)*.37)+i*.173);
      const x=x0+(i*37)%range+Math.sin(p*6+i*1.7)*wind;
      const y=top+travel*p;
      const s=size+(i%3)*grow;
      sprite(ctx,img,x,y,s,s*img.height/img.width,(p*spin+.12*Math.sin(t+i))*(i%2?1:-1),fade(p)*alpha);
      glow(ctx,'#ffffff',x,y,s*1.3,s*.8,.018);
    }
  }
  function spriteFloatNatural(ctx,img,t,anchors,glowColor='#ffbf6d',glowAlpha=.16){
    if(!img)return;
    anchors.forEach(([x,y,amp,phase,sz,tiltScale])=>{
      const tilt=(tiltScale||.10)*pulse(t+phase,.22)+.03*pulse(t+phase,.47);
      const dy=amp*pulse(t+phase,.18);
      sprite(ctx,img,x,y+dy,sz,sz*img.height/img.width,tilt,.96);
      glow(ctx,glowColor,x,y+dy+8,sz*1.8,sz*1.7,glowAlpha+.07*(.5+.5*pulse(t+phase,.33)));
    });
  }
  function sparkleBand(ctx,t,anchors,color){
    anchors.forEach(([x,y,w,h,phase])=>{
      for(let i=0;i<7;i++){
        const p=fract(t/(5.2+i*.28)+phase+i*.11);
        const xx=x+w*p,yy=y+h*(.35+.16*Math.sin(p*6.28+i));
        glow(ctx,color,xx,yy,7,7,.06+.05*Math.sin((t+phase+i)*1.3)**2);
      }
    });
  }
  function batFlight(ctx,img,t,startY=72){
    if(!img)return;
    for(let i=0;i<3;i++){
      const p=fract(t/(6.2+i*.8)+i*.28);
      const wing=.78+.22*pulse(t+i,.92);
      sprite(ctx,img,114+p*108,startY-34*p+7*Math.sin(p*6+i),24-i*3,(11-i*1.5)*wing,-.08+.08*Math.sin(p*6+i),.65*fade(p));
    }
  }
  function balloonFloat(ctx,img,t,x,y,wBalloon){
    if(!img)return;
    const bob=4*pulse(t,.18),tilt=.05*pulse(t,.19)+.025*pulse(t,.37);
    sprite(ctx,img,x,y+bob,wBalloon,wBalloon*img.height/img.width,tilt,.98);
    glow(ctx,'#ffe4a8',x,y+bob+8,wBalloon*1.2,wBalloon*1.2,.10);
  }
  function candleFlames(ctx,t,anchors){
    anchors.forEach(([x,y])=>{
      const f=.5+.5*pulse(t+(x+y)*.01,.85);
      glow(ctx,'#ffbf73',x,y-6,18,20,.16+.12*f);
      glow(ctx,'#fff0b1',x,y-9,9,12,.18+.12*f);
      ctx.save();ctx.globalAlpha=.58+.18*f;ctx.fillStyle='#ffe69b';ctx.beginPath();ctx.moveTo(x,y-14);ctx.quadraticCurveTo(x+4,y-7,x,y-2);ctx.quadraticCurveTo(x-4,y-7,x,y-14);ctx.fill();ctx.restore();
    });
  }
  function drawPaperPlaneTrail(ctx,t,img){
    const p=fract(t/7.2+.23),x=120+86*p,y=104-42*p-16*Math.sin(Math.PI*p);
    for(let i=1;i<16;i++){
      const q=p-i*.02;if(q<0)break;
      const xx=120+86*q,yy=104-42*q-16*Math.sin(Math.PI*q);
      glow(ctx,'#fff6de',xx,yy,6,6,.03*(1-i/16));
    }
    if(img)sprite(ctx,img,x,y,48,48*img.height/img.width,-.22+.10*pulse(t,.23),.95*fade(p));
  }
  function drawTeacherSunbeam(ctx,t){
    const beam=.14+.08*(.5+.5*pulse(t,.12));
    ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=beam;
    const g=ctx.createLinearGradient(170,20,222,128);g.addColorStop(0,'rgba(255,241,196,.95)');g.addColorStop(1,'rgba(255,241,196,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(170,20);ctx.lineTo(240,56);ctx.lineTo(240,125);ctx.lineTo(194,101);ctx.closePath();ctx.fill();ctx.restore();
  }
  function waterLotus(ctx,img,t,points){
    points.forEach(([x,y,wLotus,phase])=>{
      const drift=2.2*pulse(t+phase,.16),lift=.8*pulse(t+phase,.28);
      if(img)sprite(ctx,img,x+drift,y+lift,wLotus,wLotus*img.height/img.width,0,.9);
      glow(ctx,'#ffcf89',x+drift,y+lift+4,wLotus*1.35,wLotus*.92,.11+.09*(.5+.5*pulse(t+phase,.46)));
      glow(ctx,'#ffd9b8',x+drift,y+lift+10,wLotus*1.6,wLotus*.6,.05);
    });
  }
  function snowDriftDetailed(ctx,img,t){
    for(let i=0;i<18;i++){
      const p=fract(t/(8.5+i%4*.46)+i*.17);
      const x=124+(i*10)%106+Math.sin(p*7+i)*7;
      const y=-14+210*p;
      const s=4+(i%4)*1.9;
      if(img && i%3===0) sprite(ctx,img,x,y,s,s, p*1.6,.18+.34*fade(p));
      else {
        ctx.save();ctx.globalAlpha=.22+.28*fade(p);ctx.fillStyle='#f4fbff';ctx.beginPath();ctx.arc(x,y,s*.24,0,tau);ctx.fill();ctx.restore();
      }
      glow(ctx,'#f6fcff',x,y,s*2.4,s*2.4,.018);
    }
  }
  function fireworksSoft(ctx,t,bursts){
    bursts.forEach(([x,y,color,phase,scale])=>{
      const progress=fract(t/4.1+phase),radius=6+progress*(30*scale),alpha=.42*fade(progress);
      for(let i=0;i<18;i++){
        const a=i*tau/18 + phase;
        const px=x+Math.cos(a)*radius, py=y+Math.sin(a)*radius;
        glow(ctx,color,px,py,4,4,alpha*.18);
        line(ctx,[[x+Math.cos(a)*(radius*.55),y+Math.sin(a)*(radius*.55)],[px,py]],color,.9,alpha*.32);
      }
      glow(ctx,color,x,y,radius*2.6,radius*2.6,alpha*.18);
    });
  }
  function glowPulse(ctx,t,items,color='#ffd9a8'){
    items.forEach(([x,y,w,h,phase,alpha=.12])=>{
      glow(ctx,color,x,y,w,h,alpha + alpha*(.5+.5*pulse(t+phase,.22))*.55);
    });
  }
  function subtleFlag(ctx,img,t,x,y,wid,alpha=.94){
    if(!img)return;
    sprite(ctx,img,x,y,wid,wid*img.height/img.width,.04*pulse(t,.22),alpha);
  }
  function photoPaint(state){
    const ctx=state.ctx;if(!ctx)return;
    const sx=state.scaleX||1,sy=state.scaleY||1;
    ctx.setTransform(sx,0,0,sy,0,0);ctx.clearRect(0,0,width,height);
    if(state.mode==='still')return;
    const t=state.time||0; const id=state.id, mode=state.mode, piece=state.piece;
    switch(id){
      // Tet is exclusively handled by drawTet(), which uses real photo cutouts.
      case 'newyear':
        if(mode==='fireworks')fireworksSoft(ctx,t,[[150,36,'#ffd98f',.05,1],[203,48,'#c8b8ff',.32,.86],[216,90,'#ffc786',.58,.78]]);
        else sparkleBand(ctx,t,[[132,26,96,112,.12]],'#f7dd9e');
        break;
      case 'nguyentieu':
        if(mode==='lanternGlow')spriteFloatNatural(ctx,piece,t,[[148,56,4,.1,28,.08],[191,46,5,.43,24,.08],[216,78,6,.72,20,.08]],'#ffbf6d',.14);
        else mistDrift(ctx,t,[[126,56,20,8,.1],[164,48,24,10,.42],[202,53,18,8,.71]],'#eff5ff');
        break;
      case 'womensday':
        // This branch is intentionally empty: drawWomensday renders the
        // approved image-derived butterflies or rose petals exclusively.
        break;
      case 'hungking':
        // All Hung King visual motion is handled by drawHungking() below.
        break;
      case 'reunification':
        // V17.22.18: photo-based Flag/Firework modes handled by drawReunification.
        break;
      case 'doanngo':
        // Image-derived motion belongs solely to drawDoanngo().
        break;
      case 'children':
        // Exclusive image-derived A/B implemented by drawChildren() below.
        break;
      case 'family':
        // V17.22.27: separate photographic heart / warm-home rigs are handled
        // by drawFamily. The old generic bokeh was nearly invisible.
        break;
      case 'vulan':
        if(mode==='floatingLotus'){
          waterLotus(ctx,piece,t,[[132,149,24,.08],[171,154,21,.36],[205,151,24,.58],[229,143,28,.81]]);
          softTwinkles(ctx,t,[[137,146,2,.14],[182,149,2,.41],[222,140,3,.76]],'#ffd09b');
          shimmerSweep(ctx,t,126,156,232,144,20,'#ffcb92',.06);
        }else{
          const candle=.5+.5*pulse(t,.31);
          glow(ctx,'#ffbd73',154,145,30,22,.08+.07*candle);
          glow(ctx,'#ffd289',190,109,36,46,.07+.08*(.5+.5*pulse(t+.63,.28)));
          glow(ctx,'#fff0c4',190,101,12,18,.06+.06*(.5+.5*pulse(t+.92,.43)));
          softTwinkles(ctx,t,[[147,144,2,.10],[180,149,2,.36],[193,107,3,.56],[214,84,2,.78]],'#ffcf89');
          shimmerSweep(ctx,t,152,148,214,88,22,'#ffcf97',.08);
        }
        break;
      case 'beach':
        if(mode==='wave')sparkleBand(ctx,t,[[136,118,88,22,.15],[148,138,72,18,.55]],'#fff0b5');
        else {
          spriteFallNatural(ctx,piece,t,{count:4,start:158,range:54,top:6,travel:72,size:16,grow:2,duration:11.6,wind:5,spin:1.2,alpha:.42});
          mistDrift(ctx,t,[[136,52,22,10,.2],[186,44,28,12,.6]],'#f6fbff');
        }
        break;
      case 'nationalday':
        if(mode==='flagWave') subtleFlag(ctx,piece,t,182,78,54,.94);
        else fireworksSoft(ctx,t,[[154,44,'#ffd889',.08,.9],[200,58,'#ffdd98',.41,.75]]);
        break;
      case 'midautumn':
        if(mode==='starLantern')spriteFloatNatural(ctx,piece,t,[[190,58,6,.18,34,.09]],'#ffcf7d',.14);
        else mistDrift(ctx,t,[[130,58,24,10,.18],[170,47,20,8,.44],[214,55,18,8,.72]],'#f2e9ff');
        softTwinkles(ctx,t,[[182,42,2,.1],[208,82,2,.44]],'#ffd59b');
        break;
      case 'school':
        if(mode==='plane')drawPaperPlaneTrail(ctx,t,piece);
        else sparkleBand(ctx,t,[[144,70,66,22,.33]],'#fff4d8');
        break;
      case 'womenvn':
        if(mode==='rosePetals')spriteFallNatural(ctx,piece,t,{count:7,start:134,range:88,size:10,grow:3,duration:8.4,wind:12,spin:2.2});
        else {
          shimmerSweep(ctx,t,150,92,220,78,28,'#ffd8ea',.12);
          softTwinkles(ctx,t,[[174,70,2,.16],[210,104,2,.48]],'#ffe8f2');
        }
        break;
      case 'halloween':
        if(mode==='pumpkin'){
          glowPulse(ctx,t,[[183,98,28,24,.1,.11],[209,96,18,16,.6,.09]],'#ffaf4b');
        } else batFlight(ctx,piece,t,74);
        break;
      case 'teachers':
        if(mode==='petals')spriteFallNatural(ctx,piece,t,{count:7,start:126,range:94,size:9,grow:3,duration:8.3,wind:12,spin:2.5});
        else {drawTeacherSunbeam(ctx,t); floatingBokeh(ctx,t,[[180,78,18,-10,16,.2],[206,94,16,-8,14,.6]],'#ffe3b8');}
        break;
      case 'culture':
        if(mode==='lotusPetals')spriteFallNatural(ctx,piece,t,{count:6,start:130,range:94,size:10,grow:3,duration:9.1,wind:12,spin:2.0});
        else {
          glowPulse(ctx,t,[[214,46,48,48,.1,.04],[214,46,72,72,.45,.03]],'#e2c17d');
          softTwinkles(ctx,t,[[202,42,2,.1],[224,52,2,.5]],'#f5d69d');
        }
        break;
      case 'christmas':
        if(mode==='snow')snowDriftDetailed(ctx,piece,t);
        else {
          softTwinkles(ctx,t,[[143,39,3,.12],[181,65,3,.41],[209,92,2,.76],[162,128,2,.28]],'#d8f0ff');
          shimmerSweep(ctx,t,154,58,212,80,24,'#bde6ff',.10);
        }
        break;
      case 'birthday':
        if(mode==='confetti')sparkleBand(ctx,t,[[136,26,96,112,.18]],'#ffd2a1');
        else candleFlames(ctx,t,[[174,66],[192,61],[209,67]]);
        break;
    }
  }

  // V17.22.9 — Tet photo-matched artwork: two distinct images and exclusive
  // movement sets. No generic tet-piece-v2 is ever drawn in lantern mode.
  // 816x381 is the scene's *source-pixel coordinate system* from the two approved
  // reference compositions; canvas and photo both use contain/right/bottom.
  const tetSceneSize={width:816,height:381};
  function drawTet(state){
    const ctx=state.ctx;
    if(!ctx||!state.canvas)return;
    const canvas=state.canvas;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(state.mode==='still'||!state.tetAssets)return;
    const rect=state.element.getBoundingClientRect();
    const cssW=Math.max(1,rect.width||240);
    const cssH=Math.max(1,rect.height||184);
    // Match image CSS: object-fit contain; object-position right bottom.
    const fit=Math.min(cssW/tetSceneSize.width,cssH/tetSceneSize.height);
    const dpr=Math.max(1,canvas.width/cssW);
    ctx.setTransform(dpr*fit,0,0,dpr*fit,dpr*(cssW-fit*tetSceneSize.width),dpr*(cssH-fit*tetSceneSize.height));
    const t=state.time||0;
    if(state.mode==='blossoms'){
      const petals=state.tetAssets.petals;
      // Each distinct photographic petal gets its own depth, drift and timing.
      // Never spawn a lantern in blossom mode.
      for(let i=0;i<13;i++){
        const petal=petals[i%petals.length];
        if(!petal)continue;
        const duration=8.8+(i%5)*.84;
        const phase=(i*.137+0.09)%1;
        const progress=fract(t/duration+phase);
        const initialX=408+(i*73)%358;
        const sway=Math.sin(progress*6.2+i*1.39)*16+Math.sin(progress*12.4+i*.72)*5;
        const x=initialX+progress*(15+i%4*6)+sway;
        const y=-34+progress*432;
        const size=11+(i%5)*3.7;
        const aspect=petal.height/petal.width;
        const angle=progress*(2.2+(i%4)*.37)*(i%2===0?1:-1)+i*.71;
        const alpha=Math.min(1,progress*8,(1-progress)*8)*(.58+(i%3)*.13);
        sprite(ctx,petal,x,y,size,size*aspect,angle,alpha);
      }
      return;
    }
    if(state.mode==='lantern'){
      const lamps=state.tetAssets.lamps;
      // Photographic lantern *including rope + tassel* rotates about each real
      // hanger, with different periods and amplitudes (no global slide/jitter).
      const items=[
        {img:lamps[0],x:469-24,y:284-185,anchorX:505-24,anchorY:288-185,rate:.182,amp:.036,phase:.34},
        {img:lamps[1],x:551-24,y:237-185,anchorX:612-24,anchorY:241-185,rate:.147,amp:.024,phase:1.19},
        {img:lamps[2],x:663-24,y:269-185,anchorX:706-24,anchorY:275-185,rate:.169,amp:.031,phase:2.32}
      ];
      for(let i=0;i<items.length;i++){
        const a=items[i];if(!a.img)continue;
        const angle=a.amp*Math.sin(t*tau*a.rate+a.phase)+.003*Math.sin(t*tau*a.rate*.56+i);
        ctx.save();ctx.translate(a.anchorX,a.anchorY);ctx.rotate(angle);
        ctx.globalAlpha=1;
        ctx.drawImage(a.img,a.x-a.anchorX,a.y-a.anchorY);
        ctx.restore();
      }
      // Warm *light reflected from the photo lanterns*, not circles pretending
      // to be separate objects. Gentle oscillation independent of the sway.
      const lights=[[484,180,44,38,.42],[586,181,82,76,.25],[685,181,49,47,.93]];
      ctx.save();ctx.globalCompositeOperation='screen';
      lights.forEach(([x,y,rw,rh,phase])=>{
        const f=.10+.035*Math.sin(t*1.5+phase);
        const g=ctx.createRadialGradient(x,y,1,x,y,Math.max(rw,rh));
        g.addColorStop(0,'rgba(255,191,93,'+f.toFixed(3)+')');
        g.addColorStop(.45,'rgba(255,150,64,'+(f*.42).toFixed(3)+')');
        g.addColorStop(1,'rgba(255,130,44,0)');
        ctx.fillStyle=g;ctx.fillRect(x-rw,y-rh,rw*2,rh*2);
      });
      ctx.restore();
    }
  }

  // V17.22.10: New Year is authored as an image-layer scene. The photo contains
  // no baked-in foreground fireworks. This painter is clipped inside the hero
  // canvas, never the appbar, other cards, or document viewport.
  const newyearSceneSize={width:816,height:381};
  function drawNewyear(state){
    const ctx=state.ctx;
    if(!ctx||!state.canvas)return;
    const canvas=state.canvas;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(state.mode==='still'||!state.newyearAssets)return;
    const rect=state.element.getBoundingClientRect();
    const cssW=Math.max(1,rect.width||240),cssH=Math.max(1,rect.height||184);
    const fit=Math.min(cssW/newyearSceneSize.width,cssH/newyearSceneSize.height);
    const dpr=Math.max(1,canvas.width/cssW);
    ctx.setTransform(dpr*fit,0,0,dpr*fit,
      dpr*(cssW-fit*newyearSceneSize.width),dpr*(cssH-fit*newyearSceneSize.height));
    // The UI text is on the left; all movement must remain inside the right
    // portion of the hero. The hero's own overflow:hidden is an extra guard.
    ctx.save();ctx.beginPath();ctx.rect(344,23,465,289);ctx.clip();
    const t=state.time||0;
    if(state.mode==='fireworks'){
      // These are cut from the approved photo artwork, NOT Canvas-drawn rays.
      const bursts=[
        {image:state.newyearAssets.fireworks[0],x:519,y:134,span:164,phase:.39,cycle:5.8,rotation:-.08},
        {image:state.newyearAssets.fireworks[1],x:688,y:111,span:128,phase:.02,cycle:6.5,rotation:.12},
        {image:state.newyearAssets.fireworks[2],x:737,y:170,span:117,phase:.67,cycle:6.1,rotation:.02},
        {image:state.newyearAssets.fireworks[3],x:607,y:91,span:135,phase:.78,cycle:7.3,rotation:-.14}
      ];
      ctx.globalCompositeOperation='screen';
      for(const burst of bursts){
        const img=burst.image;if(!img)continue;
        const p=fract(t/burst.cycle+burst.phase);
        // Launch, bloom, then fade: no discontinuous on/off jumps.
        const up=Math.min(1,Math.max(0,(p-.06)/.18));
        const down=Math.min(1,Math.max(0,(.86-p)/.38));
        const alpha=up*down*.83;
        if(alpha<=.004)continue;
        const grow=.38+.72*ease(Math.min(1,Math.max(0,(p-.07)/.48)));
        const ww=burst.span*grow,hh=ww*img.height/img.width;
        ctx.save();ctx.translate(burst.x,burst.y);ctx.rotate(burst.rotation);
        ctx.globalAlpha=alpha;
        // Radial reveal makes a photographed burst grow from its ignition point.
        // No line, polygon or generic firework shader is drawn here.
        const radius=burst.span*.49*ease(Math.min(1,Math.max(0,(p-.06)/.45)));
        ctx.beginPath();ctx.arc(0,0,Math.max(1,radius),0,tau);ctx.clip();
        ctx.drawImage(img,-ww/2,-hh/2,ww,hh);
        ctx.restore();
      }
      ctx.globalCompositeOperation='source-over';
    }else if(state.mode==='confetti'){
      // B: city and gift reflections. No firework asset is used in this branch.
      const glowSprite=state.newyearAssets.glint;
      const lights=[
        [391,247,15,.09],[451,255,12,.29],[488,228,13,.51],
        [545,247,13,.71],[579,223,12,.11],[621,245,14,.43],
        [680,236,16,.76],[715,252,19,.16],[755,228,18,.57],
        [791,261,20,.83],[729,199,11,.41],[667,213,11,.67]
      ];
      ctx.save();ctx.globalCompositeOperation='screen';
      lights.forEach(([x,y,sz,phase],i)=>{
        // Out of phase, small breathing highlights anchored to real objects.
        const a=(.22+.78*(.5+.5*Math.sin(t*(.7+(i%3)*.11)+phase*tau))**3)*.52;
        if(glowSprite){
          ctx.globalAlpha=a;
          const size=sz*(.80+.22*Math.sin(t*.41+phase*tau));
          ctx.drawImage(glowSprite,x-size/2,y-size/2,size,size);
        }else{
          const gradient=ctx.createRadialGradient(x,y,0,x,y,sz*.65);
          gradient.addColorStop(0,'rgba(255,220,143,'+a.toFixed(3)+')');
          gradient.addColorStop(1,'rgba(255,220,143,0)');
          ctx.globalAlpha=1;ctx.fillStyle=gradient;ctx.fillRect(x-sz,y-sz,sz*2,sz*2);
        }
      });
      ctx.restore();
    }
    ctx.restore();
  }

  // V17.22.14 — Tết Nguyên Tiêu: two *exclusive* photo-derived motion layers.
  // The approved photograph and the canvas share an 816 x 381 coordinate system.
  // Objects are genuine cropped lantern/lotus pixels from the high-res artwork;
  // the pagoda, lake, trees, moon and app controls never deform or translate.
  const nguyentieuSceneSize={width:816,height:381};
  function drawNguyentieu(state){
    const ctx=state.ctx,canvas=state.canvas;
    if(!ctx||!canvas)return;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(state.mode==='still'||!state.nguyentieuAssets)return;
    const rect=state.element.getBoundingClientRect();
    const cssW=Math.max(1,rect.width||240),cssH=Math.max(1,rect.height||184);
    const fit=Math.min(cssW/nguyentieuSceneSize.width,cssH/nguyentieuSceneSize.height);
    const dpr=Math.max(1,canvas.width/cssW);
    ctx.setTransform(dpr*fit,0,0,dpr*fit,
      dpr*(cssW-fit*nguyentieuSceneSize.width),dpr*(cssH-fit*nguyentieuSceneSize.height));
    // No movement left of the baby's profile, above the hero, or into another card.
    ctx.save();ctx.beginPath();ctx.rect(356,18,460,335);ctx.clip();
    const t=state.time||0;
    if(state.mode==='lanternGlow'){
      // A: sky lanterns rise from above the lake with distinct depth/speeds.
      // Nothing shaped like a lotus is drawn in this branch.
      const lamps=state.nguyentieuAssets.lanterns;
      const items=[
        [470,275,8.8,.06,41,0],[555,290,11.4,.38,29,1],
        [624,282,9.7,.67,38,0],[701,260,12.3,.18,27,1],
        [755,295,10.6,.79,33,0],[593,270,14.1,.88,22,1]
      ];
      items.forEach(([x0,y0,cycle,phase,size,idx],i)=>{
        const img=lamps[idx];if(!img)return;
        const p=fract(t/cycle+phase);
        const rise=(198+(i%3)*13)*p;
        const x=x0+Math.sin(p*tau*1.13+i*.81)*(9+i%3*2)+p*(i%2?-11:9);
        const y=y0-rise;
        const d=size*(1-.31*p);
        // Smooth entrance/exit hides the cycle wrap; stable subpixel motion.
        const alpha=Math.min(1,p/.12,(1-p)/.19)*(.82+.08*(i%3));
        ctx.save();ctx.translate(x,y);ctx.rotate(.035*Math.sin(t*.42+i));
        ctx.globalAlpha=Math.max(0,alpha);
        ctx.drawImage(img,-d/2,-d*img.height/img.width/2,d,d*img.height/img.width);
        ctx.restore();
      });
    }else if(state.mode==='moonClouds'){
      // B: authentic lotus lanterns drift along the water line with reflections.
      // No rising sky lanterns or cloud drawings are used in this branch.
      const lotuses=state.nguyentieuAssets.lotuses;
      const items=[
        [405,288,111,13.5,.20,0],[562,296,65,16.7,1.43,1],
        [714,294,82,19.1,2.16,0]
      ];
      items.forEach(([x0,y0,size,cycle,phase,idx],i)=>{
        const img=lotuses[idx];if(!img)return;
        const drift=11*Math.sin(t*tau/cycle+phase);
        const bob=1.7*Math.sin(t*tau/(cycle*.37)+phase+.6);
        const x=x0+drift,y=y0+bob;
        const h=size*img.height/img.width;
        // A faint localized reflection anchored to each genuine photo lantern.
        ctx.save();ctx.globalCompositeOperation='screen';
        const light=ctx.createRadialGradient(x,y+h*.49,0,x,y+h*.49,size*.65);
        const brightness=.09+.022*Math.sin(t*.6+phase);
        light.addColorStop(0,'rgba(255,174,77,'+brightness.toFixed(3)+')');
        light.addColorStop(1,'rgba(255,157,67,0)');
        ctx.fillStyle=light;ctx.fillRect(x-size*.70,y+h*.15,size*1.4,h*.85);
        ctx.restore();
        ctx.save();ctx.translate(x,y);ctx.rotate(.012*Math.sin(t*.47+i));
        ctx.globalAlpha=.95;
        ctx.drawImage(img,-size/2,-h/2,size,h);
        ctx.restore();
      });
    }
    ctx.restore();
  }

  // V17.22.15: 08/03 — approved photographic rose cutout + two exclusive
  // independent motion options. Images are pre-cut translucent WEBP sprites.
  // Coordinates use the same 816×381 photo frame as the Nativity/Nguyen Tieu scene.
  const womensdaySceneSize={width:816,height:381};
  function drawWomensday(state){
    const ctx=state.ctx,canvas=state.canvas;
    if(!ctx||!canvas)return;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(state.mode==='still'||!state.womensdayAssets)return;
    const rect=state.element.getBoundingClientRect();
    const cssW=Math.max(1,rect.width||240),cssH=Math.max(1,rect.height||184);
    const fit=Math.min(cssW/womensdaySceneSize.width,cssH/womensdaySceneSize.height);
    const dpr=Math.max(1,canvas.width/cssW);
    // Mirror the CSS object-fit:contain; the canvas stays anchored right-bottom.
    ctx.setTransform(dpr*fit,0,0,dpr*fit,
      dpr*(cssW-fit*womensdaySceneSize.width),dpr*(cssH-fit*womensdaySceneSize.height));
    ctx.save();ctx.beginPath();ctx.rect(380,18,436,335);ctx.clip();
    const t=state.time||0;
    if(state.mode==='butterflies'){
      // A: curved flight paths with independently fluttering real butterfly art.
      // No petals are rendered by this branch.
      const img=state.womensdayAssets.butterfly;
      if(img){
        const paths=[
          {x:524,y:130,rx:47,ry:29,phase:.20,period:8.8,size:52},
          {x:663,y:85,rx:57,ry:36,phase:1.78,period:10.6,size:39},
          {x:758,y:173,rx:26,ry:41,phase:3.36,period:9.3,size:32}
        ];
        paths.forEach((b,i)=>{
          const angle=t*2*Math.PI/b.period+b.phase;
          const x=b.x+b.rx*Math.cos(angle)+4*Math.sin(angle*1.6+i);
          const y=b.y+b.ry*Math.sin(angle)+3*Math.sin(t*.74+i);
          const wing=.85+.15*Math.cos(t*(17.4+i*1.8)+i*.6);
          const height=b.size*img.height/img.width;
          ctx.save();ctx.translate(x,y);
          ctx.rotate(.16*Math.sin(angle+.4*i));
          ctx.scale(wing*(i===2?-1:1),1);
          ctx.globalAlpha=.84+.10*Math.sin(t*.65+i)**2;
          ctx.drawImage(img,-b.size/2,-height/2,b.size,height);
          ctx.restore();
        });
      }
    }else if(state.mode==='petals'){
      // B: pink photographic petals fall under gravity, with a mild lateral
      // breeze and several apparent depth layers; no butterfly imagery at all.
      const img=state.womensdayAssets.petal;
      if(img){
        for(let i=0;i<11;i++){
          const duration=6.4+(i%5)*.85;
          const progress=fract(t/duration+i*.149);
          const x0=412+(i*43)%378;
          const wind=23*Math.sin(progress*3.2+i*.92)+9*progress;
          const x=x0+wind;
          const y=8+progress*(337+(i%3)*5);
          const size=20+(i%4)*5;
          const aspect=img.height/img.width;
          const fadeIn=Math.min(1,progress/.13),fadeOut=Math.min(1,(1-progress)/.16);
          ctx.save();ctx.translate(x,y);
          ctx.rotate(progress*3.9*(i%2===0?1:-1)+i*.53);
          ctx.scale(.82+.18*Math.sin(t*.68+i),1);
          ctx.globalAlpha=Math.max(0,Math.min(fadeIn,fadeOut))*(.55+.11*(i%3));
          ctx.drawImage(img,-size/2,-size*aspect/2,size,size*aspect);
          ctx.restore();
        }
      }
    }
    ctx.restore();
  }

  // V17.22.16 — Hung Kings Commemoration.
  // Approved source-derived temple, anchored flags and a separate photographic
  // blossom layer. Never shear the gate, mountain or the entire scene.
  const hungkingSceneSize={width:816,height:381};
  function drawHungking(state){
    const ctx=state.ctx,canvas=state.canvas;
    if(!ctx||!canvas)return;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(!state.hungkingAssets)return;
    const rect=state.element.getBoundingClientRect();
    const cssW=Math.max(1,rect.width||240),cssH=Math.max(1,rect.height||184);
    const fit=Math.min(cssW/hungkingSceneSize.width,cssH/hungkingSceneSize.height);
    const dpr=Math.max(1,canvas.width/cssW);
    ctx.setTransform(dpr*fit,0,0,dpr*fit,
      dpr*(cssW-fit*hungkingSceneSize.width),dpr*(cssH-fit*hungkingSceneSize.height));
    ctx.save();
    ctx.beginPath();ctx.rect(340,24,476,330);ctx.clip();
    const t=state.time||0;
    const flags=state.hungkingAssets.flags||[];
    const anchors=[
      {x:380,y:169,w:63,h:112,phase:.1},
      {x:440,y:218,w:47,h:90,phase:1.2},
      {x:691,y:225,w:42,h:87,phase:2.4},
      {x:731,y:203,w:62,h:121,phase:3.5}
    ];
    flags.forEach((img,i)=>{
      if(!img)return;
      const f=anchors[i];
      const moving=state.mode==='banners';
      // Fixed upper corner at the flagpole; subpixel ripples build toward the
      // free edge. Real flag photograph remains sharp and fully recognizable.
      const slices=12;
      for(let k=0;k<slices;k++){
        const u=k/slices,free=k/(slices-1);
        const phase=t*(.65+i*.07)-u*4.3+f.phase;
        const sway=moving?free*2.3*Math.sin(phase):0;
        const dy=moving?free*1.1*Math.sin(phase*.91):0;
        const sourceX=img.width*k/slices;
        ctx.drawImage(img,sourceX,0,img.width/slices,img.height,
          f.x+f.w*u+sway,f.y+dy,f.w/slices+.28,f.h);
      }
    });
    if(state.mode==='heritageClouds'){
      // Approved option A — rare, soft peach blossoms drifting over the right
      // side of the temple. Each sprite is a real photo-derived petal.
      const petal=state.hungkingAssets.petal;
      if(petal){
        for(let i=0;i<9;i++){
          const cycle=8.4+(i%4)*1.1;
          const phase=(i*.177) % 1;
          const prog=fract(t/cycle+phase);
          const x=422+((i*53)%350)+12*Math.sin(prog*6.28+i*.7);
          const y=28+prog*315;
          const size=12+(i%4)*3;
          const alpha=Math.max(0,Math.min(1,prog/.11,(1-prog)/.14))*(.55+i%3*.12);
          ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);
          ctx.rotate((i%2?-1:1)*(prog*2.9+i*.7));
          const wide=.78+.22*Math.sin(t*.73+i);
          ctx.scale(wide,1);
          ctx.drawImage(petal,-size/2,-size*petal.height/petal.width/2,
            size,size*petal.height/petal.width);
          ctx.restore();
        }
      }
    }
    ctx.restore();
  }

  // V17.22.18 — Reunification Day: approved TWO exclusive effects.
  // A: complete high-resolution raster cloth, pre-warped in whole frames to
  // avoid the visible vertical cuts produced by canvas strips in v17.22.18.
  // B: approved daylight fireworks with genuine transparent mattes: NO night
  // panel, NO sky-colored rectangle, NO coverage of the rooftop national flag.
  const reunificationSceneSize={width:816,height:381};
  const reunionFlagFrames=96, reunionFlagCols=8;
  const reunionFlagTile={w:192,h:114};
  const clip01=n=>Math.max(0,Math.min(1,n));
  const smooth01=n=>{const x=clip01(n);return x*x*(3-2*x)};
  function drawReunionAtlasFrame(ctx,img,frame,x,y,w,h,opacity){
    if(!img)return;
    const col=frame%reunionFlagCols,row=Math.floor(frame/reunionFlagCols);
    ctx.save();ctx.globalAlpha=opacity;
    ctx.drawImage(img,col*reunionFlagTile.w,row*reunionFlagTile.h,
      reunionFlagTile.w,reunionFlagTile.h,x,y,w,h);
    ctx.restore();
  }
  function drawReunionSmoothFlag(ctx,img,t,cycle,x,y,w,h,opacity){
    if(!img)return;
    const pos=(((t%cycle)+cycle)%cycle)/cycle*reunionFlagFrames;
    // 96 raster frames over ~3 seconds gives ~28-34 distinct fluid steps
    // while avoiding alpha pulsation from crossfading opaque flag frames.
    drawReunionAtlasFrame(ctx,img,Math.floor(pos),x,y,w,h,opacity);
  }
  function drawReunification(state){
    const ctx=state.ctx,canvas=state.canvas;
    if(!ctx||!canvas)return;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(state.mode==='still'||!state.reunificationAssets)return;
    const rect=state.element.getBoundingClientRect();
    const cssW=Math.max(1,rect.width||240),cssH=Math.max(1,rect.height||184);
    const fit=Math.min(cssW/reunificationSceneSize.width,cssH/reunificationSceneSize.height);
    const dpr=Math.max(1,canvas.width/cssW);
    ctx.setTransform(dpr*fit,0,0,dpr*fit,
      dpr*(cssW-fit*reunificationSceneSize.width),
      dpr*(cssH-fit*reunificationSceneSize.height));
    const t=state.time||0,assets=state.reunificationAssets;
    ctx.save();ctx.beginPath();ctx.rect(0,0,816,381);ctx.clip();
    if(state.mode==='flag'){
      // Background cloth floats only over the bright sky, on the right.
      // Its bottom fades before the real rooftop flag and the building.
      ctx.save();ctx.beginPath();ctx.rect(315,0,501,153);ctx.clip();
      drawReunionSmoothFlag(ctx,assets.canopy,t,3.5,366,-55,458,235,.91);
      ctx.restore();
      // Flagpole remains at its true position. The flag itself uses an entire
      // photorealistic fabric sprite (no canvas-column slices).
      drawReunionSmoothFlag(ctx,assets.roof,t+1.1,2.8,469,158,40,24,.97);
    }else if(state.mode==='ribbon'){
      // Legacy saved ID 'ribbon' maps to the approved daytime fireworks mode.
      const sprites=assets.fireworks||[];
      const bursts=[
        {idx:0,x:571,y:87,size:122,cycle:3.65,phase:.16},
        {idx:1,x:706,y:94,size:110,cycle:4.15,phase:.56},
        {idx:2,x:399,y:103,size:93,cycle:4.35,phase:.76},
        {idx:3,x:767,y:69,size:80,cycle:4.8,phase:.34}
      ];
      ctx.save();ctx.beginPath();ctx.rect(330,12,485,133);ctx.clip();
      // No dimming of the day sky; fireworks are bright transparent sprites.
      ctx.globalCompositeOperation='screen';
      bursts.forEach(({idx,x,y,size,cycle,phase})=>{
        const img=sprites[idx];if(!img)return;
        const p=((t/cycle+phase)%1+1)%1;
        const opacity=.93*smooth01(p/.18)*(1-smooth01((p-.44)/.56));
        if(opacity<.01)return;
        const scale=.55+.65*(1-Math.pow(1-p,1.4));
        const ww=size*scale,hh=ww*img.height/img.width;
        ctx.globalAlpha=opacity;
        ctx.drawImage(img,x-ww/2,y-hh/2,ww,hh);
      });
      ctx.restore();
    }
    ctx.restore();
  }


  // V17.22.21: use the intrinsic source image (548 x 215) as the ONLY
  // motion coordinate system. The previous 816x381 plane placed sprites far
  // outside their photographic anchors on narrow iPhones.
  const doanngoSceneSize={width:548,height:215};
  function drawDoanngo(state){
    const ctx=state.ctx,canvas=state.canvas;
    if(!ctx||!canvas)return;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(state.mode==='still'||!state.doanngoAssets)return;
    const rect=state.element.getBoundingClientRect();
    const cssW=Math.max(1,rect.width||240),cssH=Math.max(1,rect.height||184);
    const sceneW=state.picture?.naturalWidth||doanngoSceneSize.width;
    const sceneH=state.picture?.naturalHeight||doanngoSceneSize.height;
    // CSS image: object-fit:contain; object-position:right bottom.
    const fit=Math.min(cssW/sceneW,cssH/sceneH);
    const dpr=Math.max(1,canvas.width/cssW);
    ctx.setTransform(dpr*fit,0,0,dpr*fit,
      dpr*(cssW-fit*sceneW),dpr*(cssH-fit*sceneH));
    const t=state.time||0,as=state.doanngoAssets;
    ctx.save();ctx.beginPath();ctx.rect(0,0,sceneW,sceneH);ctx.clip();
    if(state.mode==='dragonflies'){
      // Both photographic insects are independent: no synthetic line art or leaf.
      const flights=[
        {img:as.dragonflies?.[0],x:290,y:49,rx:37,ry:17,cycle:7.2,phase:.12,size:.92,angle:.08},
        {img:as.dragonflies?.[1],x:407,y:68,rx:40,ry:21,cycle:8.4,phase:.57,size:.94,angle:-.11}
      ];
      flights.forEach((f,i)=>{
        if(!f.img)return;
        const u=t/f.cycle+f.phase,a=2*Math.PI*u;
        const x=f.x+f.rx*Math.sin(a)+5*Math.sin(2*a+i);
        const y=f.y+f.ry*Math.cos(a)+3*Math.sin(3*a+.8*i);
        const flap=1+.035*Math.sin(t*(13+i*2)+.6*i);
        const rotation=f.angle+.10*Math.sin(a+.5*i);
        sprite(ctx,f.img,x,y,f.img.width*f.size*flap,f.img.height*f.size,rotation,.99);
      });
    }else if(state.mode==='summerLeaves'){
      const leaf=as.leaf;
      if(leaf){
        // Branch leaves sway in place; separate fallen leaves descend gently.
        const canopy=[{x:455,y:20,size:59,phase:.2},{x:527,y:27,size:45,phase:1.2}];
        canopy.forEach(c=>{
          sprite(ctx,leaf,c.x,c.y,c.size,c.size*leaf.height/leaf.width,
            -.12+.07*Math.sin(t*1.18+c.phase),.9);
        });
        const falling=[
          {x:325,y:-12,range:176,dx:22,cycle:9.0,phase:.08,size:47,angle:1.0},
          {x:415,y:-25,range:180,dx:-20,cycle:10.1,phase:.43,size:42,angle:-.9},
          {x:487,y:-15,range:162,dx:16,cycle:8.8,phase:.74,size:35,angle:.9}
        ];
        falling.forEach((f,i)=>{
          const u=((t/f.cycle+f.phase)%1+1)%1;
          const alpha=Math.min(1,u*9,(1-u)*9)*.9;
          const x=f.x+f.dx*u+10*Math.sin(u*2*Math.PI*1.15+i*1.4);
          const y=f.y+f.range*u;
          const size=f.size*(1+.055*Math.sin(t*1.1+i));
          sprite(ctx,leaf,x,y,size,size*leaf.height/leaf.width,
            f.angle*u+.14*Math.sin(t*1.6+i),alpha);
        });
      }
    }
    ctx.restore();
  }


  // V17.22.24 — Children's Day natural-motion rigs refined to match the approved realistic GIF demos.
  // GIF-approved A: latex balloons with gravity/pendulum sway and paper flutter.
  // GIF-approved B: optical thin-film bubbles and stationary-stem foil pinwheels.
  // Scene and baby's details never move; all artwork is clipped to the hero card.
  const childrenSceneSize={width:548,height:215};
  function drawChildren(state){
    const ctx=state.ctx,canvas=state.canvas;
    if(!ctx||!canvas)return;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(state.mode==='still'||!state.childrenAssets)return;
    const rect=state.element.getBoundingClientRect();
    const cssW=Math.max(1,rect.width||240),cssH=Math.max(1,rect.height||184);
    const sceneW=state.picture?.naturalWidth||childrenSceneSize.width;
    const sceneH=state.picture?.naturalHeight||childrenSceneSize.height;
    const fit=Math.min(cssW/sceneW,cssH/sceneH);
    const dpr=Math.max(1,canvas.width/cssW);
    ctx.setTransform(dpr*fit,0,0,dpr*fit,
      dpr*(cssW-fit*sceneW),dpr*(cssH-fit*sceneH));
    const t=state.time||0,as=state.childrenAssets;
    ctx.save();ctx.beginPath();ctx.rect(0,0,sceneW,sceneH);ctx.clip();
    if(state.mode==='balloons'){
      const balloons=as.balloons||[];
      // The source photo retains the actual teddy, rabbit, lit star, gifts.
      // Additional latex balloons stay in the upper-right sky. Each pendulum
      // has its own slow response to the same imaginary breeze.
      const group=[
        {img:balloons[0],x:356,y:47,w:54,phase:.42,cycle:7.2,sway:3.0,depth:.97},
        {img:balloons[1],x:431,y:39,w:61,phase:1.32,cycle:8.1,sway:3.6,depth:1.02},
        {img:balloons[2],x:495,y:57,w:52,phase:2.78,cycle:7.6,sway:2.8,depth:.95}
      ];
      group.forEach((b,i)=>{
        if(!b.img)return;
        const theta=t*2*Math.PI/b.cycle+b.phase;
        const breeze=Math.sin(theta)*b.sway + Math.sin(t*.19+i*1.1)*0.9;
        const dy=2.2*Math.sin(theta-.7)+0.45*Math.sin(t*.33+i*0.8);
        const angle=.024*Math.sin(theta+.3)+.005*Math.sin(t*.29+i);
        const scale=b.depth*(.992+.012*Math.sin(theta*.65+i*.4));
        const w=b.w*scale,h=w*b.img.height/b.img.width;
        sprite(ctx,b.img,b.x+breeze,b.y+dy,w,h,angle,.988);
      });
      // Sparse paper squares drift through the upper-right area only, to keep
      // the scene playful but not obviously synthetic.
      const paper=['#f3c6d4','#f0d68d','#9ecde8','#d9c0ec','#ffd0a8'];
      for(let i=0;i<6;i++){
        const life=9.8+(i%3)*.9;
        const u=((t/life+i*.211)%1+1)%1;
        const x=328+(i*39)%198+7*Math.sin(u*4.6+i*1.3);
        const y=10+u*156;
        const alpha=.62*Math.min(1,u*10,(1-u)*9);
        if(alpha<=0)continue;
        ctx.save();ctx.translate(x,y);
        ctx.rotate(i*.83+u*(i%2?-1.6:1.55));
        const foreshorten=.62+.38*Math.abs(Math.sin(t*.48+i*.7));
        ctx.scale(foreshorten,1);
        ctx.globalAlpha=alpha;
        ctx.fillStyle=paper[i%paper.length];
        ctx.fillRect(-2.2,-1.45,4.4,2.9);
        ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(-2.2,-1.45,4.4,.52);
        ctx.restore();
      }
    }else if(state.mode==='stars'){
      // Legacy saved key 'stars' is deliberately preserved for Cloud Sync;
      // its visible label is bubbles + pinwheels, never dots/stars.
      const pin=as.pinwheel,soap=as.bubble;
      if(pin){
        const fans=[
          {x:96,y:149,sz:34,stemX:88,stemY:205,speed:.72,phase:0.14,lean:-2},
          {x:448,y:118,sz:61,stemX:455,stemY:201,speed:-.58,phase:1.04,lean:1}
        ];
        fans.forEach((p,i)=>{
          // Stems remain planted in the gift / cloud floor while the foil rotor
          // spins around its own hub with only a tiny breeze wobble.
          ctx.save();ctx.strokeStyle='rgba(220,234,236,.70)';
          ctx.lineWidth=i?1.8:1.45;ctx.lineCap='round';
          ctx.beginPath();ctx.moveTo(p.stemX,p.stemY);
          ctx.quadraticCurveTo(p.x+p.lean*2,p.y+26,p.x,p.y);
          ctx.stroke();ctx.restore();
          const rotation=p.phase+t*p.speed+.018*Math.sin(t*.31+i);
          const wobble=.004*Math.sin(t*.7+i*1.4);
          sprite(ctx,pin,p.x,p.y,p.sz,p.sz,rotation+wobble,.985);
        });
      }
      if(soap){
        const bubbles=[
          {x:150,y:178,size:17,life:10.8,phase:.12,wind:10},
          {x:214,y:170,size:21,life:9.7,phase:.37,wind:-12},
          {x:272,y:160,size:27,life:10.2,phase:.61,wind:14},
          {x:335,y:174,size:18,life:11.1,phase:.81,wind:9},
          {x:417,y:166,size:24,life:9.5,phase:.23,wind:-11}
        ];
        bubbles.forEach((b,i)=>{
          const u=((t/b.life+b.phase)%1+1)%1;
          const fade=Math.min(1,u*9,(1-u)*8);
          if(fade<=.005)return;
          const x=b.x + b.wind*Math.sin(u*4.8+i*.8)+1.7*Math.sin(t*.15+i*.6);
          const y=b.y-174*u;
          const size=b.size*(.965+.035*Math.sin(t*.42+i*.9));
          // Natural transparent optical film, not opaque colored discs.
          sprite(ctx,soap,x,y,size,size,.06*Math.sin(t*.28+i),fade*.9);
        });
      }
    }
    ctx.restore();
  }


  // V17.22.27 — Vietnamese Family Day: two approved, mutually exclusive rigs.
  // Source photo (548x215) is never transformed, faded, or repainted. Each
  // animated photo sprite is aligned with that source under object-fit:contain
  // and object-position:right bottom. No card height or navigation changes.
  const familySceneSize={width:548,height:215};
  function drawFamily(state){
    const ctx=state.ctx,canvas=state.canvas;
    if(!ctx||!canvas)return;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(state.mode==='still'||!state.familyAssets)return;
    const rect=state.element.getBoundingClientRect();
    const cssW=Math.max(1,rect.width||240),cssH=Math.max(1,rect.height||184);
    const sceneW=state.picture?.naturalWidth||familySceneSize.width;
    const sceneH=state.picture?.naturalHeight||familySceneSize.height;
    const fit=Math.min(cssW/sceneW,cssH/sceneH);
    const dpr=Math.max(1,canvas.width/cssW);
    ctx.setTransform(dpr*fit,0,0,dpr*fit,
      dpr*(cssW-fit*sceneW),dpr*(cssH-fit*sceneH));
    const t=state.time||0,as=state.familyAssets;
    ctx.save();ctx.beginPath();ctx.rect(0,0,sceneW,sceneH);ctx.clip();
    if(state.mode==='floatingHearts'&&as.heart){
      // Photo-derived luminous outlines. Independent smooth buoyant curves;
      // nothing moves the picture frame, family members or teddy bear.
      const hearts=[
        {x:307,y:96,size:34,up:69,wind:10,period:11.0,phase:.09,a:.82},
        {x:396,y:88,size:29,up:67,wind:-10,period:12.2,phase:.38,a:.75},
        {x:477,y:99,size:24,up:74,wind:9,period:10.4,phase:.68,a:.68},
        {x:355,y:83,size:20,up:61,wind:-7,period:13.1,phase:.85,a:.60},
        {x:508,y:111,size:19,up:72,wind:8,period:11.7,phase:.23,a:.55}
      ];
      hearts.forEach((h,i)=>{
        const u=fract(t/h.period+h.phase);
        // Smooth start/end makes seamless re-entry without a popping heart.
        const alpha=h.a*Math.min(1,u*8,(1-u)*7);
        if(alpha<=.01)return;
        const x=h.x+u*h.wind+Math.sin(t*.46+i*1.61)*4.0;
        const y=h.y-u*h.up+Math.sin(t*.62+i)*1.6;
        const scale=1+.045*Math.sin(t*.55+i);
        sprite(ctx,as.heart,x,y,h.size*scale,h.size*scale,
          .065*Math.sin(t*.39+i*.8),alpha);
      });
      // Restrained warm motes matching the approved GIF, never large circles
      // or a recurring generic particle sheet.
      [[399,91,1.0],[459,111,.34],[498,81,.69]].forEach(([x,y,ph])=>{
        const q=.5+.5*Math.sin(t*.64+ph*5.8);
        glow(ctx,'#ffebc2',x+Math.sin(t*.19+ph)*5,y,8+q*3,8+q*3,.08+q*.09);
      });
    }else if(state.mode==='homeGlow'&&as.homeLight){
      // Luminous energy changes, not the static scenery. The source remains
      // fully sharp; the alpha map is feathered around actual home windows
      // and the portrait frame instead of tinting the entire card.
      const house=.60+.40*Math.sin(t*tau/5.8-.7);
      const portrait=.60+.40*Math.sin(t*tau/7.3+1.0);
      ctx.save();ctx.globalCompositeOperation='screen';
      ctx.globalAlpha=.42+.37*house;
      ctx.drawImage(as.homeLight,0,0,sceneW,sceneH);
      ctx.restore();
      glow(ctx,'#ffcb81',190,179,69,63,.16+.18*house);
      glow(ctx,'#ffe3b6',308,138,132,95,.07+.10*portrait);
      glow(ctx,'#ffdba9',267,107,70,75,.06+.08*portrait);
      // Tiny window reflections remain fixed to their physical location.
      const windowStrength=.24+.27*house;
      ctx.save();ctx.globalAlpha=windowStrength;
      ctx.fillStyle='#fff4cc';
      ctx.fillRect(180,159,6,8);ctx.fillRect(189,159,6,8);
      ctx.restore();
    }
    ctx.restore();
  }

  function createPhotoScene(id,mode){

    const element=doc.createElement('div');
    element.className='seasonScene seasonSceneReference';
    element.dataset.art=id;
    element.dataset.motion=mode;
    element.setAttribute('aria-hidden','true');
    const picture=doc.createElement('img');
    picture.className='seasonReferenceArt';
    picture.src=art+(id==='tet'
      ? (mode==='lantern' ? 'tet-lantern-scene-v5.webp' : 'tet-mai-scene-v5.webp')
      : id==='newyear' ? 'newyear-city-scene-v7.webp'
      : id==='nguyentieu' ? 'nguyentieu-lake-scene-v7.webp'
      : id==='womensday' ? 'womensday-rose-scene-v8.webp'
      : id==='hungking' ? 'hungking-temple-scene-v9.webp'
      : id==='reunification' ? (mode==='flag' ? 'reunification-daytime-flagbase-v11.webp' : 'reunification-daytime-scene-v11.webp')
      : id==='doanngo' ? 'doanngo-photo-hero-v5.webp' : id+'-photo-hero-v3.webp');
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
    const state={element,canvas,ctx,id,mode,time:0,last:null,lastPaint:null,frame:0,requested:false,ready:true,disposed:false,overlay:true,reference:true,scaleX:1,scaleY:1,observer:null,piece:null,picture};
    if(ctx)ctx.imageSmoothingEnabled=true;
    states.set(element,state);
    const resize=()=>photoCanvasFit(state);
    if(typeof ResizeObserver!=='undefined'){
      state.observer=new ResizeObserver(resize);state.observer.observe(element);
    }else w.setTimeout(resize,0);
    if(id==='tet'){
      const assetList=['tet-petal-a-v5.webp','tet-petal-b-v5.webp','tet-petal-c-v5.webp',
        'tet-lantern-small-v5.webp','tet-lantern-large-v5.webp','tet-lantern-ivory-v5.webp'];
      Promise.all(assetList.map(load)).then(images=>{
        if(state.disposed)return;
        state.tetAssets={petals:images.slice(0,3),lamps:images.slice(3)};
        paint(state);
        if(state.requested)schedule(state);
      });
    }else if(id==='newyear'){
      // Mode A/B use the same photograph; only their image-derived overlay
      // changes. Existing saved 'confetti' settings now select gold lights.
      const files=mode==='fireworks'
        ? ['newyear-firework-rose-v6.webp','newyear-firework-pink-v6.webp',
            'newyear-firework-gold-v6.webp','newyear-firework-violet-v6.webp']
        : mode==='confetti' ? ['newyear-glint-v6.webp'] : [];
      Promise.all(files.map(load)).then(images=>{
        if(state.disposed)return;
        state.newyearAssets={
          fireworks:mode==='fireworks'?images:[],
          glint:mode==='confetti'?images[0]:null
        };
        paint(state);
        if(state.requested)schedule(state);
      });
    }else if(id==='nguyentieu'){
      // Preserve existing saved mode IDs; only imagery/labels have changed.
      const files=mode==='lanternGlow'
        ? ['nguyentieu-sky-lantern-large-v7.webp','nguyentieu-sky-lantern-small-v7.webp']
        : mode==='moonClouds'
          ? ['nguyentieu-floating-lotus-large-v7.webp','nguyentieu-floating-lotus-small-v7.webp'] : [];
      Promise.all(files.map(load)).then(images=>{
        if(state.disposed)return;
        state.nguyentieuAssets={
          lanterns:mode==='lanternGlow'?images:[],
          lotuses:mode==='moonClouds'?images:[]
        };
        paint(state);
        if(state.requested)schedule(state);
      });
    }else if(id==='womensday'){
      const files=mode==='butterflies' ? ['womensday-butterfly-v8.webp']
        : mode==='petals' ? ['womensday-petal-v8.webp'] : [];
      Promise.all(files.map(load)).then(images=>{
        if(state.disposed)return;
        state.womensdayAssets={
          butterfly:mode==='butterflies'?images[0]:null,
          petal:mode==='petals'?images[0]:null
        };
        paint(state);
        if(state.requested)schedule(state);
      });
    }else if(id==='hungking'){
      const files=[
        'hungking-flag-1-v9.webp','hungking-flag-2-v9.webp',
        'hungking-flag-3-v9.webp','hungking-flag-4-v9.webp',
        ...(mode==='heritageClouds'?['hungking-peach-petal-v9.webp']:[])
      ];
      Promise.all(files.map(load)).then(images=>{
        if(state.disposed)return;
        state.hungkingAssets={flags:images.slice(0,4),petal:mode==='heritageClouds'?images[4]:null};
        paint(state);
        if(state.requested)schedule(state);
      });
    }else if(id==='reunification'){
      const files=mode==='flag'
        ? ['reunification-canopy-atlas-v11.webp','reunification-roof-flag-atlas-v11.webp']
        : mode==='ribbon' ? ['reunification-dayfirework-pink-v11.webp','reunification-dayfirework-gold-v11.webp',
          'reunification-dayfirework-white-v11.webp','reunification-dayfirework-blue-v11.webp'] : [];
      Promise.all(files.map(load)).then(images=>{
        if(state.disposed)return;
        state.reunificationAssets={
          canopy:mode==='flag'?images[0]:null,
          roof:mode==='flag'?images[1]:null,
          fireworks:mode==='ribbon'?images:[]
        };
        paint(state);
        if(state.requested)schedule(state);
      });
    }else if(id==='doanngo'){
      const files=mode==='dragonflies'
        ? ['doanngo-dragonfly-a-v4.png','doanngo-dragonfly-b-v4.png']
        : mode==='summerLeaves' ? ['doanngo-leaf-fall-v4.png'] : [];
      Promise.all(files.map(load)).then(images=>{
        if(state.disposed)return;
        state.doanngoAssets={
          dragonflies:mode==='dragonflies'?images:[],
          leaf:mode==='summerLeaves'?images[0]:null
        };
        paint(state);
        if(state.requested)schedule(state);
      });
    }else if(id==='family'){
      const files=mode==='floatingHearts' ? ['family-heart-light-v12.webp']
        : mode==='homeGlow' ? ['family-home-light-v12.webp'] : [];
      Promise.all(files.map(load)).then(images=>{
        if(state.disposed)return;
        state.familyAssets={
          heart:mode==='floatingHearts'?images[0]:null,
          homeLight:mode==='homeGlow'?images[0]:null
        };
        paint(state);
        if(state.requested)schedule(state);
      });
    }else if(id==='children'){
      const files=mode==='balloons'
        ? ['children-real-balloon-pink-v8.webp','children-real-balloon-gold-v8.webp','children-real-balloon-blue-v8.webp']
        : mode==='stars'
          ? ['children-real-pinwheel-v8.webp','children-real-soap-bubble-v8.webp'] : [];
      Promise.all(files.map(load)).then(images=>{
        if(state.disposed)return;
        state.childrenAssets={balloons:mode==='balloons'?images:[],
          pinwheel:mode==='stars'?images[0]:null,
          bubble:mode==='stars'?images[1]:null};
        paint(state);
        if(state.requested)schedule(state);
      });
    }else{
      load(id+'-piece-v2.webp').then(img=>{ if(state.disposed)return; state.piece=img; paint(state); if(state.requested)schedule(state); });
    }
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
    if(state.overlay && state.id==='tet')return drawTet(state);
    if(state.overlay && state.id==='newyear')return drawNewyear(state);
    if(state.overlay && state.id==='nguyentieu')return drawNguyentieu(state);
    if(state.overlay && state.id==='womensday')return drawWomensday(state);
    if(state.overlay && state.id==='hungking')return drawHungking(state);
    if(state.overlay && state.id==='reunification')return drawReunification(state);
    if(state.overlay && state.id==='doanngo')return drawDoanngo(state);
    if(state.overlay && state.id==='children')return drawChildren(state);
    if(state.overlay && state.id==='family')return drawFamily(state);
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

  function setTetPagePetals(state,on){
    if(!state||state.id!=='tet')return;
    // Only live dashboard, never the settings preview. Fixed overlay is outside
    // document flow, and disappears instantly when switching to lantern/still.
    const live=typeof state.element.closest==='function' && !!state.element.closest('#dashboard .bcHero');
    if(!on||state.mode!=='blossoms'||!live){
      if(state.pagePetals){state.pagePetals.remove();state.pagePetals=null}
      return;
    }
    if(state.pagePetals||!doc.body)return;
    const layer=doc.createElement('div');layer.className='tetPagePetals';
    layer.setAttribute('aria-hidden','true');
    for(let i=0;i<6;i++){
      const petal=doc.createElement('img');
      petal.alt='';petal.draggable=false;
      petal.src=art+'tet-petal-'+['a','b','c'][i%3]+'-v5.webp';
      petal.style.setProperty('--petal-x',(52+(i*83)%43)+'%');
      petal.style.setProperty('--petal-size',(15+(i%4)*3)+'px');
      petal.style.setProperty('--petal-delay',(-i*2.3)+'s');
      petal.style.setProperty('--petal-duration',(9.2+i%4*1.3)+'s');
      layer.append(petal);
    }
    doc.body.append(layer);state.pagePetals=layer;
  }

  function setRunning(element,on){
    const state=states.get(element);
    if(!state||state.requested===on)return;
    state.requested=on;
    element.classList.toggle('scene-active',on && state.mode!=='still');
    setTetPagePetals(state,on);
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
