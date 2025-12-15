// 文件作用：错误提示/正确格子外框闪烁效果

function startFlashNextCell(){                         // 开始闪烁正确目标格外框
    const idx=gridNumbers.indexOf(currentNumber);      // 查找当前目标数字位置
    if(idx===-1) return;                               // 未找到直接返回
    flashCellIndex=idx; flashToggle=true; let count=0; // 记录索引与开关/计数
    if(flashInterval) clearInterval(flashInterval);    // 清理旧定时器
    flashInterval=setInterval(()=>{                    // 闪烁定时器
        flashToggle=!flashToggle; drawGameGrid(); count++; // 翻转/重绘/计数
        if(count>=8){ stopFlash(); drawGameGrid(); }   // 约 1.6s 后停止闪烁
    },200);                                            // 每 200ms 切换一次
}

function stopFlash(){                                  // 停止闪烁并清理状态
    if(flashInterval){ clearInterval(flashInterval); flashInterval=null; } // 清定时器
    flashCellIndex=null; flashToggle=false;            // 清索引与开关
}