
// 文件作用：创建并配置背景音乐与点击音效

let bgMusic = new Audio("audio/bgm.ogg");              // 背景音乐音频
let correctSound = new Audio("audio/correct.mp3");     // 正确点击音效
let wrongSound = new Audio("audio/wrong.mp3");         // 错误点击音效
let normalSound = new Audio("audio/normal.mp3");       // 游戏开始提示音

bgMusic.loop = true;                                   // 背景音乐循环播放
bgMusic.volume = 0.5;                                  // 背景音乐音量（0.0~1.0）