window.initFishermanStartScreen=function(){
  // Re-fetch canvas context in case it changed or for safety
  let canvas=document.getElementById('myCanvas');
  let ctx=canvas.getContext('2d');
  let W=canvas.width;
  let H=canvas.height;
  let mainAnimId=null;
  let waveT=0;
  
  startScreen();

  function startScreen(){
    waveT=0;
    const col=getButtonColors('primary');
    const bw=200,bh=70;
    
    // Create 3 buttons with distinct difficulty colors
    // Easy: Green
    const easyBtn=new CanvasButton(ctx,W/2-bw*1.5-20,H*0.62,bw,bh,'初级','#81C784','#2E7D32');
    // Medium: Blue
    const mediumBtn=new CanvasButton(ctx,W/2-bw/2,H*0.62,bw,bh,'中级','#64B5F6','#1565C0');
    // Hard: Red
    const hardBtn=new CanvasButton(ctx,W/2+bw/2+20,H*0.62,bw,bh,'高级','#E57373','#C62828');
    
    // Back button (Top Left) - Soft Grey/Blue
    const backBtn = new CanvasButton(ctx, 20, 20, 80, 40, '返回', '#90A4AE', '#546E7A');

    // Rank button (Top Right) - Purple
    const rankBtn = new CanvasButton(ctx, W-120, 20, 100, 40, '排行榜', '#BA68C8', '#7B1FA2');
    
    // Music button (Speaker icon)
    // We'll treat it as a button but draw custom icon
    const musicBtn = new CanvasButton(ctx, W-180, 20, 50, 40, '', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)');
    
    // Tutorial button (New)
    const tutorialBtn = new CanvasButton(ctx, W-360, 20, 80, 40, '教程', '#FFCA28', '#FFA000');
    
    // Load main menu BGM
    const menuBgm = new Audio('../../audio/bgm.ogg');
    menuBgm.loop = true;
    let musicOn = localStorage.getItem('fisherman_bgm') !== 'false'; // Default true
    if(musicOn) {
        menuBgm.play().catch(e=>{});
    }

    const buttons = [easyBtn, mediumBtn, hardBtn, backBtn, rankBtn, musicBtn, tutorialBtn];

    let showRank = false;
    
    // Initialize from localStorage to persist state across reloads
    let isNightMode = false;
    try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            isNightMode = savedTheme === 'night';
            // Sync global variable if it was reset by page reload
            if (typeof currentTheme !== 'undefined') currentTheme = savedTheme;
        } else {
             // Fallback to existing global if no storage
             isNightMode = (typeof currentTheme !== 'undefined') ? currentTheme === 'night' : false;
        }
    } catch(e) {
        isNightMode = (typeof currentTheme !== 'undefined') ? currentTheme === 'night' : false;
    }

    const toggleBtn = { x: W-260, y: 25, w: 60, h: 30 };

    function drawToggle(ctx, x, y, w, h, on) {
        ctx.save();
        ctx.translate(x, y);
        
        // Background
        ctx.beginPath();
        if(ctx.roundRect) ctx.roundRect(0, 0, w, h, h/2);
        else ctx.rect(0,0,w,h);
        
        ctx.fillStyle = on ? '#424242' : '#E0E0E0';
        ctx.fill();
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Icon/Text hint
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = on ? '#FFF' : '#F57F17';
        ctx.fillText(on ? '🌙' : '☀️', on ? w*0.25 : w*0.75, h/2+1);

        // Knob
        const r = h/2 - 2;
        const kx = on ? w - r - 2 : r + 2;
        ctx.beginPath();
        ctx.arc(kx, h/2, r, 0, Math.PI*2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 2;
        ctx.stroke();

        ctx.restore();
    }

    function drawMoon(ctx, cx, cy, r) {
        ctx.save();
        ctx.translate(cx, cy);
        
        // Glow
        const glow = ctx.createRadialGradient(0, 0, r, 0, 0, r * 2);
        glow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, r * 2, 0, Math.PI * 2);
        ctx.fill();

        // Moon Body
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = '#F5F3CE';
        ctx.fill();

        // Craters
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.arc(-r*0.3, -r*0.2, r*0.2, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r*0.4, r*0.3, r*0.15, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-r*0.1, r*0.5, r*0.1, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
    }


    function drawSpeaker(ctx, x, y, size, on) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#333';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // Speaker body
        ctx.beginPath();
        ctx.moveTo(0, size*0.3);
        ctx.lineTo(size*0.3, size*0.3);
        ctx.lineTo(size*0.6, 0);
        ctx.lineTo(size*0.6, size);
        ctx.lineTo(size*0.3, size*0.7);
        ctx.lineTo(0, size*0.7);
        ctx.closePath();
        ctx.fill();

        // Sound waves
        if(on) {
            ctx.beginPath();
            ctx.arc(size*0.6, size*0.5, size*0.3, -0.5, 0.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(size*0.6, size*0.5, size*0.5, -0.6, 0.6);
            ctx.stroke();
        } else {
            // X mark
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(size*0.7, size*0.3);
            ctx.lineTo(size*0.9, size*0.7);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(size*0.9, size*0.3);
            ctx.lineTo(size*0.7, size*0.7);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawRankBoard(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, W, H);
        
        // Board
        const bw=600, bh=500;
        const bx=(W-bw)/2, by=(H-bh)/2;
        
        ctx.fillStyle = '#fff';
        roundRect(ctx, bx, by, bw, bh, 20, true, false);
        
        // Title
        ctx.fillStyle = '#333';
        ctx.font = 'bold 32px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('排行榜', W/2, by+50);
        
        // Close hint
        ctx.font = '16px Microsoft YaHei';
        ctx.fillStyle = '#666';
        ctx.fillText('点击任意处关闭', W/2, by+bh-20);

        // Fetch scores
        let scores;
        try {
            scores = JSON.parse(localStorage.getItem('fisherman_scores') || '{"easy":[],"medium":[],"hard":[]}');
        } catch(e) { scores = {easy:[], medium:[], hard:[]}; }

        // Columns
        const cols = [
            {title: '初级', data: scores.easy, x: bx+100},
            {title: '中级', data: scores.medium, x: bx+300},
            {title: '高级', data: scores.hard, x: bx+500}
        ];

        ctx.textAlign = 'center';
        cols.forEach(col => {
            ctx.font = 'bold 24px Microsoft YaHei';
            ctx.fillStyle = '#2196F3';
            ctx.fillText(col.title, col.x, by+100);
            
            ctx.font = '18px Microsoft YaHei';
            ctx.fillStyle = '#333';
            col.data.forEach((item, idx) => {
                ctx.fillText(`${idx+1}. ${item.score}分`, col.x, by+140+idx*30);
            });
            if(col.data.length === 0) {
                ctx.fillStyle = '#999';
                ctx.fillText('暂无记录', col.x, by+140);
            }
        });

        ctx.restore();
    }

    function drawSun(ctx, cx, cy, r, angle) {
        ctx.save();
        ctx.translate(cx, cy);
        
        // Outer glow
        const glow = ctx.createRadialGradient(0, 0, r, 0, 0, r * 1.5);
        glow.addColorStop(0, 'rgba(255, 213, 79, 0.5)');
        glow.addColorStop(1, 'rgba(255, 213, 79, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Rays Layer 1 (rotating)
        ctx.save();
        ctx.rotate(angle);
        ctx.fillStyle = 'rgba(255, 179, 0, 0.8)';
        for(let i=0; i<12; i++) {
            ctx.rotate(Math.PI * 2 / 12);
            ctx.beginPath();
            ctx.moveTo(0, -r * 0.85);
            ctx.lineTo(6, -(r * 1.5));
            ctx.lineTo(-6, -(r * 1.5));
            ctx.fill();
        }
        ctx.restore();

        // Rays Layer 2 (rotating opposite, smaller)
        ctx.save();
        ctx.rotate(-angle * 0.5);
        ctx.fillStyle = 'rgba(255, 213, 79, 0.6)';
        for(let i=0; i<12; i++) {
            ctx.rotate(Math.PI * 2 / 12);
            ctx.beginPath();
            ctx.moveTo(0, -r * 0.85);
            ctx.lineTo(4, -(r * 1.3));
            ctx.lineTo(-4, -(r * 1.3));
            ctx.fill();
        }
        ctx.restore();

        // Sun Body (Gradient)
        const bodyGrad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
        bodyGrad.addColorStop(0, '#FFFDE7'); // White-ish center
        bodyGrad.addColorStop(0.4, '#FFD54F'); // Yellow
        bodyGrad.addColorStop(1, '#FF8F00'); // Orange edge
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function redraw(){
      ctx.clearRect(0,0,W,H);
      
      // Sky
      const sky=ctx.createLinearGradient(0,0,0,H*0.4);
      if(isNightMode) {
          sky.addColorStop(0,'#0D47A1');
          sky.addColorStop(1,'#4527A0');
      } else {
          sky.addColorStop(0,'#b3e5fc');
          sky.addColorStop(1,'#81d4fa');
      }
      ctx.fillStyle=sky;
      ctx.fillRect(0,0,W,H*0.4);
      
      // Sun/Moon & Stars
      if(isNightMode) {
          // Stars
          ctx.fillStyle = '#FFF';
          for(let i=0; i<40; i++) {
             let sx = (Math.abs(Math.sin(i*132.5)) * W) % W;
             let sy = (Math.abs(Math.cos(i*44.3)) * H*0.4) % (H*0.4);
             let sz = (i%3)+1;
             ctx.globalAlpha = 0.5 + 0.5*Math.sin(waveT + i);
             ctx.fillRect(sx, sy, sz, sz);
          }
          ctx.globalAlpha = 1.0;
          drawMoon(ctx, W*0.15, H*0.12, 35);
      } else {
          drawSun(ctx, W*0.15, H*0.12, 40, waveT * 0.5);
      }

      // Clouds
      ctx.fillStyle = isNightMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)';
      for(let i=0;i<3;i++){
        const cx=W*(0.35+0.2*i), cy=H*(0.12+0.03*i);
        ctx.beginPath();
        ctx.ellipse(cx,cy,70,28,0,0,Math.PI*2);
        ctx.fill();
      }
      
      // Sea
      const sea=ctx.createLinearGradient(0,H*0.35,0,H);
      if(isNightMode) {
          sea.addColorStop(0,'#1565C0');
          sea.addColorStop(1,'#002171');
      } else {
          sea.addColorStop(0,'#4fc3f7');
          sea.addColorStop(1,'#0288d1');
      }
      ctx.fillStyle=sea;
      ctx.fillRect(0,H*0.35,W,H*0.65);
      
      // Waves
      ctx.strokeStyle = isNightMode ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.75)';
      ctx.lineWidth=2;
      for(let j=0;j<6;j++){
        const y=H*0.40+j*24;
        ctx.beginPath();
        for(let x=0;x<=W;x+=12){
          const k=0.8+0.1*j;
          const a=6+j*0.5;
          const sy=y+Math.sin((x*0.02)+(waveT*k))*a;
          if(x===0) ctx.moveTo(x,sy); else ctx.lineTo(x,sy);
        }
        ctx.stroke();
      }
      
      // Title & Text
      if(typeof getTextColor === 'function') {
          ctx.fillStyle=getTextColor('title');
      } else {
          ctx.fillStyle = isNightMode ? '#E0E0E0' : '#333';
      }
      ctx.font='bold 44px Microsoft YaHei';
      ctx.textAlign='center';
      ctx.fillText('手眼协调训练：钓鱼',W/2,H*0.22);
      

      
      // Draw all buttons
      easyBtn.draw();
      mediumBtn.draw();
      hardBtn.draw();
      backBtn.draw();
      rankBtn.draw();
      tutorialBtn.draw();
      
      // Draw speaker icon on music button
      drawSpeaker(ctx, musicBtn.x+10, musicBtn.y+5, 30, musicOn);
      
      // Draw Toggle
      drawToggle(ctx, toggleBtn.x, toggleBtn.y, toggleBtn.w, toggleBtn.h, isNightMode);

      if(showRank) drawRankBoard(ctx);
    }
    
    canvas.onclick=function(e){
      const {x,y}=windowToCanvas(canvas,e.clientX,e.clientY);
      
      if(showRank) {
          showRank = false;
          return;
      }

      // Toggle Night Mode
      if(x >= toggleBtn.x && x <= toggleBtn.x + toggleBtn.w &&
         y >= toggleBtn.y && y <= toggleBtn.y + toggleBtn.h) {
          isNightMode = !isNightMode;
          if(typeof setTheme === 'function') {
              setTheme(isNightMode ? 'night' : 'day');
          }
          redraw(); // Redraw immediately
          return;
      }

      let selected = null;
      if(easyBtn.isClicked(x,y)) selected = 'easy';
      else if(mediumBtn.isClicked(x,y)) selected = 'medium';
      else if(hardBtn.isClicked(x,y)) selected = 'hard';
      else if(backBtn.isClicked(x,y)) selected = 'back';
      else if(rankBtn.isClicked(x,y)) selected = 'rank';
      else if(musicBtn.isClicked(x,y)) selected = 'music';
      else if(tutorialBtn.isClicked(x,y)) selected = 'tutorial';
      
      if(selected){
        if(selected === 'tutorial') {
            if(window.FishermanTutorial) window.FishermanTutorial.show();
            return;
        }
        if(selected === 'rank') {
            showRank = true;
            return;
        }
        if(selected === 'music') {
            musicOn = !musicOn;
            localStorage.setItem('fisherman_bgm', musicOn);
            if(musicOn) menuBgm.play().catch(e=>{});
            else menuBgm.pause();
            return;
        }

        if(mainAnimId){ cancelAnimationFrame(mainAnimId); mainAnimId=null; }
        canvas.onclick=null; canvas.onmousemove=null;
        
        // Stop menu music before starting game
        menuBgm.pause();
        
        if(selected === 'easy' && window.startEasyGame) window.startEasyGame();
        else if(selected === 'medium' && window.startMediumGame) window.startMediumGame();
        else if(selected === 'hard' && window.startHardGame) window.startHardGame();
        else if(selected === 'back') {
            location.href = '../../index.html';
        }
      }
    };
    
    canvas.onmousemove=function(e){
      if(showRank) return;
      const {x,y}=windowToCanvas(canvas,e.clientX,e.clientY);
      let changed = false;
      for(let b of buttons){
         if(b.setHovered(b.contains(x,y))) changed=true;
      }
      if(changed){ animateButtons(redraw, buttons); }
    };
    
    function tick(){
      waveT+=0.04;
      redraw();
      mainAnimId=requestAnimationFrame(tick);
    }
    tick();
  }
};

// Initialize immediately
window.initFishermanStartScreen();
