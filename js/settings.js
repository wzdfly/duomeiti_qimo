let settingsTemp = { theme: null, volume: null };

function showSettingsPage(){
    ctx.clearRect(0,0,W,H);
    ctx.drawImage(image,0,0,W,H);

    if(settingsTemp.theme===null) settingsTemp.theme = currentTheme;
    if(settingsTemp.volume===null) settingsTemp.volume = currentVolume;

    ctx.fillStyle = getTextColor('title'); ctx.font = 'bold 44px Microsoft YaHei';
    ctx.textAlign = 'center'; ctx.fillText('设置', W/2, 80);
    ctx.font = 'bold 26px Microsoft YaHei'; ctx.fillStyle = getTextColor('text'); ctx.fillText('主题', W/2, 140);

    const dayColors = getButtonColors('accent');
    const nightColors = getButtonColors('neutral');
    const selDay = settingsTemp.theme==='day';
    const selNight = settingsTemp.theme==='night';
    const dayBtnColors = selDay ? dayColors : getButtonColors('primary');
    const nightBtnColors = selNight ? nightColors : getButtonColors('primary');

    const themeY = 190;
    const volY = 300;

    const cDay1 = dayBtnColors[0], cDay2 = dayBtnColors[1];
    const cNight1 = nightBtnColors[0], cNight2 = nightBtnColors[1];
    const w = 160, h = 56;
    const xDay = W/2-200, xNight = W/2+40;
    const xBack = W/2-220, xSave = W/2+40;

    dayModeButton = new CanvasButton(ctx, xDay, themeY, w, h, '日间模式', cDay1, cDay2);
    nightModeButton = new CanvasButton(ctx, xNight, themeY, w, h, '夜间模式', cNight1, cNight2);
    backButton = new CanvasButton(ctx, xBack, H-120, 180, 60, '返回', ...getButtonColors('accent'));
    saveButton = new CanvasButton(ctx, xSave, H-120, 180, 60, '保存', ...getButtonColors('primary'));

    dayModeButton.draw(); nightModeButton.draw(); backButton.draw(); saveButton.draw();

    ctx.fillStyle = getTextColor('text'); ctx.font = 'bold 26px Microsoft YaHei';
    ctx.fillText('音量', W/2, volY-40);
    drawVolumeSlider(W/2-250, volY, 500, 14, settingsTemp.volume);

    const snapshot = ctx.getImageData(0,0,W,H);
    achievementsScreenData = snapshot;
    bindSettingsEvents(W/2-250, volY, 500);
}

let dayModeButton=null, nightModeButton=null, saveButton=null;

function drawVolumeSlider(x,y,width,height,vol){
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 1)'; roundRect(ctx,x,y,width+10,height,10,true,false);
    ctx.fillStyle = '#4CAF50'; const filled = Math.round(width*vol);
    roundRect(ctx,x,y,filled,height,8,true,false);
    const handleX = x + filled;
    ctx.fillStyle = '#4CAF50'; 
    ctx.beginPath(); ctx.arc(handleX, y+height/2, 7, 0, Math.PI*2); ctx.fill();
    ctx.restore();
}

function bindSettingsEvents(sx, sy, sw){
    canvas.onclick = function(e){
        const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
        if(backButton.isClicked(x,y)){ showGamesPage(); return; }
        if(saveButton.isClicked(x,y)){
            setTheme(settingsTemp.theme);
            setVolume(settingsTemp.volume);
            showGamesPage(); return;
        }
        if(dayModeButton.isClicked(x,y)) settingsTemp.theme='day';
        if(nightModeButton.isClicked(x,y)) settingsTemp.theme='night';
        ctx.putImageData(achievementsScreenData,0,0);
        showSettingsPage();
    };
    let dragging=false;
    canvas.onmousedown = function(e){
        const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
        const within = x>=sx && x<=sx+sw && y>=sy-10 && y<=sy+30;
        if(within){ dragging=true; updateVolByX(x); }
    };
    canvas.onmousemove = function(e){
        if(dragging){ const {x} = windowToCanvas(canvas, e.clientX, e.clientY); updateVolByX(x); }
    };
    canvas.onmouseup = function(){ dragging=false; };
    canvas.onmouseleave = function(){ dragging=false; };

    function updateVolByX(mx){
        let v = (mx - sx)/sw; v = Math.max(0, Math.min(1, v)); settingsTemp.volume = v;
        setVolume(v);
        ctx.putImageData(achievementsScreenData,0,0);
        drawVolumeSlider(sx, sy, sw, 14, v);
    }
}
