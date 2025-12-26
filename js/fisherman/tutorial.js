(function(){
    // 创建样式
    const style = document.createElement('style');
    style.textContent = `
        #tutorial-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        #tutorial-overlay.visible {
            opacity: 1;
        }
        #tutorial-box {
            background: #fff;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            width: 500px;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            transform: scale(0.8);
            transition: transform 0.3s ease;
        }
        #tutorial-overlay.visible #tutorial-box {
            transform: scale(1);
        }
        #tutorial-canvas {
            background: #e3f2fd;
            border-radius: 10px;
            border: 2px solid #90caf9;
            margin-bottom: 20px;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
        }
        #tutorial-close-btn {
            background: #FF7043;
            color: white;
            border: none;
            padding: 10px 30px;
            border-radius: 25px;
            font-size: 18px;
            cursor: pointer;
            font-family: 'Microsoft YaHei', sans-serif;
            transition: background 0.2s;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        #tutorial-close-btn:hover {
            background: #F4511E;
        }
        #tutorial-title {
            font-family: 'Microsoft YaHei', sans-serif;
            font-size: 24px;
            color: #333;
            margin-bottom: 15px;
            font-weight: bold;
        }
        #tutorial-desc {
            font-family: 'Microsoft YaHei', sans-serif;
            font-size: 16px;
            color: #666;
            margin-bottom: 15px;
            text-align: center;
        }
    `;
    document.head.appendChild(style);

    // 创建DOM结构
    const overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    
    const box = document.createElement('div');
    box.id = 'tutorial-box';
    
    const title = document.createElement('div');
    title.id = 'tutorial-title';
    title.innerText = '玩法演示';

    const desc = document.createElement('div');
    desc.id = 'tutorial-desc';
    desc.innerText = '左右摆动，点击下钩，抓到鱼加分';

    const canvas = document.createElement('canvas');
    canvas.id = 'tutorial-canvas';
    canvas.width = 440;
    canvas.height = 320;

    const btn = document.createElement('button');
    btn.id = 'tutorial-close-btn';
    btn.innerText = '我知道了';
    
    box.appendChild(title);
    box.appendChild(desc);
    box.appendChild(canvas);
    box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // 动画状态变量
    let animId = null;
    let state = 'idle'; // idle, swing, drop, catch, retrieve, score
    let timer = 0;
    let waveT = 0;
    
    // 游戏对象模拟
    const origin = { x: 220, y: 60 };
    const hook = { x: 220, y: 60, angle: 0, length: 30, state: 'swing' };
    const fish = { x: 0, y: 200, speed: 2, caught: false, active: true, radius: 20, dir: 1 };
    let score = 0;
    let showClickHint = false;

    function resetDemo() {
        hook.angle = 0;
        hook.length = 30;
        hook.state = 'swing';
        fish.x = -50;
        fish.y = 180 + Math.random()*50;
        fish.caught = false;
        fish.active = true;
        fish.dir = 1;
        score = 0;
        state = 'swing';
        timer = 0;
        showClickHint = false;
    }

    function update() {
        timer++;
        waveT += 0.05;

        // 鱼的运动
        if (!fish.caught) {
            fish.x += fish.speed * fish.dir;
            if (fish.x > 440 + 50) fish.x = -50;
        } else {
            // 鱼跟随钩子
            fish.x = origin.x + Math.sin(hook.angle) * hook.length;
            fish.y = origin.y + Math.cos(hook.angle) * hook.length;
        }

        // 状态机逻辑
        switch (state) {
            case 'swing':
                // 摆动模拟 - 与游戏一致
                hook.angle = Math.sin(waveT * 2) * 1.2; 
                hook.length = 30;
                
                // 演示：等待鱼游到中间
                if (fish.x > 180 && fish.x < 260 && !fish.caught) {
                    state = 'drop_hint'; // 准备下钩
                }
                break;
            
            case 'drop_hint':
                hook.angle = Math.sin(waveT * 2) * 1.2; // 继续摆动
                showClickHint = true;
                if (timer % 40 === 0) { 
                    state = 'drop';
                    showClickHint = false;
                }
                break;

            case 'drop':
                hook.length += 5; // 下钩速度
                
                // 计算钩子坐标
                let hx = origin.x + Math.sin(hook.angle) * hook.length;
                let hy = origin.y + Math.cos(hook.angle) * hook.length;
                
                // 碰撞检测
                if (!fish.caught) {
                    let dx = hx - fish.x;
                    let dy = hy - fish.y;
                    if (dx*dx + dy*dy < (fish.radius+10)*(fish.radius+10)) {
                        state = 'retrieve'; // 抓到直接收线
                        fish.caught = true;
                    }
                }
                
                if (hook.length > 250 || hx < 0 || hx > 440 || hy > 320) {
                    state = 'retrieve'; // 没抓到或出界收回
                }
                break;

            case 'catch':
                state = 'retrieve';
                break;

            case 'retrieve':
                hook.length -= 5;
                if (hook.length <= 30) {
                    hook.length = 30;
                    if (fish.caught) {
                        score += 10;
                        state = 'score';
                        timer = 0;
                        fish.active = false;
                    } else {
                        state = 'swing';
                    }
                }
                break;
            
            case 'score':
                if (timer > 60) { // 显示分数1秒
                    resetDemo();
                }
                break;
        }
    }

    function drawWaveLayer(ctx, W, H, t, yOffset, color, amp) {
        ctx.fillStyle = color;
        ctx.beginPath();
        let startY = 100 + yOffset;
        ctx.moveTo(0, startY);
        for(let x=0; x<=W; x+=10){
            let y = startY + Math.sin(x*0.02 + t) * amp;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        ctx.fill();
    }

    function drawFish(ctx, f) {
        ctx.save();
        ctx.translate(f.x,f.y);
        if(f.caught) {
             ctx.rotate(-Math.PI/2); // 垂直被吊起
        } else {
             if(f.dir<0) ctx.scale(-1,1); 
        }

        // 复用游戏中的鱼样式
        ctx.fillStyle='#ff7043';
        ctx.beginPath();
        ctx.ellipse(0,0,f.radius,f.radius*0.6,0,0,Math.PI*2);
        ctx.fill();
        
        ctx.fillStyle='#ef6c00';
        ctx.beginPath();
        ctx.moveTo(-f.radius,f.radius*0.1);
        ctx.lineTo(-f.radius-12,0);
        ctx.lineTo(-f.radius,f.radius*-0.1);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(f.radius*0.6, -f.radius*0.1, 4, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
    }

    function draw() {
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        // 天空 - 渐变
        let g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0,'#cbe7ff');
        g.addColorStop(0.3,'#9bd4ff');
        g.addColorStop(0.6,'#66c3ff');
        g.addColorStop(1,'#3aa9f0');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        // 海洋 - 渐变
        let seaG = ctx.createLinearGradient(0, 100, 0, H);
        seaG.addColorStop(0, '#29B6F6'); 
        seaG.addColorStop(0.4, '#039BE5'); 
        seaG.addColorStop(1, '#01579B'); 
        ctx.fillStyle = seaG;
        ctx.fillRect(0, 100, W, H-100);

        // 波浪 - 动态
        drawWaveLayer(ctx, W, H, waveT * 0.5, 10, 'rgba(1, 87, 155, 0.3)', 8);
        drawWaveLayer(ctx, W, H, waveT * 0.8, 5, 'rgba(3, 169, 244, 0.2)', 5);
        drawWaveLayer(ctx, W, H, waveT * 1.2, 0, 'rgba(179, 229, 252, 0.2)', 3);

        // 钩子源点 (木杆)
        ctx.fillStyle='#795548';
        ctx.fillRect(origin.x-4, 0, 8, origin.y); 

        // 鱼钩线
        let hx = origin.x + Math.sin(hook.angle) * hook.length;
        let hy = origin.y + Math.cos(hook.angle) * hook.length;
        
        ctx.strokeStyle = '#263238'; // 深色
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(hx, hy);
        ctx.stroke();

        // 钩子头
        ctx.fillStyle = '#263238';
        ctx.beginPath();
        ctx.arc(hx, hy, 6, 0, Math.PI*2);
        ctx.fill();

        // 鱼
        if (fish.active) {
            drawFish(ctx, fish);
        }

        // 点击提示
        if (showClickHint) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(W/2, H/2, 40, 0, Math.PI*2);
            ctx.fill();
            
            ctx.fillStyle = '#e65100';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('点击!', W/2, H/2+5);
            
            // 手指图标
            ctx.strokeStyle = '#e65100';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(W/2, H/2, 35, 0, Math.PI*2); 
            ctx.stroke();
        }

        // 得分提示
        if (state === 'score') {
            ctx.fillStyle = '#ffeb3b';
            ctx.font = 'bold 40px Arial';
            ctx.strokeStyle = '#f57f17';
            ctx.lineWidth = 2;
            ctx.textAlign = 'center';
            ctx.fillText('+10', origin.x, origin.y + 50);
            ctx.strokeText('+10', origin.x, origin.y + 50);
        }
        
        // 底部文字说明
        ctx.fillStyle = '#fff';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.font = '16px Microsoft YaHei';
        ctx.textAlign = 'center';
        let text = '';
        if (state === 'swing') text = '瞄准游动的鱼...';
        else if (state === 'drop' || state === 'drop_hint') text = '点击屏幕放下鱼钩';
        else if (state === 'catch') text = '抓住了！';
        else if (state === 'retrieve') text = '自动收线...';
        else if (state === 'score') text = '得分！';
        
        ctx.fillText(text, W/2, H - 20);
        ctx.shadowBlur = 0;
    }

    function loop() {
        if (!overlay.classList.contains('visible') && overlay.style.display === 'none') return;
        update();
        draw();
        animId = requestAnimationFrame(loop);
    }

    // 事件绑定
    function hideTutorial() {
        overlay.classList.remove('visible');
        if (animId) cancelAnimationFrame(animId);
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }

    btn.onclick = hideTutorial;
    overlay.onclick = function(e) {
        if(e.target === overlay) hideTutorial();
    };

    // 暴露全局对象
    window.FishermanTutorial = {
        show: function() {
            overlay.style.display = 'flex';
            // 强制重绘以触发transition
            overlay.offsetHeight; 
            overlay.classList.add('visible');
            
            resetDemo();
            if (animId) cancelAnimationFrame(animId);
            loop();
        }
    };
})();
