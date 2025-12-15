// 文件作用：主页面与倒计时逻辑（进入游戏前的流程）


function drawStartScreen(){                            // 主页面：倾斜网格预览与开场烟花后显示按钮
    ctx.clearRect(0,0,W,H);                            // 清空画布
    ctx.drawImage(image,0,0,W,H);                      // 背景图

    // 绘制右上方倾斜的预览网格
    drawStartPreviewGrid();
    showStartButtonCentered();
}

function drawStartPreviewGrid(){                       // 预览网格：倾斜数字阵列
    const rows=5, cols=5, size=100;                    // 预览网格行列与格大小
    const startX=W/2-(cols*size)/2 +150;               // 预览起始 X（右偏）
    const startY=H/2-350;                              // 预览起始 Y（上移）

    if(!startNumbers)                                  // 首次生成随机序列
        startNumbers=Array.from({length:rows*cols},(_,i)=>i+1) // 生成 1..25
                           .sort(()=>Math.random()-0.5); // 打乱顺序
    const numbers=startNumbers;                        // 使用缓存数字

    ctx.save();                                        // 保存变换前状态
    ctx.translate(startX,startY);                      // 平移到预览位置
    ctx.transform(1,0.4,-0.6,1,0,0);                   // 倾斜变换

    let numIndex=0;                                    // 数字索引
    for(let i=0;i<rows;i++){                           // 遍历行
        for(let j=0;j<cols;j++){                       // 遍历列
            const x=j*size, y=i*size;                  // 单格坐标
            const alpha=0.2+(i/(rows-1))*0.8;          // 逐行透明度
            ctx.fillStyle=`rgba(192,192,192,${alpha})`;      // 黑色透明
            ctx.font="bold 20px Microsoft YaHei";      // 字体
            ctx.textAlign="center"; ctx.textBaseline="middle"; // 居中
            ctx.fillText(numbers[numIndex++],x+size/2,y+size/2); // 绘制数字
        }
    }
    ctx.restore();                                     // 恢复变换
}

function showStartButtonCentered(){                    // 爆炸后显示模式选择与其他按钮
    const reactColors = getButtonColors('primary');
    reactionButton = new CanvasButton(ctx, W/2-100, H/2-60, 200, 60, "反应模式", reactColors[0], reactColors[1]);
    reactionButton.draw();

    const memColors = getButtonColors('accent');
    memoryButton = new CanvasButton(ctx, W/2-100, H/2+60, 200, 60, "记忆模式", memColors[0], memColors[1]);
    memoryButton.draw();

    const levelColors = getButtonColors('accent');
    achievementsButton = new CanvasButton(ctx, W-160, 40, 140, 50, "关卡", levelColors[0], levelColors[1]);
    achievementsButton.draw();

    const settingsColors = getButtonColors('neutral');
    settingsButton = new CanvasButton(ctx, W-320, 40, 140, 50, "设置", settingsColors[0], settingsColors[1]);
    settingsButton.draw();

    const backColors = getButtonColors('accent');
    backMainButton = new CanvasButton(ctx, 20, 40, 160, 50, "返回主页面", backColors[0], backColors[1]);
    backMainButton.draw();

    // 缓存静态像素用于悬停动画重绘
    startScreenData = ctx.getImageData(0,0,W,H);

    canvas.onclick = function(e){
        const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
        if(reactionButton.isClicked(x,y)) { currentMode='reaction'; start(); }
        else if(memoryButton.isClicked(x,y)) { currentMode='memory'; startMemoryMode(); }
        else if(achievementsButton.isClicked(x,y)) showLevels();
        else if(settingsButton.isClicked(x,y)) showSettingsPage();
        else if(backMainButton.isClicked(x,y)) showGamesPage();
    };

    function redrawStartButtons(){
        ctx.putImageData(startScreenData,0,0);
        reactionButton.draw();
        memoryButton.draw();
        achievementsButton.draw();
        settingsButton.draw();
        backMainButton.draw();
    }
    canvas.onmousemove = function(e){
        const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
        const changed = reactionButton.setHovered(reactionButton.contains(x,y)) ||
                        memoryButton.setHovered(memoryButton.contains(x,y)) ||
                        achievementsButton.setHovered(achievementsButton.contains(x,y)) ||
                        settingsButton.setHovered(settingsButton.contains(x,y)) ||
                        backMainButton.setHovered(backMainButton.contains(x,y));
        if(changed) animateButtons(redrawStartButtons,[reactionButton,memoryButton,achievementsButton,settingsButton,backMainButton]);
    };
}

function drawCountdown(){                              // 倒计时画面（居中圆与数字）
    ctx.clearRect(0,0,W,H); ctx.drawImage(image,0,0,W,H); // 清空并绘制背景
    ctx.beginPath(); ctx.fillStyle="rgba(107,107,107,0.7)"; // 圆背景色
    ctx.arc(W/2,H/2,100,0,2*Math.PI); ctx.fill();      // 画圆并填充
    ctx.fillStyle="#fff"; ctx.font="bold 120px Microsoft YaHei"; // 数字样式
    ctx.textAlign="center"; ctx.textBaseline="middle"; // 居中
    ctx.fillText(countdownValue,W/2,H/2+10);           // 绘制倒计时数字
}

function start(){                                      // 主页面“开始”点击：倒计时逻辑
    if(bgMusic.paused) bgMusic.play();                 // 确保背景音乐播放
    canvas.onclick=null; canvas.onmousemove=null;      // 禁用主页面事件
    countdownValue=3;                                  // 倒计时从 3 开始
    drawCountdown(); normalSound.currentTime=0;        // 立即绘制并准备提示音
    normalSound.play();                                // 播放提示音
    countdownInterval=setInterval(()=>{                // 每秒更新
        countdownValue--; drawCountdown();             // 数字减 1 并重绘
        if(countdownValue<=0){                         // 倒计时结束
            clearInterval(countdownInterval); countdownInterval=null; // 清除定时器
            startSchulteGame();                        // 进入游戏
        }else{ normalSound.currentTime=0; normalSound.play(); } // 中间提示音
    },1000);                                           // 间隔 1000ms
}
