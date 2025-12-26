let gamesBg = null;

function onImageLoad(){                                // 背景图加载完成：进入主页面
    ctx.clearRect(0,0,W,H);                            // 清空画布
    ctx.drawImage(image,0,0,W,H);                      // 绘制背景图
    showGamesPage();                                   // 显示游戏选择主页面
    bgMusic.play().catch(()=>{                         // 尝试播放背景音乐
        console.log("等待用户交互后播放音乐");         // 浏览器限制提示
    });                                                // 捕获失败
}
let gamesBgTheme = '';
function ensureGamesBg(){
    const targetSrc = currentTheme === 'night' ? 'src/newyear_night.png' : 'src/bg_newyear.png';
    if(!gamesBg || gamesBgTheme !== currentTheme){
        gamesBg = new Image();
        gamesBgTheme = currentTheme;
        gamesBg.src = targetSrc;
        gamesBg.onload = function(){ /* 动画循环会自动绘制 */ };
    }
}

function showGamesPage(){
    ensureGamesBg();
    const gameBtnColors = getButtonColors('primary');
    const schulteText = '记忆力训练';
    const btnW = 240, btnH = 70;
    const btnY = H/2 - 60;
    gameSelectButton = new CanvasButton(ctx, W/2 - btnW/2, btnY, btnW, btnH, schulteText, gameBtnColors[0], gameBtnColors[1]);
    
    focusGameButton = new CanvasButton(ctx, W/2 - btnW/2, btnY + 90, btnW, btnH, "专注力训练", gameBtnColors[0], gameBtnColors[1]);
    handEyeButton = new CanvasButton(ctx, W/2 - btnW/2, btnY + 180, btnW, btnH, "手眼协调训练", gameBtnColors[0], gameBtnColors[1]);

    const settingsColors = getButtonColors('neutral');
    settingsButton = new CanvasButton(ctx, W-160, 40, 140, 50, "设置", settingsColors[0], settingsColors[1]);

    bindGamesEvents();
    stopGamesAnimation();
    gamesRockets = []; gamesParticles = [];
    gamesAnimationId = requestAnimationFrame(animateGamesIntro);
}

let gameSelectButton = null;
let focusGameButton = null;
let handEyeButton = null;
let gamesAnimationId = null;

function bindGamesEvents(){
    canvas.onclick = function(e){
        const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
        if(gameSelectButton && gameSelectButton.isClicked(x,y)){
            stopGamesAnimation();
            drawStartScreen();
            return;
        }
        if(focusGameButton && focusGameButton.isClicked(x,y)){
            stopGamesAnimation();
            if(window.showFocusStartScreen) window.showFocusStartScreen();
            return;
        }
        if(handEyeButton && handEyeButton.isClicked(x,y)){
            stopGamesAnimation();
            if(window.startFisherman){
                window.startFisherman();
            }else{
                location.href = 'js/fisherman/index.html';
            }
            return;
        }
        if(settingsButton && settingsButton.isClicked(x,y)){
            stopGamesAnimation();
            showSettingsPage();
            return;
        }
    };
    canvas.onmousemove = function(e){
        const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
        if(gameSelectButton) gameSelectButton.setHovered(gameSelectButton.contains(x,y));
        if(focusGameButton) focusGameButton.setHovered(focusGameButton.contains(x,y));
        if(handEyeButton) handEyeButton.setHovered(handEyeButton.contains(x,y));
        if(settingsButton) settingsButton.setHovered(settingsButton.contains(x,y));
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
    if(focusGameButton){ focusGameButton.ctx=ctx; focusGameButton.draw(); }
    if(handEyeButton){ handEyeButton.ctx=ctx; handEyeButton.draw(); }
    if(settingsButton){ settingsButton.ctx=ctx; settingsButton.draw(); }
    gamesAnimationId = requestAnimationFrame(animateGamesIntro);
}
