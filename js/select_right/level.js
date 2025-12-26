
function getFocusStats(){
    let obj = { count: 0, maxScore: 0 };
    const raw = localStorage.getItem("focus_stats");
    if(raw){
        try{
            const parsed = JSON.parse(raw);
            if(parsed){
                obj.count = parsed.count || 0;
                obj.maxScore = parsed.maxScore || 0;
            }
        }catch(e){}
    }
    return obj;
}

function saveFocusRecord(score){
    const stats = getFocusStats();
    stats.count += 1;
    if(score > stats.maxScore) stats.maxScore = score;
    localStorage.setItem("focus_stats", JSON.stringify(stats));
}

function clearFocusRecords(){
    const snapshot = ctx.getImageData(0,0,W,H);
    const dialog = new CanvasDialog(ctx, "清除记录", "确定要清除专注力训练记录吗？", 400, 220, false, snapshot);
    dialog.show(()=>{
        localStorage.removeItem("focus_stats");
        const tipDialog = new CanvasDialog(ctx, "提示", "记录已清除！", 360, 180, true, snapshot);
        tipDialog.show(()=>{ showFocusLevels(); });
    });
}

function showFocusLevels(){
    ctx.clearRect(0,0,W,H); 
    if(image.complete) ctx.drawImage(image,0,0,W,H);

    const stats = getFocusStats();
    
    ctx.fillStyle = getTextColor('title'); 
    ctx.font = "bold 48px Microsoft YaHei";
    ctx.textAlign = "center"; 
    ctx.fillText("专注力训练 - 记录", W/2, 80);
    
    ctx.font = "bold 30px Microsoft YaHei";
    ctx.fillStyle = getTextColor('text');
    ctx.fillText(`游戏次数: ${stats.count}`, W/2, 160);
    ctx.fillText(`最高得分: ${stats.maxScore}`, W/2, 220);

    const backColors = getButtonColors('accent');
    const warnColors = getButtonColors('warn');

    const backBtn = new CanvasButton(ctx, W/2 - 220, H - 150, 180, 60, "返回", backColors[0], backColors[1]);
    const clearBtn = new CanvasButton(ctx, W/2 + 40, H - 150, 180, 60, "清除记录", warnColors[0], warnColors[1]);

    backBtn.draw();
    clearBtn.draw();

    const snapshot = ctx.getImageData(0,0,W,H);

    function redraw(){
        ctx.putImageData(snapshot,0,0);
        backBtn.draw();
        clearBtn.draw();
    }

    canvas.onclick = function(e){
        const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
        if(backBtn.isClicked(x,y)){
            showFocusStartScreen();
        }else if(clearBtn.isClicked(x,y)){
            clearFocusRecords();
        }
    };

    canvas.onmousemove = function(e){
        const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
        const changed = backBtn.setHovered(backBtn.contains(x,y)) ||
                        clearBtn.setHovered(clearBtn.contains(x,y));
        if(changed) animateButtons(redraw, [backBtn, clearBtn]);
    };
}
