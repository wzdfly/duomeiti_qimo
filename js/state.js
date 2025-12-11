
// 文件作用：声明各页面/游戏逻辑用到的全局状态变量

let startButton = null;                                // 主页面“开始游戏”按钮实例
let achievementsButton = null;                         // 主页面“关卡”按钮实例
let backButton = null;                                 // 成就页“返回”按钮实例
let clearRecordsButton = null;                         // 成就页“清除记录”按钮实例

let startScreenData = null;                            // 主页面静态像素快照
let achievementsScreenData = null;                     // 成就/关卡/设置页静态像素快照

let hintText = "";                                     // 顶部提示文本（点错提示）
let flashCellIndex = null;                             // 当前闪烁高亮的格子索引
let flashInterval = null;                              // 闪烁定时器句柄
let flashToggle = false;                               // 闪烁开关（绘制时控制显隐）

let countdownValue = 3;                                // 倒计时数值（初始 3）
let countdownInterval = null;                          // 倒计时定时器句柄

let startNumbers = null;                               // 主页面预览网格的数字数组（打乱）

// --- 开场场景（烟花）状态 ---
let startIntroPhase = 'idle';                           // 开场场景阶段：idle/ascend/explode/buttons
let startIntroAnimationId = null;                      // 开场动画循环的 RAF 句柄
let rocketSprite = null;                               // 烟花火箭精灵
let particleSprites = [];                              // 爆炸粒子精灵数组
let firstIntroPlayed = false;                          // 开场烟花是否已播放过

let gridNumbers = [];                                  // 游戏网格数字 1..25（打乱）
let cellStates = [];                                   // 格子状态：0默认/1正确/2错误
let currentNumber = 1;                                 // 当前应点击的数字
let gridRows = 5, gridCols = 5, gridSize = 90;         // 网格行/列数量与格子尺寸
let gridX = 0, gridY = 0;                              // 网格左上角坐标（绘制时计算）
let gameInterval = null;                               // 游戏计时器句柄
let gameTimer = 0;                                     // 游戏计时（秒累计）

let gameBackButton = null;                             // 游戏页“返回”按钮实例
let gameRefreshButton = null;                          // 游戏页“刷新”按钮实例

let currentLevel = 1;                                  // 当前关卡：1/2/3
let levelsSpec = {                                     // 关卡配置
    1: { rows: 3, cols: 3, size: 120 },
    2: { rows: 4, cols: 4, size: 100 },
    3: { rows: 5, cols: 5, size: 90 }
};

let level1Button = null;                               // 关卡页“第一关”按钮实例
let level2Button = null;                               // 关卡页“第二关”按钮实例
let level3Button = null;                               // 关卡页“第三关”按钮实例

let currentTheme = 'day';                              // 主题：day/night
let currentVolume = 0.5;                               // 全局音量 0..1
let settingsButton = null;                             // 主页面“设置”按钮实例

let loadProgress = 0;                                  // 资源加载进度 0..1
let resourceLoadStarted = false;                       // 是否已开始资源加载

let currentMode = 'reaction';                          // 模式：reaction/memory
let reactionButton = null;                             // 主页面“反应模式”按钮实例
let memoryButton = null;                               // 主页面“记忆模式”按钮实例
let numbersHidden = false;                             // 记忆模式：是否隐藏数字
let memoryCountdownValue = 10;                         // 记忆预览倒计时
let memoryCountdownInterval = null;                    // 记忆预览倒计时定时器
