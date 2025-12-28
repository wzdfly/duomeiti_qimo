// 文件作用：游戏网格绘制与交互，含返回主页面

function startSchulteGame(){                           // 初始化并进入游戏页
    const spec = levelsSpec[currentLevel] || levelsSpec[1];
    gridRows = spec.rows; gridCols = spec.cols; gridSize = spec.size;
    const total = gridRows * gridCols;
    gridNumbers = Array.from({length: total}, (_, i)=>i+1).sort(()=>Math.random()-0.5);
    cellStates = Array(total).fill(0);
    currentNumber = 1; gameTimer = 0;
    numbersHidden = false; currentMode = 'reaction';
    drawGameGrid(); startGameTimer(); bindGamePageEvents();
}

function startMemoryMode(){                            // 记忆模式：预览后隐藏数字
    const spec = levelsSpec[currentLevel] || levelsSpec[1];
    gridRows = spec.rows; gridCols = spec.cols; gridSize = spec.size;
    const total = gridRows * gridCols;
    gridNumbers = Array.from({length: total}, (_, i)=>i+1).sort(()=>Math.random()-0.5);
    cellStates = Array(total).fill(0);
    currentNumber = 1; gameTimer = 0;
    currentMode = 'memory'; numbersHidden = false; memoryCountdownValue = 10;
    if(bgMusic.paused) bgMusic.play();
    drawGameGrid(); bindGamePageEvents();
    if(memoryCountdownInterval) { clearInterval(memoryCountdownInterval); memoryCountdownInterval=null; }
    memoryCountdownInterval = setInterval(()=>{
        memoryCountdownValue--; drawGameGrid();
        if(memoryCountdownValue<=0){
            clearInterval(memoryCountdownInterval); memoryCountdownInterval=null;
            numbersHidden = true; startGameTimer(); drawGameGrid();
        }
    },1000);
}

function drawGameGrid(){                               // 游戏页：绘制网格/提示/按钮/计时
    ctx.clearRect(0,0,W,H); ctx.drawImage(image,0,0,W,H); // 清空并绘制背景
    gridX=W/2-(gridCols*gridSize)/2; gridY=H/2-(gridRows*gridSize)/2; // 计算左上角
    for(let i=0;i<gridRows;i++){                       // 遍历行
        for(let j=0;j<gridCols;j++){                   // 遍历列
            let idx=i*gridCols+j;                      // 当前索引
            let x=gridX+j*gridSize; let y=gridY+i*gridSize; // 当前格坐标
            ctx.fillStyle=cellStates[idx]===0 ? (currentTheme==='night'?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.1)") :
                           cellStates[idx]===1 ? "#4CAF50" : "#FF5252";
            roundRect(ctx,x,y,gridSize,gridSize,10,true,true); // 绘制格子
            
            // 计算自适应字体大小：约为格子大小的 50%
            const fontSize = Math.floor(gridSize * 0.5);
            ctx.fillStyle=getTextColor('gridNumber'); 
            ctx.font=`bold ${fontSize}px Microsoft YaHei`; // 使用动态计算的字体大小
            
            ctx.textAlign="center"; ctx.textBaseline="middle";
            const shouldShow = !numbersHidden || cellStates[idx]===1;
            if(shouldShow) ctx.fillText(gridNumbers[idx],x+gridSize/2,y+gridSize/2);
        }
    }
    if(flashCellIndex!==null && flashToggle){          // 闪烁下一个正确格子外框
        const i=Math.floor(flashCellIndex/gridCols);   // 行
        const j=flashCellIndex%gridCols;               // 列
        const hx=gridX+j*gridSize; const hy=gridY+i*gridSize; // 高亮坐标
        ctx.save(); ctx.lineWidth=6;                   // 保存状态与设置线宽
        ctx.strokeStyle="rgba(33,150,243,0.9)";         // 外框颜色（蓝色）
        roundRect(ctx,hx-3,hy-3,gridSize+6,gridSize+6,12,false,true); // 外框
        ctx.restore();                                 // 恢复状态
    }
    if(hintText){                                      // 顶部提示文本
        ctx.fillStyle=getTextColor('hint'); ctx.font="bold 24px Microsoft YaHei";
        ctx.textAlign="center"; ctx.textBaseline="middle"; // 居中
        ctx.fillText(hintText,W/2,30);                 // 写提示
    }
    if(currentMode==='memory' && memoryCountdownInterval){ // 记忆预览倒计时显示
        ctx.fillStyle=getTextColor('title'); ctx.font="bold 32px Microsoft YaHei";
        ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText(`记忆倒计时: ${memoryCountdownValue}s`, W/2, 40);
    }
    if(!gameBackButton){                               // 首次创建返回按钮
        const backColors = getButtonColors('neutral');
        gameBackButton=new CanvasButton(ctx,W-300,40,120,50,"返回",backColors[0],backColors[1]);
    }
    gameBackButton.ctx=ctx; gameBackButton.x=W-300; gameBackButton.y=40; // 同步上下文与位置
    gameBackButton.w=120; gameBackButton.h=50; gameBackButton.draw();    // 绘制返回按钮
    if(!gameRefreshButton){                            // 首次创建刷新按钮
        const refreshColors = getButtonColors('primary');
        gameRefreshButton=new CanvasButton(ctx,W-160,40,120,50,"刷新",refreshColors[0],refreshColors[1]);
    }
    gameRefreshButton.ctx=ctx; gameRefreshButton.x=W-160; gameRefreshButton.y=40; // 同步位置
    gameRefreshButton.w=120; gameRefreshButton.h=50; gameRefreshButton.draw();    // 绘制刷新按钮
    ctx.fillStyle=getTextColor('timer'); ctx.font="bold 28px Microsoft YaHei"; ctx.textAlign="right";
    ctx.fillText(`计时: ${gameTimer}s`,W-20,30);       // 绘制计时

    if(currentMode==='memory' && numbersHidden){       // 记忆模式且游戏进行中（数字已隐藏）
        ctx.fillStyle=getTextColor('text'); 
        ctx.font="bold 48px Microsoft YaHei"; 
        ctx.textAlign="right";
        ctx.fillText("按下空格键", W-60, 160);
        ctx.fillText("可获得提示", W-60, 240);
    }
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
            if(memoryCountdownInterval){ clearInterval(memoryCountdownInterval); memoryCountdownInterval=null; } // 停止预览倒计时
            stopFlash(); hintText=""; returnToMainMenu(); return; // 清理并返回主页面
        }
        if(gameRefreshButton.isClicked(x,y)){          // 点击刷新
            const total = gridRows * gridCols;
            gridNumbers=Array.from({length: total},(_,i)=>i+1).sort(()=>Math.random()-0.5);
            cellStates=Array(total).fill(0); currentNumber=1;
            hintText=""; stopFlash(); gameTimer=0;
            if(gameInterval){ clearInterval(gameInterval); gameInterval=null; }
            if(memoryCountdownInterval){ clearInterval(memoryCountdownInterval); memoryCountdownInterval=null; }
            if(currentMode==='memory'){
                numbersHidden=false; memoryCountdownValue=10; drawGameGrid();
                memoryCountdownInterval=setInterval(()=>{
                    memoryCountdownValue--; drawGameGrid();
                    if(memoryCountdownValue<=0){ clearInterval(memoryCountdownInterval); memoryCountdownInterval=null; numbersHidden=true; startGameTimer(); drawGameGrid(); }
                },1000);
            }else{
                startGameTimer(); drawGameGrid();
            }
            return;
        }
        if(currentMode==='memory' && !numbersHidden){   // 记忆模式预览阶段不响应格子点击
            return;                                     // 忽略点击
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
                        const total = gridRows * gridCols; for(let k=0;k<total;k++) if(cellStates[k]===2) cellStates[k]=0;
                        drawGameGrid();                                  // 重绘
                        const total2 = gridRows * gridCols; if(currentNumber>total2){
                            if(gameInterval){ clearInterval(gameInterval); gameInterval=null; }
                            saveRecord(gameTimer);
                            const snapshot=ctx.getImageData(0,0,W,H);
                            const dialog=new CanvasDialog(ctx,"完成","已完成该关卡",400,220,false,snapshot);
                            dialog.okButton.text = "重玩";
                            dialog.cancelButton.text = "下一关";
                            dialog.show(()=>{
                                if(currentMode==='memory'){
                                    startMemoryMode();
                                }else{
                                    const t = gridRows * gridCols;
                                    gridNumbers=Array.from({length: t},(_,i)=>i+1).sort(()=>Math.random()-0.5);
                                    cellStates=Array(t).fill(0); currentNumber=1; hintText=""; stopFlash(); gameTimer=0;
                                    startGameTimer(); drawGameGrid(); bindGamePageEvents();
                                }
                            }, ()=>{
                                if(currentLevel<3) currentLevel++;
                                if(currentMode==='memory') startMemoryMode(); else startSchulteGame();
                            });
                        }
                    }else{                                              // 点击错误
                        wrongSound.currentTime=0; wrongSound.play();     // 播放错误音效
                        if(cellStates[idx]===0) cellStates[idx]=2;      // 标记错误
                        hintText=`点错了！请点击 ${currentNumber}`;       // 顶部提示
                        if(currentMode==='reaction') startFlashNextCell();
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
    
    window.onkeydown=function(e){                      // 键盘事件：记忆模式提示
        if(currentMode==='memory' && numbersHidden && e.code==='Space'){
            startFlashNextCell();                      // 闪烁提示下一个格子
            drawGameGrid();
        }
    };
}

function returnToMainMenu(){                           // 返回主页面（清理状态）
    window.onkeydown=null;                             // 清理键盘事件
    ctx.clearRect(0,0,W,H);                            // 清空画布
    if(countdownInterval){ clearInterval(countdownInterval); countdownInterval=null; } // 清倒计时
    if(gameInterval){ clearInterval(gameInterval); gameInterval=null; } // 清游戏计时
    if(memoryCountdownInterval){ clearInterval(memoryCountdownInterval); memoryCountdownInterval=null; } // 清记忆预览倒计时
    numbersHidden=false;                                // 重置隐藏状态
    stopFlash(); hintText="";                           // 停止闪烁并清空提示
    ctx.drawImage(image,0,0,W,H);                      // 绘制背景
    drawStartScreen();                                 // 绘制主页面
}
