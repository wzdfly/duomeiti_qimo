let gamesBg = null;

function onImageLoad(){                                // 背景图加载完成：进入主页面
    ctx.clearRect(0,0,W,H);                            // 清空画布
    ctx.drawImage(image,0,0,W,H);                      // 绘制背景图
    showGamesPage();                                   // 显示游戏选择主页面
    bgMusic.play().catch(()=>{                         // 尝试播放背景音乐
        console.log("等待用户交互后播放音乐");         // 浏览器限制提示
    });                                                // 捕获失败
}
function ensureGamesBg(){
    if(!gamesBg){
        gamesBg = new Image();
        gamesBg.src = "src/bg_newyear.png";
        gamesBg.onload = function(){ showGamesPage(); };
    }
}

function showGamesPage(){
    ensureGamesBg();
    const gameBtnColors = getButtonColors('primary');
    const schulteText = '舒尔特方格';
    const btnW = 240, btnH = 70;
    const btnY = H/2 - 30;
    gameSelectButton = new CanvasButton(ctx, W/2 - btnW/2, btnY, btnW, btnH, schulteText, gameBtnColors[0], gameBtnColors[1]);
    bindGamesEvents();
    stopGamesAnimation();
    gamesRockets = []; gamesParticles = [];
    gamesAnimationId = requestAnimationFrame(animateGamesIntro);
}

let gameSelectButton = null;
let gamesAnimationId = null;

function bindGamesEvents(){
    canvas.onclick = function(e){
        const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
        if(gameSelectButton && gameSelectButton.isClicked(x,y)){
            stopGamesAnimation();
            drawStartScreen();
            return;
        }
    };
    canvas.onmousemove = function(e){
        const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
    if(gameSelectButton) gameSelectButton.setHovered(gameSelectButton.contains(x,y));
    };
}

function stopGamesAnimation(){
    if(gamesAnimationId){ cancelAnimationFrame(gamesAnimationId); gamesAnimationId=null; }
}

function animateGamesIntro(ts){
    ctx.clearRect(0,0,W,H);
    if(gamesBg && gamesBg.complete) ctx.drawImage(gamesBg,0,0,W,H);
    else ctx.drawImage(image,0,0,W,H);
    fireworksTick(ctx, ts, W, H);
    ctx.fillStyle = getTextColor('title'); ctx.font = 'bold 48px Microsoft YaHei';
    ctx.textAlign = 'center'; ctx.fillText('选择游戏', W/2, 80);
    ctx.font = 'bold 30px Microsoft YaHei'; ctx.fillStyle = getTextColor('text');
    ctx.fillText('请选择要开始的游戏', W/2, 130);
    if(gameSelectButton){ gameSelectButton.ctx=ctx; gameSelectButton.draw(); }
    gamesAnimationId = requestAnimationFrame(animateGamesIntro);
}
