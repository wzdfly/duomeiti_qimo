// 文件作用：关卡页与记录管理（读取/保存/清空/展示）
function getBestTimes(mode){
    const key = mode === 'memory' ? "bestTimes_memory" : "bestTimes_reaction";
    const raw = localStorage.getItem(key);
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
    const bt = getBestTimes(currentMode);
    const lvl = currentLevel;
    const prev = bt[lvl];
    if(prev === null || duration < prev){ bt[lvl] = duration; }
    
    const key = currentMode === 'memory' ? "bestTimes_memory" : "bestTimes_reaction";
    localStorage.setItem(key, JSON.stringify(bt));

    const stats = getStats();
    stats.count += 1;
    stats.totalTime += (duration|0);
    localStorage.setItem("stats", JSON.stringify(stats));
}

function clearRecords(){
    const snapshot = ctx.getImageData(0,0,W,H);
    const dialog = new CanvasDialog(ctx, "清除记录", "确定要清除所有记录吗？", 400, 220, false, snapshot);
    dialog.show(()=>{
        localStorage.removeItem("bestTimes_reaction");
        localStorage.removeItem("bestTimes_memory");
        localStorage.removeItem("stats");
        // 为了兼容旧数据，可以把旧key也清一下
        localStorage.removeItem("bestTimes");
        
        const tipDialog = new CanvasDialog(ctx, "提示", "记录已清除！", 360, 180, true, snapshot);
        tipDialog.show(()=>{ showLevels(); });
    }, ()=>{
        // 取消时恢复页面事件
        bindCurrentPageEvents();
    });
}

// 声明全局按钮变量，以便 bindCurrentPageEvents 使用
let reactLevel1Btn, reactLevel2Btn, reactLevel3Btn;
let memLevel1Btn, memLevel2Btn, memLevel3Btn;

// 标志位：当前是否在关卡选择页面
window.isLevelScreen = false;

function showLevels(){
    window.isLevelScreen = true;
    ctx.clearRect(0,0,W,H); 
    ctx.drawImage(image,0,0,W,H);
    
    const reactTimes = getBestTimes('reaction');
    const memTimes = getBestTimes('memory');
    const stats = getStats();
    
    // 标题
    ctx.fillStyle = getTextColor('title'); ctx.font = "bold 48px Microsoft YaHei";
    ctx.textAlign = "center"; ctx.fillText("关卡", W/2, 60);
    
    // 总统计
    ctx.font = "bold 24px Microsoft YaHei";
    ctx.fillStyle = getTextColor('text');
    ctx.fillText(`总游戏次数: ${stats.count}   游戏时长: ${stats.totalTime} 秒`, W/2, 110);
    
    // 左右分栏布局参数
    const leftCenterX = W * 0.25 + 50; // 稍微往右偏一点，避免太靠边
    const rightCenterX = W * 0.75 - 50;
    const startY = 160;
    
    // --- 左侧：反应模式 ---
    ctx.fillStyle = getTextColor('title'); ctx.font = "bold 36px Microsoft YaHei";
    ctx.fillText("反应模式", leftCenterX, startY);
    
    ctx.font = "bold 24px Microsoft YaHei";
    ctx.fillStyle = getTextColor('text');
    const rt1 = reactTimes[1]===null? "暂无": `${reactTimes[1]}s`;
    const rt2 = reactTimes[2]===null? "暂无": `${reactTimes[2]}s`;
    const rt3 = reactTimes[3]===null? "暂无": `${reactTimes[3]}s`;
    
    ctx.fillText(`第一关最佳: ${rt1}`, leftCenterX, startY + 60);
    ctx.fillText(`第二关最佳: ${rt2}`, leftCenterX, startY + 160);
    ctx.fillText(`第三关最佳: ${rt3}`, leftCenterX, startY + 260);

    // --- 右侧：记忆模式 ---
    ctx.fillStyle = getTextColor('title'); ctx.font = "bold 36px Microsoft YaHei";
    ctx.fillText("记忆模式", rightCenterX, startY);
    
    ctx.font = "bold 24px Microsoft YaHei";
    ctx.fillStyle = getTextColor('text');
    const mt1 = memTimes[1]===null? "暂无": `${memTimes[1]}s`;
    const mt2 = memTimes[2]===null? "暂无": `${memTimes[2]}s`;
    const mt3 = memTimes[3]===null? "暂无": `${memTimes[3]}s`;
    
    ctx.fillText(`第一关最佳: ${mt1}`, rightCenterX, startY + 60);
    ctx.fillText(`第二关最佳: ${mt2}`, rightCenterX, startY + 160);
    ctx.fillText(`第三关最佳: ${mt3}`, rightCenterX, startY + 260);
    
    // 按钮颜色统一 (不再随点击改变颜色)
    const btnColorNormal = "#2196F3";
    const btnColorHover = "#1976D2";
    
    // 创建按钮 - 反应模式
    reactLevel1Btn = new CanvasButton(ctx, leftCenterX - 90, startY + 80, 180, 50, "第一关", btnColorNormal, btnColorHover);
    reactLevel2Btn = new CanvasButton(ctx, leftCenterX - 90, startY + 180, 180, 50, "第二关", btnColorNormal, btnColorHover);
    reactLevel3Btn = new CanvasButton(ctx, leftCenterX - 90, startY + 280, 180, 50, "第三关", btnColorNormal, btnColorHover);
    
    // 创建按钮 - 记忆模式
    memLevel1Btn = new CanvasButton(ctx, rightCenterX - 90, startY + 80, 180, 50, "第一关", btnColorNormal, btnColorHover);
    memLevel2Btn = new CanvasButton(ctx, rightCenterX - 90, startY + 180, 180, 50, "第二关", btnColorNormal, btnColorHover);
    memLevel3Btn = new CanvasButton(ctx, rightCenterX - 90, startY + 280, 180, 50, "第三关", btnColorNormal, btnColorHover);
    
    // 绘制按钮
    reactLevel1Btn.draw(); reactLevel2Btn.draw(); reactLevel3Btn.draw();
    memLevel1Btn.draw(); memLevel2Btn.draw(); memLevel3Btn.draw();
    
    // 底部按钮
    backButton = new CanvasButton(ctx, W/2-220, H-80, 180, 60, "返回", ...getButtonColors('accent'));
    clearRecordsButton = new CanvasButton(ctx, W/2+40, H-80, 180, 60, "清除记录", ...getButtonColors('warn'));
    
    backButton.draw(); clearRecordsButton.draw();
    
    levelScreenData = ctx.getImageData(0,0,W,H);
    bindCurrentPageEvents();
}

function bindCurrentPageEvents(){
    if(backButton && clearRecordsButton){
        // 辅助函数：离开关卡页面时清理状态
        function exitLevelScreen() {
            window.isLevelScreen = false;
            levelScreenData = null;
            canvas.onmousemove = null;
        }

        canvas.onclick = function(e){
            const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
            if(backButton.isClicked(x,y)) { exitLevelScreen(); returnToMainMenu(); }
            else if(clearRecordsButton.isClicked(x,y)) clearRecords(); // 弹窗不需要退出页面
            // 反应模式点击
            else if(reactLevel1Btn.isClicked(x,y)){ exitLevelScreen(); currentLevel=1; currentMode='reaction'; startSchulteGame(); }
            else if(reactLevel2Btn.isClicked(x,y)){ exitLevelScreen(); currentLevel=2; currentMode='reaction'; startSchulteGame(); }
            else if(reactLevel3Btn.isClicked(x,y)){ exitLevelScreen(); currentLevel=3; currentMode='reaction'; startSchulteGame(); }
            // 记忆模式点击
            else if(memLevel1Btn.isClicked(x,y)){ exitLevelScreen(); currentLevel=1; currentMode='memory'; startMemoryMode(); }
            else if(memLevel2Btn.isClicked(x,y)){ exitLevelScreen(); currentLevel=2; currentMode='memory'; startMemoryMode(); }
            else if(memLevel3Btn.isClicked(x,y)){ exitLevelScreen(); currentLevel=3; currentMode='memory'; startMemoryMode(); }
        };
        
        function redraw(){
        // 如果已经离开了关卡页面，就停止绘制
        if (!window.isLevelScreen || !levelScreenData) return;

        ctx.putImageData(levelScreenData,0,0);
        reactLevel1Btn.draw(); reactLevel2Btn.draw(); reactLevel3Btn.draw();
        memLevel1Btn.draw(); memLevel2Btn.draw(); memLevel3Btn.draw();
        backButton.draw(); clearRecordsButton.draw();
    }
    
    canvas.onmousemove = function(e){
        // 双重保险
        if (!window.isLevelScreen) return;

        const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
        const changed =
                reactLevel1Btn.setHovered(reactLevel1Btn.contains(x,y)) ||
                reactLevel2Btn.setHovered(reactLevel2Btn.contains(x,y)) ||
                reactLevel3Btn.setHovered(reactLevel3Btn.contains(x,y)) ||
                memLevel1Btn.setHovered(memLevel1Btn.contains(x,y)) ||
                memLevel2Btn.setHovered(memLevel2Btn.contains(x,y)) ||
                memLevel3Btn.setHovered(memLevel3Btn.contains(x,y)) ||
                backButton.setHovered(backButton.contains(x,y)) ||
                clearRecordsButton.setHovered(clearRecordsButton.contains(x,y));
                
            if(changed) animateButtons(redraw, [
                reactLevel1Btn,reactLevel2Btn,reactLevel3Btn,
                memLevel1Btn,memLevel2Btn,memLevel3Btn,
                backButton,clearRecordsButton
            ]);
        };
    }
}
