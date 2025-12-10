// 文件作用：主页面与倒计时逻辑（进入游戏前的流程）

function onImageLoad(){                                // 背景图加载完成：进入主页面
    ctx.clearRect(0,0,W,H);                            // 清空画布
    ctx.drawImage(image,0,0,W,H);                      // 绘制背景图
    drawStartScreen();                                 // 绘制主页面（含烟花开场）
    bgMusic.play().catch(()=>{                         // 尝试播放背景音乐
        console.log("等待用户交互后播放音乐");         // 浏览器限制提示
    });                                                // 捕获失败
}

function drawStartScreen(){                            // 主页面：倾斜网格预览与开场烟花后显示按钮
    ctx.clearRect(0,0,W,H);                            // 清空画布
    ctx.drawImage(image,0,0,W,H);                      // 背景图

    // 绘制右上方倾斜的预览网格
    drawStartPreviewGrid();

    // 启动烟花开场动画
    startIntroPhase = 'ascend';
    rocketSprite = createRocketSprite();
    particleSprites = [];
    startIntroAnimationId = requestAnimationFrame(animateStartIntro);
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
            ctx.fillStyle=`rgba(0,0,0,${alpha})`;      // 黑色透明
            ctx.font="bold 20px Microsoft YaHei";      // 字体
            ctx.textAlign="center"; ctx.textBaseline="middle"; // 居中
            ctx.fillText(numbers[numIndex++],x+size/2,y+size/2); // 绘制数字
        }
    }
    ctx.restore();                                     // 恢复变换
}

// --- 开场烟花：火箭与粒子精灵 ---
function createRocketSprite(){                         // 从下方发射的火箭精灵
    const rocket = new Sprite('rocket',{               // 自定义 painter：发光圆点
        paint(sprite,context){
            context.save();
            context.shadowColor = 'rgba(255,200,120,0.8)';
            context.shadowBlur = 20;
            context.globalAlpha = 0.95;
            context.fillStyle = '#ffd54f';
            context.beginPath();
            context.arc(sprite.left, sprite.top, sprite.radius, 0, Math.PI*2);
            context.fill();
            // 尾焰
            context.globalAlpha = 0.6;
            const grad = context.createLinearGradient(sprite.left, sprite.top, sprite.left, sprite.top+60);
            grad.addColorStop(0,'rgba(255,180,100,0.7)');
            grad.addColorStop(1,'rgba(255,120,80,0)');
            context.fillStyle = grad;
            context.beginPath();
            context.moveTo(sprite.left-3, sprite.top);
            context.lineTo(sprite.left+3, sprite.top);
            context.lineTo(sprite.left+10, sprite.top+60);
            context.lineTo(sprite.left-10, sprite.top+60);
            context.closePath();
            context.fill();
            context.restore();
        }
    }, [
        { // 上升行为
            execute(sprite, context){
                sprite.top -= sprite.speed;
                if(sprite.top <= sprite.targetY){
                    // 切换到爆炸阶段
                    startIntroPhase = 'explode';
                    // 生成爆炸粒子
                    createExplosionParticles(sprite.left, sprite.top);
                    // 隐藏火箭
                    sprite.visible = false;
                }
            }
        }
    ]);

    rocket.left = W/2;                                 // 居中发射
    rocket.top = H - 20;                               // 底部起始
    rocket.radius = 20;
    rocket.speed = 10;                                 // 上升速度
    rocket.targetY = H/2;                              // 在屏幕中间炸开
    return rocket;
}

function createExplosionParticles(cx, cy){             // 爆炸粒子群
    const count = 60;
    particleSprites = [];
    for(let i=0;i<count;i++){
        const angle = Math.random()*Math.PI*2;
        const speed = 3 + Math.random()*6;
        const vx = Math.cos(angle)*speed;
        const vy = Math.sin(angle)*speed;
        const color = `hsl(${Math.floor(Math.random()*360)}, 90%, 60%)`;
        const particle = new Sprite('particle',{
            paint(sprite,context){
                context.save();
                context.globalAlpha = sprite.alpha;
                context.fillStyle = color;
                context.beginPath();
                context.arc(sprite.left, sprite.top, sprite.radius, 0, Math.PI*2);
                context.fill();
                context.restore();
            }
        }, [
            { // 粒子运动与衰减
                execute(sprite){
                    sprite.left += sprite.vx;
                    sprite.top += sprite.vy;
                    sprite.vy += 0.05;                // 轻微重力
                    sprite.radius *= 0.98;            // 半径缩小
                    sprite.alpha -= 0.015;            // 渐隐
                    if(sprite.alpha <= 0 || sprite.radius < 0.5){
                        sprite.visible = false;
                    }
                }
            }
        ]);
        particle.left = cx; particle.top = cy;
        particle.vx = vx; particle.vy = vy;
        particle.radius = 18 + Math.random()*3;
        particle.alpha = 1;
        particleSprites.push(particle);
    }
}

function animateStartIntro(){                          // 开场动画循环（场景管理）
    ctx.clearRect(0,0,W,H);
    ctx.drawImage(image,0,0,W,H);
    drawStartPreviewGrid();

    const now = performance.now(); // 预留时间戳（目前未使用）

    if(startIntroPhase === 'ascend' && rocketSprite){
        rocketSprite.update(ctx, now);
        rocketSprite.paint(ctx);
    }

    if(startIntroPhase === 'explode'){
        let anyVisible = false;
        for(const p of particleSprites){
            p.update(ctx, now);
            if(p.visible){
                p.paint(ctx);
                anyVisible = true;
            }
        }
        if(!anyVisible){
            // 粒子结束后进入按钮阶段
            startIntroPhase = 'buttons';
        }
    }

    if(startIntroPhase !== 'buttons'){
        startIntroAnimationId = requestAnimationFrame(animateStartIntro);
    } else {
        // 显示“开始游戏”按钮（居中）并绑定事件
        showStartButtonCentered();
    }
}

function showStartButtonCentered(){                    // 爆炸中心出现开始按钮
    startButton = new CanvasButton(ctx, W/2-100, H/2-30, 200, 60, "开始游戏", "#42A5F5cc", "#1E88E5cc");
    startButton.draw();

    // 可选：右上角显示“个人成就”按钮（保留原有入口）
    achievementsButton = new CanvasButton(ctx, W-160, 40, 140, 50, "个人成就", "#4CAF50", "#388E3C");
    achievementsButton.draw();

    // 缓存静态像素用于悬停动画重绘
    startScreenData = ctx.getImageData(0,0,W,H);

    canvas.onclick = function(e){
        const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
        if(startButton.isClicked(x,y)) start();
        else if(achievementsButton.isClicked(x,y)) showAchievements();
    };

    function redrawStartButtons(){
        ctx.putImageData(startScreenData,0,0);
        startButton.draw();
        achievementsButton.draw();
    }
    canvas.onmousemove = function(e){
        const {x,y} = windowToCanvas(canvas, e.clientX, e.clientY);
        const changed = startButton.setHovered(startButton.contains(x,y)) ||
                        achievementsButton.setHovered(achievementsButton.contains(x,y));
        if(changed) animateButtons(redrawStartButtons,[startButton,achievementsButton]);
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