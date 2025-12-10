

image.onload=onImageLoad;                              // 背景图加载后进入主页面

function init(){                                       // 初始化：基本绘图与背景图
    ctx.font="bold 48px Times New Roman";              // 默认字体
    ctx.textAlign='center'; ctx.textBaseline='middle'; // 默认居中
    image.src="src/bg.jpg";                            // 背景图路径
    ctx.fillStyle='#444444ff';                         // 默认填充色
}

init();                                                // 执行初始化