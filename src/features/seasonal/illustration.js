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

  // V17.22.5: source-derived photographic scenes for all twenty approved designs.
  // No text is baked into the banner, no backdrop is geometrically deformed.
  const photoThemes=new Set(['tet','beach','reunification','children','birthday','midautumn','school','halloween','teachers','christmas','nationalday','womenvn','family','vulan','hungking','culture','womensday','doanngo','nguyentieu','newyear']);
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
    // Foreground renderer from the twenty approved reference motion designs.
    // No single repeated CSS particle; each selected mode paints its own shapes.
    const motionCanvas=doc.createElement('canvas');
    motionCanvas.className='seasonRealMotion';
    motionCanvas.setAttribute('aria-hidden','true');
    element.append(motionCanvas);
    states.set(element,{reference:true,id,mode,motionCanvas,engine:null,requested:false,disposed:false});
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
    if(state.reference){
      const enabled=on && state.mode!=='still';
      element.classList.toggle('scene-active',enabled);
      if(enabled){
        if(!state.engine && w.mybSeasonalMotionCanvas){
          state.engine=w.mybSeasonalMotionCanvas.create(state.motionCanvas,state.id,state.mode);
        }
        state.engine?.start();
      }else state.engine?.stop();
      return;
    }
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
    if(state){setRunning(element,false);state.engine?.destroy();state.disposed=true}
    element.remove();
  }

  w.mybSeasonalIllustration={create,setRunning,remove};
})(window,document);
