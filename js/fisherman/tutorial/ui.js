window.FT = window.FT || {};
FT.UI = {
    overlay: null,
    box: null,
    canvas: null,
    ctx: null,

    init: function() {
        if (this.overlay) return; // Prevent double init
        this.injectStyles();
        this.createDOM();
        this.bindEvents();
        this.canvas = document.getElementById('tutorial-canvas');
        this.ctx = this.canvas.getContext('2d');
    },

    injectStyles: function() {
        if (document.getElementById('tutorial-styles')) return;
        const style = document.createElement('style');
        style.id = 'tutorial-styles';
        style.textContent = `
            #tutorial-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.7); display: none;
                justify-content: center; align-items: center; z-index: 1000;
                opacity: 0; transition: opacity 0.3s ease;
            }
            #tutorial-overlay.visible { opacity: 1; }
            #tutorial-box {
                background: #fff; padding: 20px; border-radius: 15px;
                box-shadow: 0 0 20px rgba(0,0,0,0.5); width: 500px;
                display: flex; flex-direction: column; align-items: center;
                position: relative; transform: scale(0.8); transition: transform 0.3s ease;
            }
            #tutorial-overlay.visible #tutorial-box { transform: scale(1); }
            #tutorial-canvas {
                background: #e3f2fd; border-radius: 10px; border: 2px solid #90caf9;
                margin-bottom: 20px; box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
            }
            #tutorial-close-btn {
                background: #FF7043; color: white; border: none; padding: 10px 30px;
                border-radius: 25px; fontSize: 18px; cursor: pointer;
                font-family: 'Microsoft YaHei', sans-serif; transition: background 0.2s;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            #tutorial-close-btn:hover { background: #F4511E; }
            #tutorial-title {
                font-family: 'Microsoft YaHei', sans-serif; font-size: 24px; color: #333;
                margin-bottom: 15px; font-weight: bold;
            }
            #tutorial-desc {
                font-family: 'Microsoft YaHei', sans-serif; font-size: 16px; color: #666;
                margin-bottom: 15px; text-align: center;
            }
        `;
        document.head.appendChild(style);
    },

    createDOM: function() {
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.innerHTML = `
            <div id="tutorial-box">
                <div id="tutorial-title">玩法演示</div>
                <div id="tutorial-desc">左右摆动，点击下钩，抓到鱼加分</div>
                <canvas id="tutorial-canvas" width="${FT.config.W}" height="${FT.config.H}"></canvas>
                <button id="tutorial-close-btn">我知道了</button>
            </div>
        `;
        document.body.appendChild(overlay);
        this.overlay = overlay;
    },

    bindEvents: function() {
        const closeBtn = document.getElementById('tutorial-close-btn');
        closeBtn.onclick = () => FT.Game.stop();
        this.overlay.onclick = (e) => {
            if(e.target === this.overlay) FT.Game.stop();
        };
    },

    show: function() {
        this.overlay.style.display = 'flex';
        this.overlay.offsetHeight; // force reflow
        this.overlay.classList.add('visible');
    },

    hide: function() {
        this.overlay.classList.remove('visible');
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, 300);
    }
};