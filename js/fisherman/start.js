(function initFishermanStartScreen(){
let canvas=document.getElementById('myCanvas');
let ctx=canvas.getContext('2d');
let W=canvas.width;
let H=canvas.height;
let startBtn=null;
let mainAnimId=null;
let waveT=0;

function startScreen(){
  waveT=0;
  const col=getButtonColors('primary');
  const bw=200,bh=70;
  
  // Create 3 buttons
  const easyBtn=new CanvasButton(ctx,W/2-bw*1.5-20,H*0.62,bw,bh,'初级',col[0],col[1]);
  const mediumBtn=new CanvasButton(ctx,W/2-bw/2,H*0.62,bw,bh,'中级',col[0],col[1]);
  const hardBtn=new CanvasButton(ctx,W/2+bw/2+20,H*0.62,bw,bh,'高级',col[0],col[1]);
  
  const buttons = [easyBtn, mediumBtn, hardBtn];

  function redraw(){
    ctx.clearRect(0,0,W,H);
    // ... background (same as before) ...
    const sky=ctx.createLinearGradient(0,0,0,H*0.4);
    sky.addColorStop(0,'#b3e5fc');
    sky.addColorStop(1,'#81d4fa');
    ctx.fillStyle=sky;
    ctx.fillRect(0,0,W,H*0.4);
    ctx.fillStyle='#FFD54F';
    ctx.beginPath();
    ctx.arc(W*0.15,H*0.12,40,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.85)';
    for(let i=0;i<3;i++){
      const cx=W*(0.35+0.2*i), cy=H*(0.12+0.03*i);
      ctx.beginPath();
      ctx.ellipse(cx,cy,70,28,0,0,Math.PI*2);
      ctx.fill();
    }
    const sea=ctx.createLinearGradient(0,H*0.35,0,H);
    sea.addColorStop(0,'#4fc3f7');
    sea.addColorStop(1,'#0288d1');
    ctx.fillStyle=sea;
    ctx.fillRect(0,H*0.35,W,H*0.65);
    ctx.strokeStyle='rgba(255,255,255,0.75)';
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
    ctx.fillStyle=getTextColor('title');
    ctx.font='bold 44px Microsoft YaHei';
    ctx.textAlign='center';
    ctx.fillText('手眼协调训练：钓鱼',W/2,H*0.22);
    ctx.font='24px Microsoft YaHei';
    ctx.fillStyle=getTextColor('text');
    ctx.fillText('移动鼠标控制鱼钩，点击放下鱼线',W/2,H*0.28);
    
    // Draw all buttons
    easyBtn.draw();
    mediumBtn.draw();
    hardBtn.draw();
  }
  
  canvas.onclick=function(e){
    const {x,y}=windowToCanvas(canvas,e.clientX,e.clientY);
    
    let selected = null;
    if(easyBtn.isClicked(x,y)) selected = 'easy';
    else if(mediumBtn.isClicked(x,y)) selected = 'medium';
    else if(hardBtn.isClicked(x,y)) selected = 'hard';
    
    if(selected){
      if(mainAnimId){ cancelAnimationFrame(mainAnimId); mainAnimId=null; }
      canvas.onclick=null; canvas.onmousemove=null;
      
      if(selected === 'easy' && window.startEasyGame) window.startEasyGame();
      else if(selected === 'medium' && window.startMediumGame) window.startMediumGame();
      else if(selected === 'hard' && window.startHardGame) window.startHardGame();
    }
  };
  
  canvas.onmousemove=function(e){
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

startScreen();
})();
