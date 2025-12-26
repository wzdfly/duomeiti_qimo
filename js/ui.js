
// 文件作用：UI 组件与绘图辅助（圆角矩形、按钮、弹窗、动画调度）

function roundRect(ctx,x,y,w,h,r,fill,stroke){         // 绘制圆角矩形
    if(typeof r==="undefined") r=5;                     // 默认圆角半径 5
    ctx.beginPath();                                    // 开始路径
    ctx.moveTo(x+r,y);                                  // 顶边起点
    ctx.lineTo(x+w-r,y);                                // 顶边线
    ctx.quadraticCurveTo(x+w,y,x+w,y+r);                // 右上角圆角
    ctx.lineTo(x+w,y+h-r);                              // 右边线
    ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);            // 右下角圆角
    ctx.lineTo(x+r,y+h);                                // 底边线
    ctx.quadraticCurveTo(x,y+h,x,y+h-r);                // 左下角圆角
    ctx.lineTo(x,y+r);                                  // 左边线
    ctx.quadraticCurveTo(x,y,x+r,y);                    // 左上角圆角
    ctx.closePath();                                    // 闭合路径
    if(fill) ctx.fill();                                // 填充
    if(stroke) ctx.stroke();                            // 描边
}

class CanvasButton{                                     // 画布按钮组件
    constructor(ctx,x,y,w,h,text,color1="#ffbd4cff",color2="#fb7209ff"){ // 构造函数
        this.ctx=ctx;                                   // 绘图上下文
        this.x=x; this.y=y;                             // 左上角坐标
        this.w=w; this.h=h;                             // 按钮尺寸
        this.text=text;                                 // 文本内容
        this.color1=color1; this.color2=color2;         // 渐变颜色
        this.radius=10;                                 // 圆角半径
        this.scale=1.0;                                 // 当前缩放（悬停）
        this.targetScale=1.0;                           // 目标缩放（1.12 悬停）
        this.hovered=false;                             // 悬停状态
    }
    draw(){                                             // 绘制按钮（按缩放）
        const ctx=this.ctx;                             // 引用 ctx
        const s=this.scale||1;                          // 当前缩放
        const w=this.w*s, h=this.h*s;                   // 缩放后尺寸
        const x=this.x+(this.w-w)/2;                    // 居中偏移 X
        const y=this.y+(this.h-h)/2;                    // 居中偏移 Y
        const grad=ctx.createLinearGradient(x,y,x,y+h); // 垂直渐变
        grad.addColorStop(0,this.color1);               // 渐变顶部色
        grad.addColorStop(1,this.color2);               // 渐变底部色
        ctx.fillStyle=grad;                             // 设置填充
        ctx.shadowColor="rgba(0,0,0,0.2)";              // 阴影颜色（减淡）
        ctx.shadowBlur=6; ctx.shadowOffsetX=2;          // 阴影模糊与偏移
        ctx.shadowOffsetY=3;                            // 阴影 Y 偏移
        roundRect(ctx,x,y,w,h,this.radius,true,false);  // 绘制圆角按钮（无描边）
        ctx.shadowColor="transparent";                  // 关闭阴影
        ctx.fillStyle="#fff";                           // 文本颜色
        ctx.font="bold 28px Microsoft YaHei";           // 文本字体大小
        ctx.textAlign="center"; ctx.textBaseline="middle"; // 文本居中
        ctx.fillText(this.text,x+w/2,y+h/2);            // 绘制按钮文本
    }
    isClicked(mx,my){                                   // 点击命中检测
        return this.contains(mx,my);                    // 使用包含检测
    }
    contains(mx,my){                                    // 包含检测（考虑缩放）
        const s=this.scale||1;                          // 当前缩放
        const w=this.w*s, h=this.h*s;                   // 缩放尺寸
        const x=this.x+(this.w-w)/2;                    // 偏移后 X
        const y=this.y+(this.h-h)/2;                    // 偏移后 Y
        return mx>=x && mx<=x+w && my>=y && my<=y+h;    // 矩形命中判断
    }
    setHovered(flag){                                   // 设置悬停状态
        const prev=this.hovered;                        // 之前状态
        this.hovered=!!flag;                            // 规范化布尔
        this.targetScale=this.hovered?1.12:1.0;         // 更新目标缩放
        return prev!==this.hovered;                     // 返回是否变化
    }
    stepAnimation(){                                    // 缓动到目标缩放
        if(Math.abs(this.scale-this.targetScale)>0.01){ // 未接近目标
            this.scale+=(this.targetScale-this.scale)*0.25; // 插值缓动
            return true;                                // 仍在动画中
        }else{ this.scale=this.targetScale; return false;} // 对齐目标
    }
}

class CanvasDialog{                                     // 弹窗组件（标题/消息/按钮）
    constructor(ctx,title,message,width=400,height=220,singleButton=false,snapshot=null){ // 构造参数
        this.ctx=ctx;                                   // 上下文
        this.title=title; this.message=message;         // 标题与消息
        this.width=width; this.height=height;           // 尺寸
        this.x=(W-width)/2; this.y=(H-height)/2;        // 居中位置
        this.singleButton=singleButton;                 // 是否单按钮
        this.opacity=0;                                 // 淡入透明度
        this.snapshot=snapshot;                         // 背景快照
        const btnY=this.y+height-70;                    // 按钮 Y
        if(singleButton){                               // 单按钮：居中 OK
            this.okButton=new CanvasButton(ctx,this.x+width/2-60,btnY,120,50,"确定","#4CAF50","#388E3C"); // OK 按钮
        }else{                                          // 双按钮：OK 与取消
            this.okButton=new CanvasButton(ctx,this.x+50,btnY,120,50,"确定","#4CAF50","#388E3C");         // OK 按钮
            this.cancelButton=new CanvasButton(ctx,this.x+width-170,btnY,120,50,"取消","#FF5252","#D32F2F"); // 取消按钮
        }
        this.callback=null; this.active=false;          // 回调与激活状态
    }
    show(callback, cancelCallback){
        this.active=true; this.callback=callback; this.cancelCallback=cancelCallback;
        this.animateIn();
    }
    animateIn(){                                        // 淡入动画逻辑
        this.opacity+=0.1; if(this.opacity>1) this.opacity=1; // 增加透明度
        this.draw();                                    // 重绘
        if(this.opacity<1) requestAnimationFrame(()=>this.animateIn()); // 继续动画
        else this.bindClick();                          // 绑定事件
    }
    bindClick(){                                       // 绑定点击与悬停事件
        canvas.onclick=(e)=>{                           // 点击事件
            const {x,y}=windowToCanvas(canvas,e.clientX,e.clientY); // 坐标换算
            if(!this.active) return;                    // 未激活忽略
            if(this.okButton.isClicked(x,y)){
                this.active=false; if(this.callback) this.callback();
            }else if(!this.singleButton && this.cancelButton.isClicked(x,y)){
                this.active=false;
                if(typeof this.cancelCallback === 'function'){ this.cancelCallback(); }
                else { if(this.snapshot) ctx.putImageData(this.snapshot,0,0); bindCurrentPageEvents(); }
            }
        };
        canvas.onmousemove=(e)=>{                       // 悬停放大
            if(!this.active) return;                    // 未激活忽略
            const {x,y}=windowToCanvas(canvas,e.clientX,e.clientY); // 坐标换算
            const changed=this.okButton.setHovered(this.okButton.contains(x,y)) || // OK 悬停
                (!this.singleButton && this.cancelButton.setHovered(this.cancelButton.contains(x,y))); // 取消悬停
            if(changed){                                 // 状态变化则动画
                animateButtons(()=>this.draw(),[this.okButton,this.cancelButton].filter(Boolean)); // 驱动动画重绘
            }
        };
    }
    draw(){                                            // 绘制弹窗元素
        const ctx=this.ctx;                            // 上下文引用
        if(this.snapshot) ctx.putImageData(this.snapshot,0,0); // 还原底图
        const dialogTheme2 = getDialogTheme();
        ctx.fillStyle=`rgba(0,0,0,${dialogTheme2.overlayAlpha*this.opacity})`; ctx.fillRect(0,0,W,H);
        ctx.fillStyle=`rgba(255,255,255,${this.opacity})`; // 白底
        ctx.shadowColor="rgba(0,0,0,0.5)"; ctx.shadowBlur=12; // 阴影
        ctx.shadowOffsetX=0; ctx.shadowOffsetY=4;      // 阴影偏移
        roundRect(ctx,this.x,this.y,this.width,this.height,15,true,true); // 弹窗框
        ctx.shadowColor="transparent";                 // 关闭阴影
        const dialogTheme = getDialogTheme();
        const grad=ctx.createLinearGradient(this.x,this.y,this.x,this.y+50);
        grad.addColorStop(0, dialogTheme.titleTop); grad.addColorStop(1, dialogTheme.titleBottom);
        ctx.fillStyle=grad; roundRect(ctx,this.x,this.y,this.width,50,15,true,false); // 标题栏
        ctx.fillStyle="#fff"; ctx.font="bold 26px Microsoft YaHei"; // 标题文字样式
        ctx.textAlign="center"; ctx.textBaseline="middle"; // 居中
        ctx.fillText(this.title,this.x+this.width/2,this.y+25); // 写标题
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = getTextColor('text');
        ctx.font="22px Microsoft YaHei";
        ctx.fillText(this.message,this.x+this.width/2,this.y+100);
        ctx.restore();
        this.okButton.draw(); if(!this.singleButton) this.cancelButton.draw(); // 绘制按钮
    }
}

function animateButtons(redrawFn,buttons){             // 悬停放大动画驱动器
    function tick(){                                   // 单帧执行
        let moving=false;                              // 是否仍在动画
        for(const btn of buttons){                     // 遍历按钮
            if(btn && btn.stepAnimation()) moving=true; // 步进动画
        }
        redrawFn();                                    // 重绘画面
        if(moving) requestAnimationFrame(tick);        // 若动画继续，排队下一帧
    }
    requestAnimationFrame(tick);                       // 启动动画循环
}
