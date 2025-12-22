
// 文件作用：提供 Canvas/上下文/尺寸与背景图对象，供其他模块使用

let canvas = document.getElementById("myCanvas");      // 获取画布元素
let ctx = canvas.getContext("2d");                     // 获取 2D 绘图上下文
let W = canvas.width;                                  // 画布宽度（像素）
let H = canvas.height;                                 // 画布高度（像素）
let image = new Image();                               // 背景图像对象（延后设置 src）