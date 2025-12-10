// 文件作用：成就页与记录管理（读取/保存/清空/展示）

function saveRecord(duration){                         // 保存单局用时到本地
    let records=JSON.parse(localStorage.getItem("records")||"[]"); // 读取记录
    records.push(duration);                            // 添加新成绩
    localStorage.setItem("records",JSON.stringify(records)); // 写回本地
}

function getRecord(){                                  // 获取所有记录
    let records=JSON.parse(localStorage.getItem("records")||"[]"); // 读取数据
    return records;                                    // 返回数组
}

function clearRecords(){                               // 清空记录（确认弹窗）
    const snapshot=ctx.getImageData(0,0,W,H);          // 抓取当前画面快照
    const dialog=new CanvasDialog(ctx,"清除记录","确定要清除所有记录吗？",400,220,false,snapshot); // 确认弹窗
    dialog.show(()=>{                                  // 显示并设置确定回调
        localStorage.removeItem("records");            // 删除本地记录
        const tipDialog=new CanvasDialog(ctx,"提示","记录已清除！",360,180,true,snapshot); // 提示弹窗
        tipDialog.show(()=>{ showAchievements(); });   // 关闭后返回成就页
    });
}

function showAchievements(){                           // 成就页：显示统计与按钮
    ctx.clearRect(0,0,W,H);                            // 清空画布
    const records=getRecord();                         // 获取记录数组
    ctx.fillStyle="#333"; ctx.font="bold 48px Microsoft YaHei"; // 标题样式
    ctx.textAlign="center"; ctx.fillText("个人成就",W/2,80); // 绘制标题
    ctx.font="bold 32px Microsoft YaHei";              // 文本样式
    ctx.fillText(`游戏次数: ${records.length}`,W/2,150); // 游戏次数
    ctx.fillText(`总计时: ${records.reduce((a,b)=>a+b,0)} 秒`,W/2,200); // 总计时
    backButton=new CanvasButton(ctx,W/2-220,H-100,180,60,"返回","#4CAF50","#388E3C"); // 返回按钮
    clearRecordsButton=new CanvasButton(ctx,W/2+40,H-100,180,60,"清除记录","#FF5252","#D32F2F"); // 清除按钮
    backButton.draw(); clearRecordsButton.draw();      // 绘制按钮
    achievementsScreenData=ctx.getImageData(0,0,W,H); // 缓存成就页像素
    bindCurrentPageEvents();                           // 绑定成就页事件（含悬停）
}

function bindCurrentPageEvents(){                      // 成就页事件绑定
    if(backButton && clearRecordsButton){              // 两个按钮已初始化
        canvas.onclick=function(e){                    // 点击事件
            const {x,y}=windowToCanvas(canvas,e.clientX,e.clientY); // 坐标换算
            if(backButton.isClicked(x,y)) returnToMainMenu(); // 返回主页面
            else if(clearRecordsButton.isClicked(x,y)) clearRecords(); // 执行清除
        };
        function redrawAchievementsButtons(){          // 悬停动画重绘
            ctx.putImageData(achievementsScreenData,0,0); // 还原背景
            backButton.draw(); clearRecordsButton.draw(); // 重绘按钮
        }
        canvas.onmousemove=function(e){                // 悬停放大
            const {x,y}=windowToCanvas(canvas,e.clientX,e.clientY); // 坐标换算
            const changed=backButton.setHovered(backButton.contains(x,y)) || // 返回悬停
                           clearRecordsButton.setHovered(clearRecordsButton.contains(x,y)); // 清除悬停
            if(changed) animateButtons(redrawAchievementsButtons,[backButton,clearRecordsButton]); // 动画驱动
        };
    }
}