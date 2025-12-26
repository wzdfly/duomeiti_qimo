(function initFishermanHardGame(){
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
let paused=false;
let pauseBtn=null;
let restartBtn=null;
let backBtn=null;
let waveT=0;

  // Load main menu BGM
  const bgm = new Audio('../../audio/bgm.ogg');
  bgm.loop = true;
  const correctSound = new Audio('../../audio/correct.mp3');
  const wrongSound = new Audio('../../audio/wrong.mp3');

  function startGame(){
    playing=true;
    
    // Play BGM if enabled
    let musicOn = localStorage.getItem('fisherman_bgm') !== 'false';
    bgm.currentTime = 0;
    if(musicOn) {
        bgm.play().catch(e=>console.log("Audio play failed:", e));
    }

    score=0;
  timeLeft=30;
  lastTime=0; // Reset timer
  fishes=createFishes(15); // Many creatures
  paused=false;
  hook.x=W/2; hook.y=80; hook.drop=false; hook.length=0;

  // Init buttons
  const bw=80,bh=35;
  const startX = W/2 - (bw*3 + 20)/2 + 100; // Center + offset right
  // Style: flat buttons
  pauseBtn=new CanvasButton(ctx,startX,10,bw,bh,'暂停','rgba(255,152,0,0.8)','#fff','flat');
  restartBtn=new CanvasButton(ctx,startX+bw+10,10,bw,bh,'重来','rgba(76,175,80,0.8)','#fff','flat');
  backBtn=new CanvasButton(ctx,startX+(bw+10)*2,10,bw,bh,'返回','rgba(33,150,243,0.8)','#fff','flat');

  canvas.onclick=function(e){
    const {x,y}=windowToCanvas(canvas,e.clientX,e.clientY);
    
    // Prevent event bubbling
    e.stopPropagation();
    e.preventDefault();

    const col=getButtonColors('accent');
    
    if(pauseBtn && pauseBtn.isClicked(x,y)){
      paused=!paused;
      pauseBtn.text=paused?'继续':'暂停';
      
      let musicOn = localStorage.getItem('fisherman_bgm') !== 'false';
      if(musicOn) {
          if(paused) bgm.pause();
          else bgm.play();
      }
      return;
    }
    if(restartBtn && restartBtn.isClicked(x,y)){
      playing=false;
      bgm.pause();
      if(loopId){ cancelAnimationFrame(loopId); loopId=null; }
      startGame();
      return;
    }
    if(backBtn && backBtn.isClicked(x,y)){
      playing=false;
      bgm.pause();
      bgm.currentTime = 0;
      if(loopId){ cancelAnimationFrame(loopId); loopId=null; }
      
      // Clean up
      canvas.onclick=null; 
      canvas.onmousemove=null;
      
      location.reload();
      return;
    }
    if(paused) return;
    
    // Game logic
    if(timeLeft > 0){
        hook.x=x;
        if(!hook.drop){ hook.drop=true; }
    }
  };
  canvas.onmousemove=function(e){
    const {x,y}=windowToCanvas(canvas,e.clientX,e.clientY);
    let changed=false;
    if(pauseBtn && pauseBtn.setHovered(pauseBtn.contains(x,y))) changed=true;
    if(restartBtn && restartBtn.setHovered(restartBtn.contains(x,y))) changed=true;
    if(backBtn && backBtn.setHovered(backBtn.contains(x,y))) changed=true;
    if(changed) animateButtons(draw,[pauseBtn,restartBtn,backBtn]);
    if(paused) return;
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
    
    // Determine type: 70% Fish, 20% Turtle, 10% Puffer
    const rand=Math.random();
    let type='fish';
    if(rand>0.9) type='puffer';
    else if(rand>0.7) type='turtle';
    
    let s, r;
    if(type==='fish'){
       s=120+Math.random()*100; // Fast
       r=15+Math.random()*25; // Varied sizes
    } else if(type==='turtle'){
       s=60+Math.random()*40; // Slow
       r=35;
    } else { // puffer
       s=100+Math.random()*50;
       r=25;
    }

    arr.push({x,y,dir,speed:s,radius:r,caught:false,type:type});
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
  // Always loop to handle UI interactions even when game is over
  loopId=requestAnimationFrame(loop);
}

function update(dt){
  if(paused) return;
  if(!playing) return; // Stop updates if game is over
  
  // If time is up, stop updating game logic (fish, hook)
  if(timeLeft<=0){
     timeLeft=0;
     playing=false; 
     // bgm.pause(); // Keep music playing

     // Save score
     try {
       const scores = JSON.parse(localStorage.getItem('fisherman_scores') || '{"easy":[],"medium":[],"hard":[]}');
       scores.hard.push({score: score, date: new Date().toLocaleString()});
       scores.hard.sort((a,b)=>b.score-a.score);
       scores.hard = scores.hard.slice(0, 5); // Keep top 5
       localStorage.setItem('fisherman_scores', JSON.stringify(scores));
     } catch(e) { console.error("Score save failed", e); }

     return;
  }
  
  timeLeft=Math.max(0,timeLeft-dt);
  waveT+=dt;
  
  for(const f of fishes){
    if(f.caught) continue;
    f.x+=f.dir*f.speed*dt;
    if(f.dir<0 && f.x<-60){ f.x=W+60; }
    if(f.dir>0 && f.x>W+60){ f.x=-60; }
  }
  if(hook.drop){
    hook.length+=480*dt;
    if(hook.length>H-120){ 
        hook.drop=false; 
        hook.length=0; 
        wrongSound.currentTime = 0;
        wrongSound.play().catch(e=>{});
    }
    const hx=hook.x;
    const hy=hook.y+hook.length;
    for(const f of fishes){
      if(f.caught) continue;
      const dx=hx-f.x;
      const dy=hy-f.y;
      if(dx*dx+dy*dy<(f.radius+8)*(f.radius+8)){
        // Play sound based on type
        if(f.type==='fish'){
            correctSound.currentTime = 0;
            correctSound.play().catch(e=>{});
        } else {
            wrongSound.currentTime = 0;
            wrongSound.play().catch(e=>{});
        }

        // Calculate score based on caught type
        if(f.type==='fish'){
            score+=30;
        } else if(f.type==='turtle'){
            score-=20; // Deduct
        } else if(f.type==='puffer'){
            score-=50; // Deduct more
        }

        // Respawn with new type logic
        f.y=H*0.35+Math.random()*H*0.55;
        f.dir=Math.random()<0.5?-1:1;
        f.x=f.dir<0?W+60:-60;
        
        // Determine type: 70% Fish, 20% Turtle, 10% Puffer
        const rand=Math.random();
        let type='fish';
        if(rand>0.9) type='puffer';
        else if(rand>0.7) type='turtle';
        
        let s, r;
        if(type==='fish'){
           s=120+Math.random()*100; // Fast
           r=15+Math.random()*25; // Varied sizes
        } else if(type==='turtle'){
           s=60+Math.random()*40; // Slow
           r=35;
        } else { // puffer
           s=100+Math.random()*50;
           r=25;
        }
        f.type = type;
        f.speed = s;
        f.radius = r;
        f.caught = false;

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
  
  // Dynamic Sea - Better Gradient
  let seaG = ctx.createLinearGradient(0, H*0.3, 0, H);
  seaG.addColorStop(0, '#29B6F6'); // Light Blue surface
  seaG.addColorStop(0.4, '#039BE5'); // Mid Blue
  seaG.addColorStop(1, '#01579B'); // Deep Dark Blue
  ctx.fillStyle = seaG;
  ctx.fillRect(0, H*0.3, W, H*0.7);

  // Realistic Waves (Multi-layered)
  // Layer 1: Back (Darker, Slower)
  drawWaveLayer(ctx, W, H, waveT * 0.5, 20, 'rgba(1, 87, 155, 0.3)', 15);
  // Layer 2: Mid (Medium)
  drawWaveLayer(ctx, W, H, waveT * 0.8, 10, 'rgba(3, 169, 244, 0.2)', 10);
  // Layer 3: Front (Lighter, Faster)
  drawWaveLayer(ctx, W, H, waveT * 1.2, 0, 'rgba(179, 229, 252, 0.2)', 5);

  // Sea Floor Decorations (Coral & Rocks)
  // Static decorations, but we redraw them every frame. 
  drawEnvironment(ctx, W, H, waveT);

  for(const f of fishes){
    if(f.caught) continue;
    ctx.save();
    ctx.translate(f.x,f.y);
    if(f.dir<0) ctx.scale(-1,1); // Flip if moving left

    if(f.type==='fish'){
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
    } else if(f.type==='turtle'){
        // Draw Turtle
        ctx.fillStyle='#43A047'; // Green shell
        ctx.beginPath();
        ctx.ellipse(0,0,f.radius,f.radius*0.7,0,0,Math.PI*2);
        ctx.fill();
        // Head
        ctx.fillStyle='#66BB6A';
        ctx.beginPath();
        ctx.arc(f.radius,0,f.radius*0.4,0,Math.PI*2);
        ctx.fill();
        // Legs
        ctx.fillStyle='#388E3C';
        ctx.beginPath(); ctx.arc(-f.radius*0.5,-f.radius*0.6,8,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(f.radius*0.5,-f.radius*0.6,8,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(-f.radius*0.5,f.radius*0.6,8,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(f.radius*0.5,f.radius*0.6,8,0,Math.PI*2); ctx.fill();
    } else if(f.type==='puffer'){
        // Draw Pufferfish
        ctx.fillStyle='#AB47BC'; // Purple
        ctx.beginPath();
        ctx.arc(0,0,f.radius,0,Math.PI*2);
        ctx.fill();
        // Spikes
        ctx.strokeStyle='#7B1FA2';
        ctx.lineWidth=2;
        for(let i=0;i<8;i++){
            const a=i*(Math.PI*2)/8;
            const sx=Math.cos(a)*f.radius;
            const sy=Math.sin(a)*f.radius;
            const ex=Math.cos(a)*(f.radius+8);
            const ey=Math.sin(a)*(f.radius+8);
            ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke();
        }
    }
    
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
  ctx.fillText('高级模式 - 得分: '+score,20,40);
  ctx.textAlign='right';
  ctx.fillText('剩余时间: '+Math.ceil(timeLeft),W-20,40);
  ctx.textAlign='center';
  
  if(timeLeft<=0){
      ctx.save();
      ctx.fillStyle='rgba(0,0,0,0.5)';
      ctx.fillRect(0, H/2 - 40, W, 80);
      ctx.fillStyle='#fff';
      ctx.font='bold 48px Microsoft YaHei';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillText('游戏结束', W/2, H/2);
      ctx.restore();
  }

  if(pauseBtn) pauseBtn.draw();
  if(restartBtn) restartBtn.draw();
  if(backBtn) backBtn.draw();
}

function endGame(){
  playing=false;
  // Don't stop the loop completely, just stop game logic updates
  // We need the loop to keep drawing buttons and handling hover effects
  // But we stop fish movement and hook logic
  
  // Draw semi-transparent overlay to indicate game over
  // but keep top buttons visible/clickable
  // We can just draw "Game Over" text
}

function drawWaveLayer(ctx, W, H, t, yOffset, color, amp) {
    ctx.fillStyle = color;
    ctx.beginPath();
    let startY = H * 0.3 + yOffset;
    ctx.moveTo(0, startY);
    for(let x=0; x<=W; x+=10){
        let y = startY + Math.sin(x*0.01 + t) * amp;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
}

function drawEnvironment(ctx, W, H, t) {
    // 1. Draw Corals (Static positions based on W)
    // Coral 1: Pink Brain Coral
    drawCoral(ctx, W*0.1, H, 60, '#F06292', 'brain');
    // Coral 2: Orange Branch Coral
    drawCoral(ctx, W*0.25, H, 80, '#FF8A65', 'branch');
    // Coral 3: Purple Tube Coral
    drawCoral(ctx, W*0.7, H, 50, '#BA68C8', 'tube');
    // Coral 4: Big Red Coral
    drawCoral(ctx, W*0.85, H, 90, '#E57373', 'branch');

    // 2. Draw Realistic Seaweed
    // Use semi-random positions but deterministic based on index
    for(let k=0; k<15; k++){
        let swX = (W/16) * (k+1) + Math.sin(k)*30; 
        let swH = 100 + Math.sin(k*132)*30; 
        drawRealisticSeaweed(ctx, swX, H, swH, t, k);
    }
}

function drawCoral(ctx, x, y, size, color, type) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    
    if (type === 'brain') {
        // Semi-circle bump
        ctx.beginPath();
        ctx.arc(0, 0, size/2, Math.PI, 0);
        ctx.fill();
        // Texture
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 2;
        for(let i=0; i<5; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, (size/2)*(i/5), Math.PI, 0);
            ctx.stroke();
        }
    } else if (type === 'branch') {
        // Tree structure
        ctx.lineWidth = size/10;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(0, -size/2, -size/3, -size);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, -size/3);
        ctx.quadraticCurveTo(size/4, -size/2, size/3, -size*0.8);
        ctx.stroke();
    } else if (type === 'tube') {
        // Tubes
        for(let i=-2; i<=2; i++) {
            let stableRandom = Math.abs(Math.sin(i*123)); 
            let h = size * (0.6 + stableRandom*0.6);
            
            ctx.beginPath();
            ctx.roundRect(i*size/4 - size/8, -h, size/4, h, size/8);
            ctx.fill();
            // Hole at top
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(i*size/4, -h, size/8, size/16, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = color; // Restore
        }
    }
    
    ctx.restore();
}

function drawRealisticSeaweed(ctx, x, y, h, t, offset) {
    ctx.save();
    ctx.translate(x, y);
    
    // Draw leaf-like shape instead of line
    ctx.fillStyle = '#4CAF50'; // Green
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(5, 0);
    
    const segs = 10;
    const segH = h / segs;
    
    let points = [];
    for (let i = 1; i <= segs; i++) {
        // Complex sway: Main wave + secondary ripple
        let sway = Math.sin(t*1.5 + offset + i * 0.3) * (i * 2);
        // Add some noise
        sway += Math.sin(t*3 + i) * (i * 0.5);
        points.push({x: sway, y: -i * segH});
    }
    
    // Right side of blade
    for(let p of points) {
        ctx.lineTo(p.x + 5 * (1 - points.indexOf(p)/segs), p.y);
    }
    // Tip
    ctx.lineTo(points[points.length-1].x, points[points.length-1].y - 5);
    // Left side of blade
    for(let i=points.length-1; i>=0; i--) {
        let p = points[i];
        ctx.lineTo(p.x - 5 * (1 - i/segs), p.y);
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Vein (lighter line)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for(let p of points) ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = '#81C784';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
}

window.startHardGame=function(){ startGame(); };
})();
