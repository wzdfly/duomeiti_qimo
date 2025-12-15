// 文件作用：游戏计时器逻辑

function startGameTimer(){                             // 启动游戏计时器（每秒+1）
    if(gameInterval) clearInterval(gameInterval);      // 防止重复
    gameInterval=setInterval(()=>{ gameTimer++; drawGameGrid(); },1000); // 自增并重绘
}