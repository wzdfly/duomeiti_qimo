// 专注力训练小游戏：找目标
// 逻辑：屏幕出现若干图案（水果、生活物品、数字），只有一个目标图案，玩家需点击该目标

const FocusGame = {
    // 游戏状态
    isPlaying: false,
    level: 1,
    score: 0,
    timer: 0,
    maxTime: 30,
    lastFrameTime: 0,
    items: [],       // 屏幕上的所有物体 {x, y, char, isTarget, angle}
    target: null,    // 目标物体配置 {type, char}
    
    // UI 按钮
    backButton: null,
    pauseButton: null,
    
    // 资源库
    assets: {
        fruits: ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍍', '🥝', '🍑', '🍋', '🍈', '🍏', '🍐', '🍊', '🥭'],
        items: ['📷', '🔑', '💡', '📚', '🎁', '🔔', '🎈', '🎸', '🎹', '🎺', '🎻', '🎨'],
        animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵']
    },

    // 样式配置
    config: {
        fontSize: 80, // 增大字体
        fontFamily: 'Arial, "Segoe UI Emoji"',
        topBarHeight: 0 // 移除顶部栏配置，改用左右布局
    },
    
    // 特定背景图 (日间模式)
    bgDay: (function(){
        const img = new Image();
        img.src = 'src/select_right_light.png';
        return img;
    })(),

    // 布局参数 - 确保初始定义
    layout: {
        gameArea: {x: 0, y: 0, w: 0, h: 0},
        sidebar: {x: 0, y: 0, w: 0, h: 0}
    },

    // 初始化游戏
    init: function(startLevel = 1) {
        console.log("FocusGame init called", startLevel);
        this.score = 0;
        this.level = startLevel;
        
        // 确保 layout 对象存在
        if (!this.layout) {
            this.layout = {
                gameArea: {x: 0, y: 0, w: 0, h: 0},
                sidebar: {x: 0, y: 0, w: 0, h: 0}
            };
        }
        
        // 计算布局
        // 右侧侧边栏宽度占 25% 或至少 280px
        const sidebarWidth = Math.max(W * 0.25, 280);
        const gameWidth = W - sidebarWidth;

        this.layout.gameArea = { x: 0, y: 0, w: gameWidth, h: H };
        this.layout.sidebar = { x: gameWidth, y: 0, w: sidebarWidth, h: H };

        console.log("Layout computed:", this.layout);

        // 初始化按钮 - 放在右侧侧边栏底部
        const backColors = getButtonColors('neutral');
        const pauseColors = getButtonColors('primary');
        
        const btnW = sidebarWidth - 40;
        const btnH = 80;
        const btnX = this.layout.sidebar.x + 20;
        
        // 倒序排列：返回在最下，暂停在上面
        const backY = H - 30 - btnH;
        const pauseY = backY - 20 - btnH;

        this.backButton = new CanvasButton(ctx, btnX, backY, btnW, btnH, "返回", backColors[0], backColors[1]);
        this.pauseButton = new CanvasButton(ctx, btnX, pauseY, btnW, btnH, "暂停", pauseColors[0], pauseColors[1]);
        
        // 增大按钮文字
        this.backButton.fontSize = 32;
        this.pauseButton.fontSize = 32;
        
        this.startGameLoop();
    },

    // 启动新的一关
    startLevel: function() {
        // 难度控制：随关卡增加物品数量，减少初始时间
        const baseCount = 5;
        const itemCount = Math.min(40, baseCount + this.level * 3); 
        this.timer = Math.max(5, 20 - Math.floor(this.level / 2)); 
        
        this.items = [];
        
        // 1. 随机选择一个类别
        const types = Object.keys(this.assets);
        const currentType = types[Math.floor(Math.random() * types.length)];
        const pool = this.assets[currentType];
        
        // 2. 确定目标图案
        const targetIndex = Math.floor(Math.random() * pool.length);
        const targetChar = pool[targetIndex];
        
        this.target = {
            type: currentType,
            char: targetChar
        };
        
        // 3. 生成所有物品列表（1个目标 + N个干扰项）
        const allItems = [];
        
        // 先添加干扰项（确保它们在底层）
        for (let i = 0; i < itemCount; i++) {
            let distractionChar;
            // 确保干扰项不是目标
            do {
                distractionChar = pool[Math.floor(Math.random() * pool.length)];
            } while (distractionChar === targetChar);
            
            allItems.push({
                char: distractionChar,
                isTarget: false,
                angle: (Math.random() - 0.5) * 1.0 // 干扰项旋转幅度稍大
            });
        }
        
        // 最后添加目标（确保它在顶层，且优先被点击）
        allItems.push({
            char: targetChar,
            isTarget: true,
            angle: (Math.random() - 0.5) * 0.5 // 轻微随机旋转
        });
        
        // 4. 随机分布位置（防重叠）
        this.distributeItems(allItems);
        this.items = allItems;
        this.isPlaying = true;
    },

    // 分布物品逻辑
    distributeItems: function(items) {
        const margin = 60; // 增大边距
        // 限制在左侧游戏区域内
        const area = this.layout.gameArea;
        const maxAttempts = 150;
        const itemRadius = this.config.fontSize / 1.5;

        items.forEach(item => {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < maxAttempts) {
                // 随机坐标限制在 gameArea 内
                const x = area.x + margin + Math.random() * (area.w - margin * 2);
                const y = area.y + margin + Math.random() * (area.h - margin * 2);
                
                // 碰撞检测
                let overlap = false;
                for (const existing of items) {
                    if (existing === item || existing.x === undefined) continue;
                    const dx = x - existing.x;
                    const dy = y - existing.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    if (dist < itemRadius * 2.2) { 
                        overlap = true;
                        break;
                    }
                }
                
                if (!overlap) {
                    item.x = x;
                    item.y = y;
                    placed = true;
                }
                attempts++;
            }
            
            // 兜底位置
            if (!placed) {
                item.x = area.x + margin + Math.random() * (area.w - margin * 2);
                item.y = area.y + margin + Math.random() * (area.h - margin * 2);
            }
        });
    },

    // 游戏主循环启动
    startGameLoop: function() {
        this.startLevel();
        this.lastFrameTime = performance.now();
        this.loopId = requestAnimationFrame((ts) => this.loop(ts));
        
        // 绑定点击事件
        // 注意：这里覆盖了全局 canvas.onclick，退出时需要还原或处理
        canvas.onclick = (e) => {
            const {x, y} = windowToCanvas(canvas, e.clientX, e.clientY);
            this.handleClick(x, y);
        };
        
        // 绑定悬停事件
        canvas.onmousemove = (e) => {
            const {x, y} = windowToCanvas(canvas, e.clientX, e.clientY);
            if (this.backButton) this.backButton.setHovered(this.backButton.contains(x, y));
            if (this.pauseButton) this.pauseButton.setHovered(this.pauseButton.contains(x, y));
        };
    },
    
    // 停止游戏
    stop: function() {
        this.isPlaying = false;
        if (this.loopId) {
            cancelAnimationFrame(this.loopId);
            this.loopId = null;
        }
        canvas.onclick = null; // 清理事件
    },

    // 每一帧逻辑
    loop: function(timestamp) {
        if (!this.isPlaying) return;
        
        const dt = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;
        
        this.update(dt);
        this.draw();
        
        this.loopId = requestAnimationFrame((ts) => this.loop(ts));
    },

    update: function(dt) {
        if (this.timer > 0) {
            this.timer -= dt;
        }
        
        // 独立检查，防止因惩罚导致 timer <= 0 时无法触发结束
        if (this.timer <= 0) {
            this.timer = 0;
            this.gameOver(false);
        }
    },

    draw: function() {
        // 安全检查
        if (!this.layout || !this.layout.sidebar) {
            console.error("FocusGame.layout is undefined or incomplete!", this.layout);
            return;
        }

        // 清空背景
        ctx.clearRect(0, 0, W, H);
        
        // 绘制通用背景
        let bgImg = image;
        // 如果是日间模式，使用特定背景
        if (typeof currentTheme !== 'undefined' && currentTheme !== 'night') {
            bgImg = this.bgDay;
        }

        if (bgImg && bgImg.complete) {
            ctx.drawImage(bgImg, 0, 0, W, H);
        } else {
            ctx.fillStyle = '#fce4ec'; 
            ctx.fillRect(0, 0, W, H);
        }

        const sb = this.layout.sidebar;

        // 绘制右侧侧边栏背景 (半透明遮罩，区分区域)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(sb.x, sb.y, sb.w, sb.h);
        
        // 绘制分割线
        ctx.beginPath();
        ctx.moveTo(sb.x, 0);
        ctx.lineTo(sb.x, H);
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 2;
        ctx.stroke();

        // --- 侧边栏内容 ---
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const centerX = sb.x + sb.w / 2;
        let curY = 60;

        // 1. 目标提示
        ctx.fillStyle = '#333';
        ctx.font = 'bold 36px Microsoft YaHei';
        ctx.fillText("寻找目标", centerX, curY);
        curY += 80;

        // 目标大图标
        if (this.target) {
            ctx.font = '120px Arial'; // 超大目标图标
            ctx.fillText(this.target.char, centerX, curY);
        }
        curY += 100;

        // 2. 状态信息
        curY += 40;
        ctx.fillStyle = '#555';
        ctx.font = 'bold 28px Microsoft YaHei';
        ctx.fillText(`第 ${this.level} 关`, centerX, curY);
        curY += 50;
        ctx.fillText(`得分: ${this.score}`, centerX, curY);
        curY += 50;
        
        // 倒计时 (醒目颜色)
        ctx.fillStyle = this.timer < 5 ? '#e74c3c' : '#2ecc71';
        ctx.font = 'bold 32px Microsoft YaHei';
        ctx.fillText(`剩余 ${Math.ceil(this.timer)} 秒`, centerX, curY);

        // 3. 按钮
        if (this.backButton) this.backButton.draw();
        if (this.pauseButton) this.pauseButton.draw();

        // --- 游戏区域内容 ---
        ctx.save();
        // 限制绘制区域在左侧
        ctx.beginPath();
        ctx.rect(0, 0, this.layout.gameArea.w, H);
        ctx.clip();

        // 绘制所有图案
        ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
        this.items.forEach(item => {
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.angle);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000';
            ctx.fillText(item.char, 0, 0);
            ctx.restore();
        });
        ctx.restore();
    },

    handleClick: function(x, y) {
        if (!this.isPlaying) return;

        // 优先检查按钮点击
        if (this.backButton && this.backButton.isClicked(x, y)) {
            this.confirmExit();
            return;
        }
        if (this.pauseButton && this.pauseButton.isClicked(x, y)) {
            this.pauseGame();
            return;
        }

        // 判定点击
        let clicked = false;
        // 倒序遍历，优先响应上层（虽然我们做了防重叠）
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            const dx = x - item.x;
            const dy = y - item.y;
            // 简单的圆形判定
            if (dx*dx + dy*dy < (this.config.fontSize/1.8)**2) {
                this.checkItem(item);
                clicked = true;
                break;
            }
        }
    },

    checkItem: function(item) {
        if (item.isTarget) {
            // 答对了
            this.playAudio('correct');
            this.score += 10 + this.level * 2;
            this.level++;
            // 简单特效或延迟后下一关
            this.startLevel();
        } else {
            // 答错了
            this.playAudio('wrong');
            this.timer = Math.max(0, this.timer - 3); // 扣时惩罚
            // 可以添加一个错误震动效果
            this.shakeScreen();
        }
    },
    
    gameOver: function(success) {
        this.isPlaying = false;
        this.stop(); // 停止循环
        
        // 保存记录
        if(typeof saveFocusRecord === 'function') saveFocusRecord(this.score);

        // 强制重绘最后一帧以确保显示正确（如时间归零）
        this.draw();
        
        // 获取当前画面快照作为背景
        const snapshot = ctx.getImageData(0, 0, W, H);
        
        // 创建结算弹窗
        const title = success ? "恭喜过关" : "游戏结束"; // 虽然目前逻辑主要是时间到
        const message = `你的最终得分是: ${this.score}`;
        const dialog = new CanvasDialog(ctx, title, message, 400, 220, false, snapshot);
        
        dialog.okButton.text = "再玩一次";
        dialog.cancelButton.text = "返回主页";
        
        dialog.show(
            () => { // 确定 -> 重新开始
                this.init();
            },
            () => { // 取消 -> 返回主菜单
                if (typeof showFocusStartScreen === 'function') {
                    showFocusStartScreen();
                } else if (typeof showGamesPage === 'function') {
                    showGamesPage();
                } else {
                    location.reload();
                }
            }
        );
    },
    
    playAudio: function(type) {
        // 尝试播放全局音效
        try {
            if (type === 'correct' && typeof correctSound !== 'undefined') {
                correctSound.currentTime = 0;
                correctSound.play();
            } else if (type === 'wrong' && typeof wrongSound !== 'undefined') {
                wrongSound.currentTime = 0;
                wrongSound.play();
            }
        } catch (e) {
            console.warn('Audio play failed', e);
        }
    },
    
    shakeScreen: function() {
        // 简单的震动反馈（如果支持）
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }
        // 也可以实现 Canvas 震动效果，暂时略过
    },

    // 暂停游戏
    pauseGame: function() {
        this.isPlaying = false;
        if (this.loopId) cancelAnimationFrame(this.loopId);
        
        const snapshot = ctx.getImageData(0, 0, W, H);
        const dialog = new CanvasDialog(ctx, "暂停", "游戏已暂停", 400, 220, false, snapshot);
        dialog.okButton.text = "继续";
        dialog.cancelButton.text = "退出";
        
        dialog.show(
            () => { // 继续的回调
                this.isPlaying = true;
                this.lastFrameTime = performance.now();
                this.loopId = requestAnimationFrame((ts) => this.loop(ts));
                this.restoreEvents();
            },
            () => { // 退出（取消）的回调
                if (typeof showFocusStartScreen === 'function') {
                    showFocusStartScreen();
                } else if (typeof showGamesPage === 'function') {
                    showGamesPage();
                } else {
                    location.reload();
                }
            }
        );
    },

    // 确认退出
    confirmExit: function() {
        this.isPlaying = false;
        if (this.loopId) cancelAnimationFrame(this.loopId);
        
        const snapshot = ctx.getImageData(0, 0, W, H);
        const dialog = new CanvasDialog(ctx, "退出游戏", "确定要返回主菜单吗？", 400, 220, false, snapshot);
        
        dialog.show(
            () => { // 确定的回调 -> 退出
                if (typeof showFocusStartScreen === 'function') {
                    showFocusStartScreen();
                } else if (typeof showGamesPage === 'function') {
                    showGamesPage();
                } else {
                    location.reload();
                }
            },
            () => { // 取消的回调 -> 继续
                this.isPlaying = true;
                this.lastFrameTime = performance.now();
                this.loopId = requestAnimationFrame((ts) => this.loop(ts));
                this.restoreEvents();
            }
        );
    },

    // 恢复事件绑定
    restoreEvents: function() {
        canvas.onclick = (e) => {
            const {x, y} = windowToCanvas(canvas, e.clientX, e.clientY);
            this.handleClick(x, y);
        };
        canvas.onmousemove = (e) => {
            const {x, y} = windowToCanvas(canvas, e.clientX, e.clientY);
            if (this.backButton) this.backButton.setHovered(this.backButton.contains(x, y));
            if (this.pauseButton) this.pauseButton.setHovered(this.pauseButton.contains(x, y));
        };
    }
};

// 暴露全局入口
window.startFocusGame = function(level = 1) {
    FocusGame.init(level);
};
