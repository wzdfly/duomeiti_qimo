// 文件作用：游戏网格绘制与交互，含返回主页面

function startSchulteGame(){                           // 初始化并进入游戏页
    gridNumbers=Array.from({length:25},(_,i)=>i+1).sort(()=>Math.random()-0.5); // 打乱 1..25
    cellStates=Array(25).fill(0);                      // 清空状态
    currentNumber=1; gameTimer=0;                      // 重置目标与计时
    drawGameGrid(); startGameTimer(); bindGamePageEvents(); // 绘制/启动计时/绑定事件
}

function drawGameGrid(){                               // 游戏页：绘制网格/提示/按钮/计时
    ctx.clearRect(0,0,W,H); ctx.drawImage(image,0,0,W,H); // 清空并绘制背景
    gridX=W/2-(gridCols*gridSize)/2; gridY=H/2-(gridRows*gridSize)/2; // 计算左上角
    for(let i=0;i<gridRows;i++){                       // 遍历行
        for(let j=0;j<gridCols;j++){                   // 遍历列
            let idx=i*gridCols+j;                      // 当前索引
            let x=gridX+j*gridSize; let y=gridY+i*gridSize; // 当前格坐标
            ctx.fillStyle=cellStates[idx]===0 ? "rgba(0,0,0,0.1)" : // 默认灰
                           cellStates[idx]===1 ? "#4CAF50" : "#FF5252"; // 正确绿/错误红
            roundRect(ctx,x,y,gridSize,gridSize,10,true,true); // 绘制格子
            ctx.fillStyle="#000"; ctx.font="bold 30px Microsoft YaHei"; // 数字样式
            ctx.textAlign="center"; ctx.textBaseline="middle"; // 居中
            ctx.fillText(gridNumbers[idx],x+gridSize/2,y+gridSize/2); // 写数字
        }
    }
    if(flashCellIndex!==null && flashToggle){          // 闪烁下一个正确格子外框
        const i=Math.floor(flashCellIndex/gridCols);   // 行
        const j=flashCellIndex%gridCols;               // 列
        const hx=gridX+j*gridSize; const hy=gridY+i*gridSize; // 高亮坐标
        ctx.save(); ctx.lineWidth=6;                   // 保存状态与设置线宽
        ctx.strokeStyle="rgba(76,175,80,0.9)";         // 外框颜色（绿）
        roundRect(ctx,hx-3,hy-3,gridSize+6,gridSize+6,12,false,true); // 外框
        ctx.restore();                                 // 恢复状态
    }
    if(hintText){                                      // 顶部提示文本
        ctx.fillStyle="#2E7D32"; ctx.font="bold 24px Microsoft YaHei"; // 文本样式
        ctx.textAlign="center"; ctx.textBaseline="middle"; // 居中
        ctx.fillText(hintText,W/2,30);                 // 写提示
    }
    if(!gameBackButton){                               // 首次创建返回按钮
        gameBackButton=new CanvasButton(ctx,W-300,40,120,50,"返回","#FF9800","#F57C00"); // 橙色
    }
    gameBackButton.ctx=ctx; gameBackButton.x=W-300; gameBackButton.y=40; // 同步上下文与位置
    gameBackButton.w=120; gameBackButton.h=50; gameBackButton.draw();    // 绘制返回按钮
    if(!gameRefreshButton){                            // 首次创建刷新按钮
        gameRefreshButton=new CanvasButton(ctx,W-160,40,120,50,"刷新","#2196F3","#1976D2"); // 蓝色
    }
    gameRefreshButton.ctx=ctx; gameRefreshButton.x=W-160; gameRefreshButton.y=40; // 同步位置
    gameRefreshButton.w=120; gameRefreshButton.h=50; gameRefreshButton.draw();    // 绘制刷新按钮
    ctx.fillStyle="#333"; ctx.font="bold 28px Microsoft YaHei"; ctx.textAlign="right"; // 计时样式
    ctx.fillText(`计时: ${gameTimer}s`,W-20,30);       // 绘制计时
}

function startGameTimer(){                             // 启动游戏计时器（每秒+1）
    if(gameInterval) clearInterval(gameInterval);      // 防止重复
    gameInterval=setInterval(()=>{ gameTimer++; drawGameGrid(); },1000); // 自增并重绘
}

function bindGamePageEvents(){                         // 游戏页点击与悬停事件
    canvas.onclick=function(e){                        // 点击事件
        const {x,y}=windowToCanvas(canvas,e.clientX,e.clientY); // 坐标换算
        if(gameBackButton.isClicked(x,y)){             // 点击返回
            if(gameInterval){ clearInterval(gameInterval); gameInterval=null; } // 停止计时
            stopFlash(); hintText=""; returnToMainMenu(); return; // 清理并返回主页面
        }
        if(gameRefreshButton.isClicked(x,y)){          // 点击刷新
            gridNumbers=Array.from({length:25},(_,i)=>i+1).sort(()=>Math.random()-0.5); // 重新打乱
            cellStates=Array(25).fill(0); currentNumber=1; // 清状态与目标
            hintText=""; stopFlash(); gameTimer=0;     // 清提示/闪烁/计时
            if(gameInterval){ clearInterval(gameInterval); gameInterval=null; } // 清旧计时
            startGameTimer(); drawGameGrid(); return;  // 重启计时并重绘
        }
        for(let i=0;i<gridRows;i++){                   // 遍历格子
            for(let j=0;j<gridCols;j++){
                let idx=i*gridCols+j;                  // 索引
                let cellX=gridX+j*gridSize, cellY=gridY+i*gridSize; // 当前格坐标
                if(x>=cellX && x<=cellX+gridSize && y>=cellY && y<=cellY+gridSize){ // 命中格子
                    if(gridNumbers[idx]===currentNumber){ // 点击正确
                        correctSound.currentTime=0; correctSound.play(); // 播放正确音效
                        cellStates[idx]=1; currentNumber++;              // 标记正确并递增目标
                        hintText=""; stopFlash();                        // 清提示与闪烁
                        for(let k=0;k<25;k++) if(cellStates[k]===2) cellStates[k]=0; // 清错误标记
                        drawGameGrid();                                  // 重绘
                        if(currentNumber>25){                            // 全部完成
                            if(gameInterval){ clearInterval(gameInterval); gameInterval=null; } // 停止计时
                            saveRecord(gameTimer);                       // 保存成绩
                            const snapshot=ctx.getImageData(0,0,W,H);   // 当前快照
                            const dialog=new CanvasDialog(ctx,"完成","已完成游戏！",400,220,true,snapshot); // 完成弹窗
                            dialog.show(()=>{ drawGameGrid(); bindGamePageEvents(); }); // 关闭后恢复
                        }
                    }else{                                              // 点击错误
                        wrongSound.currentTime=0; wrongSound.play();     // 播放错误音效
                        if(cellStates[idx]===0) cellStates[idx]=2;      // 标记错误
                        hintText=`点错了！请点击 ${currentNumber}`;       // 顶部提示
                        startFlashNextCell();                            // 闪烁正确格子
                        drawGameGrid();                                  // 重绘
                    }
                    return;                                             // 结束处理（命中后）
                }
            }
        }
    };
    canvas.onmousemove=function(e){                    // 悬停放大：返回与刷新
        const {x,y}=windowToCanvas(canvas,e.clientX,e.clientY); // 坐标换算
        const changed=gameBackButton.setHovered(gameBackButton.contains(x,y)) || // 返回悬停
                       gameRefreshButton.setHovered(gameRefreshButton.contains(x,y)); // 刷新悬停
        if(changed) animateButtons(()=>drawGameGrid(),[gameBackButton,gameRefreshButton]); // 动画与重绘
    };
}

function returnToMainMenu(){                           // 返回主页面（清理状态）
    ctx.clearRect(0,0,W,H);                            // 清空画布
    if(countdownInterval){ clearInterval(countdownInterval); countdownInterval=null; } // 清倒计时
    if(gameInterval){ clearInterval(gameInterval); gameInterval=null; } // 清游戏计时
    stopFlash(); hintText="";                           // 停止闪烁并清空提示
    ctx.drawImage(image,0,0,W,H);                      // 绘制背景
    drawStartScreen();                                 // 绘制主页面
}