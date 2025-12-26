
function showFocusStartScreen(){
    ctx.clearRect(0,0,W,H);
    // 使用全局 image (bg/bg_night)
    if(image.complete) ctx.drawImage(image,0,0,W,H);
    else image.onload = function(){ ctx.drawImage(image,0,0,W,H); showFocusStartScreen(); };

    ctx.fillStyle = getTextColor('title'); 
    ctx.font = 'bold 60px Microsoft YaHei';
    ctx.textAlign = 'center'; 
    ctx.textBaseline = 'middle';
    ctx.fillText('专注力训练', W/2, H/3);

    const startColors = getButtonColors('primary');
    const levelColors = getButtonColors('accent');
    const backColors = getButtonColors('neutral');

    const btnW = 200, btnH = 60;
    const startBtn = new CanvasButton(ctx, W/2 - btnW/2, H/2, btnW, btnH, "开始游戏", startColors[0], startColors[1]);
    const levelBtn = new CanvasButton(ctx, W/2 - btnW/2, H/2 + 80, btnW, btnH, "关卡记录", levelColors[0], levelColors[1]);
    const backBtn = new CanvasButton(ctx, W/2 - btnW/2, H/2 + 160, btnW, btnH, "返回", backColors[0], backColors[1]);

    startBtn.draw();
    levelBtn.draw();
    backBtn.draw();

    // 保存快照用于动画
    const snapshot = ctx.getImageData(0,0,W,H);

    function redraw(){
        ctx.putImageData(snapshot,0,0);
        startBtn.draw();
        levelBtn.draw();
        backBtn.draw();
    }

    canvas.onclick = function(e){
        const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
        if(startBtn.isClicked(x,y)){
            window.startFocusGame(1);
        }else if(levelBtn.isClicked(x,y)){
            showFocusLevels();
        }else if(backBtn.isClicked(x,y)){
            showGamesPage();
        }
    };

    canvas.onmousemove = function(e){
        const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
        const changed = startBtn.setHovered(startBtn.contains(x,y)) ||
                        levelBtn.setHovered(levelBtn.contains(x,y)) ||
                        backBtn.setHovered(backBtn.contains(x,y));
        if(changed) animateButtons(redraw, [startBtn, levelBtn, backBtn]);
    };
}
