(function initFishermanEasyGame(){
let canvas=document.getElementById('myCanvas');
let ctx=canvas.getContext('2d');
let W=canvas.width;
let H=canvas.height;
let loopId=null;
let playing=false;
let fishes=[];
let score=0;
let timeLeft=30;
let hook={x:W/2,y:80,drop:false,length:0};

function startGame(){
  playing=true;
  score=0;
  timeLeft=30;
  lastTime=0; // Reset timer
  fishes=createFishes(6); // Reduced count
  hook.x=W/2; hook.y=80; hook.drop=false; hook.length=0;
  canvas.onclick=function(e){
    const {x}=windowToCanvas(canvas,e.clientX,e.clientY);
    hook.x=x;
    if(!hook.drop){ hook.drop=true; }
  };
  canvas.onmousemove=function(e){
    const {x}=windowToCanvas(canvas,e.clientX,e.clientY);
    if(!hook.drop) hook.x=x;
  };
  draw();
  requestAnimationFrame(loop);
}

function createFishes(n){
  const arr=[];
  for(let i=0;i<n;i++){
    const y=H*0.35+Math.random()*H*0.55;
    const dir=Math.random()<0.5?-1:1;
    const x=dir<0?W+Math.random()*W:-Math.random()*W;
    // Speed increased (80-140), Larger radius (35-50)
    const s=80+Math.random()*60;
    const r=35+Math.random()*15;
    arr.push({x,y,dir,speed:s,radius:r,caught:false,type:'fish'});
  }
  return arr;
}

let lastTime=0;

function loop(ts){
  if(!lastTime) lastTime=ts;
  const dt=(ts-lastTime)/1000;
  lastTime=ts;
  update(dt);
  draw();
  if(playing){ loopId=requestAnimationFrame(loop); }
}

function update(dt){
  timeLeft=Math.max(0,timeLeft-dt);
  if(timeLeft===0){ endGame(); return; }
  for(const f of fishes){
    if(f.caught) continue;
    f.x+=f.dir*f.speed*dt;
    if(f.dir<0 && f.x<-60){ f.x=W+60; }
    if(f.dir>0 && f.x>W+60){ f.x=-60; }
  }
  if(hook.drop){
    hook.length+=480*dt;
    if(hook.length>H-120){ hook.drop=false; hook.length=0; }
    const hx=hook.x;
    const hy=hook.y+hook.length;
    for(const f of fishes){
      if(f.caught) continue;
      const dx=hx-f.x;
      const dy=hy-f.y;
      if(dx*dx+dy*dy<(f.radius+8)*(f.radius+8)){
        // Respawn fish immediately
        f.y=H*0.35+Math.random()*H*0.55;
        f.dir=Math.random()<0.5?-1:1;
        f.x=f.dir<0?W+60:-60;
        f.speed=80+Math.random()*60; 
        f.radius=35+Math.random()*15;

        score+=10;
        hook.drop=false;
        hook.length=0;
        break;
      }
    }
  }
}

function draw(){
  ctx.clearRect(0,0,W,H);
  drawScene();
  drawHUD();
}

function drawScene(){
  let g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#cbe7ff');
  g.addColorStop(0.3,'#9bd4ff');
  g.addColorStop(0.6,'#66c3ff');
  g.addColorStop(1,'#3aa9f0');
  ctx.fillStyle=g;
  ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.fillRect(0,0,W,H*0.25);
  ctx.fillStyle='#795548';
  ctx.fillRect(W/2-4,0,8,80);
  ctx.strokeStyle='#455A64';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(W/2,80);
  ctx.lineTo(W/2+60,40);
  ctx.stroke();
  ctx.fillStyle='#4FC3F7';
  ctx.fillRect(0,H*0.3,W,H*0.7);
  for(const f of fishes){
    if(f.caught) continue;
    ctx.save();
    ctx.translate(f.x,f.y);
    if(f.dir<0) ctx.scale(-1,1); // Flip if moving left
    ctx.fillStyle='#ff7043';
    ctx.beginPath();
    ctx.ellipse(0,0,f.radius,f.radius*0.6,0,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#ef6c00';
    ctx.beginPath();
    ctx.moveTo(-f.radius,f.radius*0.1);
    ctx.lineTo(-f.radius-12,0);
    ctx.lineTo(-f.radius,f.radius*-0.1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.strokeStyle='#263238';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(hook.x,hook.y);
  ctx.lineTo(hook.x,hook.y+hook.length);
  ctx.stroke();
  ctx.fillStyle='#263238';
  ctx.beginPath();
  ctx.arc(hook.x,hook.y+hook.length,6,0,Math.PI*2);
  ctx.fill();
}

function drawHUD(){
  ctx.fillStyle='#000';
  ctx.font='bold 28px Microsoft YaHei';
  ctx.textAlign='left';
  ctx.fillText('初级模式 - 得分: '+score,20,40);
  ctx.textAlign='right';
  ctx.fillText('剩余时间: '+Math.ceil(timeLeft),W-20,40);
}

function endGame(){
  playing=false;
  if(loopId){ cancelAnimationFrame(loopId); loopId=null; }
  ctx.fillStyle='rgba(0,0,0,0.6)';
  ctx.fillRect(0,0,W,H);
  const col=getButtonColors('accent');
  const bw=240,bh=70;
  const again=new CanvasButton(ctx,W/2-bw/2,H/2-90,bw,bh,'再玩一次',col[0],col[1]);
  const back=new CanvasButton(ctx,W/2-bw/2,H/2+20,bw,bh,'返回选择',col[0],col[1]);
  again.draw(); back.draw();
  canvas.onclick=function(e){
    const {x,y}=windowToCanvas(canvas,e.clientX,e.clientY);
    if(again.isClicked(x,y)){ startGame(); }
    else if(back.isClicked(x,y)){ 
       // Return to start screen logic? Or reload page?
       // Start screen is in start.js. We need to re-trigger startScreen()
       // Or better: location.reload() to be safe and simple
       if(window.initFishermanStartScreen) window.initFishermanStartScreen(); // if exposed
       else location.reload();
    }
  };
  canvas.onmousemove=function(e){
    const {x,y}=windowToCanvas(canvas,e.clientX,e.clientY);
    again.setHovered(again.contains(x,y));
    back.setHovered(back.contains(x,y));
  };
}

window.startEasyGame=function(){ startGame(); };
})();