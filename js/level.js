// 文件作用：关卡页与记录管理（读取/保存/清空/展示）
function getBestTimes(){
    const raw = localStorage.getItem("bestTimes");
    let obj = {};
    try{ obj = raw? JSON.parse(raw): {}; }catch(e){ obj = {}; }
    return {
        1: typeof obj[1] === "number" ? obj[1] : null,
        2: typeof obj[2] === "number" ? obj[2] : null,
        3: typeof obj[3] === "number" ? obj[3] : null
    };
}

function getStats(){
    let obj = { count: 0, totalTime: 0 };
    const raw = localStorage.getItem("stats");
    if(raw){
        try{
            const parsed = JSON.parse(raw);
            if(parsed && typeof parsed === "object"){
                obj.count = (parsed.count|0);
                obj.totalTime = (parsed.totalTime|0);
            }
        }catch(e){}
    }
    return obj;
}

function saveRecord(duration){
    const bt = getBestTimes();
    const lvl = currentLevel;
    const prev = bt[lvl];
    if(prev === null || duration < prev){ bt[lvl] = duration; }
    localStorage.setItem("bestTimes", JSON.stringify(bt));

    const stats = getStats();
    stats.count += 1;
    stats.totalTime += (duration|0);
    localStorage.setItem("stats", JSON.stringify(stats));
}

function clearRecords(){
    const snapshot = ctx.getImageData(0,0,W,H);
    const dialog = new CanvasDialog(ctx, "清除记录", "确定要清除所有记录吗？", 400, 220, false, snapshot);
    dialog.show(()=>{
        localStorage.removeItem("bestTimes");
        localStorage.removeItem("stats");
        localStorage.removeItem("records");
        const tipDialog = new CanvasDialog(ctx, "提示", "记录已清除！", 360, 180, true, snapshot);
        tipDialog.show(()=>{ showLevels(); });
    });
}

function showLevels(){
    ctx.clearRect(0,0,W,H); 
    ctx.drawImage(image,0,0,W,H);
    const bt = getBestTimes();
    const stats = getStats();
    ctx.fillStyle = getTextColor('title'); ctx.font = "bold 48px Microsoft YaHei";
    ctx.textAlign = "center"; ctx.fillText("关卡", W/2, 80);
    ctx.font = "bold 30px Microsoft YaHei";
    ctx.fillStyle = getTextColor('text');
    ctx.fillText(`游戏次数: ${stats.count}`, W/2, 130);
    ctx.fillText(`总计时: ${stats.totalTime} 秒`, W/2, 170);
    const t1 = bt[1]===null? "暂无记录": `${bt[1]} 秒`;
    const t2 = bt[2]===null? "暂无记录": `${bt[2]} 秒`;
    const t3 = bt[3]===null? "暂无记录": `${bt[3]} 秒`;
    ctx.fillText(`第一关最佳用时: ${t1}`, W/2, 220);
    ctx.fillText(`第二关最佳用时: ${t2}`, W/2, 270);
    ctx.fillText(`第三关最佳用时: ${t3}`, W/2, 320);

    const sel1 = currentLevel===1, sel2 = currentLevel===2, sel3 = currentLevel===3;
    level1Button = new CanvasButton(ctx, W/2-330, H-180, 180, 60, "第一关", sel1?"#4CAF50":"#2196F3", sel1?"#388E3C":"#1976D2");
    level2Button = new CanvasButton(ctx, W/2-90,  H-180, 180, 60, "第二关", sel2?"#4CAF50":"#2196F3", sel2?"#388E3C":"#1976D2");
    level3Button = new CanvasButton(ctx, W/2+150, H-180, 180, 60, "第三关", sel3?"#4CAF50":"#2196F3", sel3?"#388E3C":"#1976D2");
    backButton = new CanvasButton(ctx, W/2-220, H-100, 180, 60, "返回", ...getButtonColors('accent'));
    clearRecordsButton = new CanvasButton(ctx, W/2+40, H-100, 180, 60, "清除记录", ...getButtonColors('warn'));
    level1Button.draw(); level2Button.draw(); level3Button.draw();
    backButton.draw(); clearRecordsButton.draw();
    levelScreenData = ctx.getImageData(0,0,W,H);
    bindCurrentPageEvents();
}

function bindCurrentPageEvents(){
    if(backButton && clearRecordsButton && level1Button && level2Button && level3Button){
        canvas.onclick = function(e){
            const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
            if(backButton.isClicked(x,y)) returnToMainMenu();
            else if(clearRecordsButton.isClicked(x,y)) clearRecords();
            else if(level1Button.isClicked(x,y)){ currentLevel=1; if(currentMode==='memory') startMemoryMode(); else startSchulteGame(); }
            else if(level2Button.isClicked(x,y)){ currentLevel=2; if(currentMode==='memory') startMemoryMode(); else startSchulteGame(); }
            else if(level3Button.isClicked(x,y)){ currentLevel=3; if(currentMode==='memory') startMemoryMode(); else startSchulteGame(); }
        };
        function redraw(){
            ctx.putImageData(levelScreenData,0,0);
            level1Button.draw(); level2Button.draw(); level3Button.draw();
            backButton.draw(); clearRecordsButton.draw();
        }
        canvas.onmousemove = function(e){
            const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
            const changed =
                level1Button.setHovered(level1Button.contains(x,y)) ||
                level2Button.setHovered(level2Button.contains(x,y)) ||
                level3Button.setHovered(level3Button.contains(x,y)) ||
                backButton.setHovered(backButton.contains(x,y)) ||
                clearRecordsButton.setHovered(clearRecordsButton.contains(x,y));
            if(changed) animateButtons(redraw, [level1Button,level2Button,level3Button,backButton,clearRecordsButton]);
        };
    }
}
