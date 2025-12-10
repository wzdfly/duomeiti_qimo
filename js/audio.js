
// 文件作用：创建并配置背景音乐与点击音效

let bgMusic = new Audio("audio/bgm.ogg");
let correctSound = new Audio("audio/correct.mp3");
let wrongSound = new Audio("audio/wrong.mp3");
let normalSound = new Audio("audio/normal.mp3");

bgMusic.loop = true;
try{
    const savedVolume = localStorage.getItem('volume');
    const vol = savedVolume!==null ? Math.max(0, Math.min(1, parseFloat(savedVolume)||0.5)) : 0.5;
    bgMusic.volume = vol;
    correctSound.volume = vol;
    wrongSound.volume = vol;
    normalSound.volume = vol;
}catch(e){ bgMusic.volume = 0.5; }
