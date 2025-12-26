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
// Hook state machine: swing -> drop -> retrieve -> (score) -> swing
let hook={
    x:W/2, 
    y:80, 
    angle:0, 
    length:30, 
    state:'swing', 
    speed: 0,
    caughtFish: null
};
let paused=false;
let pauseBtn=null;
let restartBtn=null;
let backBtn=null;
let waveT=0;

// Config for Easy Mode
const SWING_SPEED = 0.03;
const DROP_SPEED = 300;
const RETRIEVE_SPEED = 400;

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
  fishes=createFishes(6); // Reduced count
  paused=false;
  
  // Reset Hook
  hook = {
      x: W/2,
      y: 80,
      angle: 0,
      length: 30,
      state: 'swing',
      speed: 0,
      caughtFish: null
  };

  // Age-friendly: Larger buttons and text
  const bw=120,bh=50; 
  const startX = W/2 - (bw*3 + 20)/2 + 100; // Recalculate center
  // Style: gradient buttons with larger font - Modern Soft Colors
  // Pause: Warm Orange (Coral)
  pauseBtn=new CanvasButton(ctx,startX,10,bw,bh,'暂停','#FF8A65','#D84315', 36);
  // Restart: Fresh Teal/Green
  restartBtn=new CanvasButton(ctx,startX+bw+10,10,bw,bh,'重来','#4DB6AC','#00695C', 36);
  // Back: Cool Blue/Indigo
  backBtn=new CanvasButton(ctx,startX+(bw+10)*2,10,bw,bh,'返回','#7986CB','#283593', 36);
  canvas.onclick=function(e){
    const {x,y}=windowToCanvas(canvas,e.clientX,e.clientY);
    
    // Prevent event bubbling or multiple triggers if user clicks too fast
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
      bgm.pause(); // Stop current BGM before restart
      if(loopId){ cancelAnimationFrame(loopId); loopId=null; }
      startGame();
      return;
    }
    if(backBtn && backBtn.isClicked(x,y)){
      playing=false;
      bgm.pause();
      bgm.currentTime = 0;
      if(loopId){ cancelAnimationFrame(loopId); loopId=null; }
      
      // Clean up events before leaving
      canvas.onclick=null; 
      canvas.onmousemove=null;
      
      location.reload();
      return;
    }
    if(paused) return;
    
    // Game logic: drop hook
    if(timeLeft > 0 && hook.state === 'swing'){
        hook.state = 'drop';
    }
  };
  canvas.onmousemove=function(e){
    const {x,y}=windowToCanvas(canvas,e.clientX,e.clientY);
    let changed=false;
    if(pauseBtn && pauseBtn.setHovered(pauseBtn.contains(x,y))) changed=true;
    if(restartBtn && restartBtn.setHovered(restartBtn.contains(x,y))) changed=true;
    if(backBtn && backBtn.setHovered(backBtn.contains(x,y))) changed=true;
    if(changed) animateButtons(draw,[pauseBtn,restartBtn,backBtn]);
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
    // Age-friendly: Slower speed (60-100), Larger radius (45-60)
    const s=60+Math.random()*40;
    const r=45+Math.random()*15;
    arr.push({x,y,dir,speed:s,radius:r,caught:false,type:'fish'});
  }
  return arr;
}

let lastTime=0;
let timeAccumulator = 0;

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
     
     // Save score
     try {
       const scores = JSON.parse(localStorage.getItem('fisherman_scores') || '{"easy":[],"medium":[],"hard":[]}');
       scores.easy.push({score: score, date: new Date().toLocaleString()});
       scores.easy.sort((a,b)=>b.score-a.score);
       scores.easy = scores.easy.slice(0, 5); // Keep top 5
       localStorage.setItem('fisherman_scores', JSON.stringify(scores));
     } catch(e) { console.error("Score save failed", e); }

     return;
  }
  
  timeLeft=Math.max(0,timeLeft-dt);
  waveT+=dt;
  timeAccumulator+=dt;

  // Update Fishes
  for(const f of fishes){
    if(f.caught) continue;
    f.x+=f.dir*f.speed*dt;
    if(f.dir<0 && f.x<-60){ f.x=W+60; }
    if(f.dir>0 && f.x>W+60){ f.x=-60; }
  }

  // Hook State Machine
  switch(hook.state) {
      case 'swing':
          // Automatic swinging
          hook.angle = Math.sin(timeAccumulator * 2) * 1.2; // +/- 1.2 radians
          hook.length = 30;
          break;
          
      case 'drop':
          hook.length += DROP_SPEED * dt;
          
          // Calculate current hook position
          let hx = hook.x + Math.sin(hook.angle) * hook.length;
          let hy = hook.y + Math.cos(hook.angle) * hook.length;
          
          // Check bounds
          if(hook.length > H || hx < 0 || hx > W || hy > H) {
              hook.state = 'retrieve';
              // Play miss sound if needed
          }
          
          // Check collisions
          for(const f of fishes){
            if(f.caught) continue;
            const dx = hx - f.x;
            const dy = hy - f.y;
            if(dx*dx + dy*dy < (f.radius+10)*(f.radius+10)){
                // Caught!
                hook.state = 'retrieve';
                hook.caughtFish = f;
                f.caught = true;
                
                correctSound.currentTime = 0;
                correctSound.play().catch(e=>{});
                break;
            }
          }
          break;
          
      case 'retrieve':
          hook.length -= RETRIEVE_SPEED * dt;
          if(hook.caughtFish) {
              // Sync fish position to hook
              hook.caughtFish.x = hook.x + Math.sin(hook.angle) * hook.length;
              hook.caughtFish.y = hook.y + Math.cos(hook.angle) * hook.length;
          }
          
          if(hook.length <= 30) {
              hook.length = 30;
              if(hook.caughtFish) {
                  score += 10;
                  // Respawn fish
                  let f = hook.caughtFish;
                  f.caught = false;
                  f.y=H*0.35+Math.random()*H*0.55;
                  f.dir=Math.random()<0.5?-1:1;
                  f.x=f.dir<0?W+60:-60;
                  f.speed=60+Math.random()*40; 
                  f.radius=45+Math.random()*15;
                  
                  hook.caughtFish = null;
              }
              hook.state = 'swing';
          }
          break;
  }
}

function draw(){
  ctx.clearRect(0,0,W,H);
  drawScene();
  drawHUD();
}

function drawScene(){
  let isNightMode = false;
  try {
      isNightMode = localStorage.getItem('theme') === 'night';
  } catch(e) {}

  let g=ctx.createLinearGradient(0,0,0,H);
  if(isNightMode) {
      g.addColorStop(0, '#0a192f');
      g.addColorStop(0.5, '#112240');
      g.addColorStop(1, '#233554');
  } else {
      g.addColorStop(0,'#cbe7ff');
      g.addColorStop(0.3,'#9bd4ff');
      g.addColorStop(0.6,'#66c3ff');
      g.addColorStop(1,'#3aa9f0');
  }
  ctx.fillStyle=g;
  ctx.fillRect(0,0,W,H);

  if(isNightMode) {
      // Moon
      ctx.save();
      ctx.fillStyle = '#FFEB3B';
      ctx.shadowColor = '#FFF59D';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(W - 60, 60, 25, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
  } else {
      ctx.fillStyle='rgba(255,255,255,0.7)';
      ctx.fillRect(0,0,W,H*0.25);
  }

  // Draw Boat/Base
  ctx.fillStyle='#795548';
  ctx.fillRect(W/2-4,0,8,80); // Pole
  
  // Dynamic Sea - Better Gradient
  let seaG = ctx.createLinearGradient(0, H*0.3, 0, H);
  if(isNightMode) {
      seaG.addColorStop(0, '#1A237E');
      seaG.addColorStop(0.5, '#283593');
      seaG.addColorStop(1, '#303F9F');
  } else {
      seaG.addColorStop(0, '#29B6F6'); // Light Blue surface
      seaG.addColorStop(0.4, '#039BE5'); // Mid Blue
      seaG.addColorStop(1, '#01579B'); // Deep Dark Blue
  }
  ctx.fillStyle = seaG;
  ctx.fillRect(0, H*0.3, W, H*0.7);

  // Realistic Waves (Multi-layered)
  // Layer 1: Back (Darker, Slower)
  let w1 = isNightMode ? 'rgba(255,255,255,0.05)' : 'rgba(1, 87, 155, 0.3)';
  drawWaveLayer(ctx, W, H, waveT * 0.5, 20, w1, 15);
  // Layer 2: Mid (Medium)
  let w2 = isNightMode ? 'rgba(255,255,255,0.08)' : 'rgba(3, 169, 244, 0.2)';
  drawWaveLayer(ctx, W, H, waveT * 0.8, 10, w2, 10);
  // Layer 3: Front (Lighter, Faster)
  let w3 = isNightMode ? 'rgba(255,255,255,0.1)' : 'rgba(179, 229, 252, 0.2)';
  drawWaveLayer(ctx, W, H, waveT * 1.2, 0, w3, 5);

  // Sea Floor Decorations
  drawEnvironment(ctx, W, H, waveT);

  // Fishes
  for(const f of fishes){
    if(f.caught) continue; // Don't draw normally if caught (drawn with hook)
    drawFish(f);
  }

  // Draw Hook Line
  let hx = hook.x + Math.sin(hook.angle) * hook.length;
  let hy = hook.y + Math.cos(hook.angle) * hook.length;

  ctx.strokeStyle = isNightMode ? '#ECEFF1' : '#263238';
  ctx.lineWidth=4; 
  ctx.beginPath();
  ctx.moveTo(hook.x, hook.y);
  ctx.lineTo(hx, hy);
  ctx.stroke();

  // Draw Hook Head
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(-hook.angle); // Rotate hook to match line
  
  ctx.fillStyle = isNightMode ? '#ECEFF1' : '#263238';
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI*2);
  ctx.fill();

  // If caught fish, draw it here
  if(hook.caughtFish) {
      ctx.save();
      ctx.rotate(Math.PI/2); // Fish hangs vertically
      // Reset fish transform to draw relative to hook
      let f = hook.caughtFish;
      // Temporarily set pos to 0,0 for drawing
      let oldX = f.x, oldY = f.y;
      f.x = 0; f.y = 15; // Hang slightly below
      drawFish(f);
      f.x = oldX; f.y = oldY;
      ctx.restore();
  }
  ctx.restore();
}

function drawFish(f) {
    ctx.save();
    ctx.translate(f.x,f.y);
    if(f.dir<0 && !f.caught) ctx.scale(-1,1); // Flip if moving left
    
    // Body
    ctx.fillStyle='#ff7043';
    ctx.beginPath();
    ctx.ellipse(0,0,f.radius,f.radius*0.6,0,0,Math.PI*2);
    ctx.fill();
    
    // Tail
    ctx.fillStyle='#ef6c00';
    ctx.beginPath();
    ctx.moveTo(-f.radius,f.radius*0.1);
    ctx.lineTo(-f.radius-12,0);
    ctx.lineTo(-f.radius,f.radius*-0.1);
    ctx.closePath();
    ctx.fill();
    
    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(f.radius*0.6, -f.radius*0.1, 4, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
}

function drawHUD(){
  let isNightMode = false;
  try { isNightMode = localStorage.getItem('theme') === 'night'; } catch(e) {}
  ctx.fillStyle = isNightMode ? '#FFFFFF' : '#000';
  ctx.font='bold 36px Microsoft YaHei'; // Larger font
  ctx.textAlign='left';
  ctx.fillText('初级模式 - 得分: '+score,20,50);
  ctx.textAlign='right';
  ctx.fillText('剩余时间: '+Math.ceil(timeLeft),W-20,50);
  ctx.textAlign='center';
  
  if(timeLeft<=0){
      ctx.save();
      ctx.fillStyle='rgba(0,0,0,0.5)';
      ctx.fillRect(0, H/2 - 60, W, 120); // Larger background
      ctx.fillStyle='#fff';
      ctx.font='bold 64px Microsoft YaHei'; // Larger game over text
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
    for(let k=0; k<8; k++){
        let swX = (W/9) * (k+1) + Math.sin(k)*30; // Random-ish spacing
        let swH = 100 + Math.sin(k*132)*40; 
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
            let h = size * (0.8 + Math.random()*0.4); 
            // Simplified for stability:
            let stableRandom = Math.abs(Math.sin(i*123)); 
            h = size * (0.6 + stableRandom*0.6);
            
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

window.startEasyGame=function(){ startGame(); };
})();