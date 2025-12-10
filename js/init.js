

image.onload=onImageLoad;                              // 背景图加载后进入主页面

function init(){                                       // 初始化：基本绘图与背景图
    ctx.font="bold 48px Times New Roman";              // 默认字体
    ctx.textAlign='center'; ctx.textBaseline='middle'; // 默认居中
    try{
        const savedTheme = localStorage.getItem('theme');
        if(savedTheme) currentTheme = savedTheme;
        const savedVolume = localStorage.getItem('volume');
        if(savedVolume!==null) currentVolume = Math.max(0, Math.min(1, parseFloat(savedVolume))||0.5);
        setVolume(currentVolume);
    }catch(e){}
    image.src = themeBgSrc(currentTheme);
    ctx.fillStyle='#444444ff';                         // 默认填充色
}

init();                                                // 执行初始化
