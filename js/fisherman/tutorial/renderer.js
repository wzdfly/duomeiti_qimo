window.FT = window.FT || {};
FT.Renderer = {
    draw: function() {
        const ctx = FT.UI.ctx;
        if (!ctx) return;
        
        const W = FT.config.W;
        const H = FT.config.H;
        const state = FT.state;
        const hook = state.hook;

        ctx.clearRect(0, 0, W, H);

        this.drawBackground(ctx, W, H);
        this.drawWaves(ctx, W, H, state.waveT);
        this.drawHook(ctx, hook);
        this.drawFishes(ctx, state.fishes);
        this.drawUI(ctx, W, H, state);
    },

    drawBackground: function(ctx, W, H) {
        // Sky
        let g = ctx.createLinearGradient(0, 0, 0, H);
        FT.config.colors.sky.forEach((c, i) => g.addColorStop(i * 0.33, c));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        // Sea
        let seaG = ctx.createLinearGradient(0, 100, 0, H);
        FT.config.colors.sea.forEach((c, i) => seaG.addColorStop(i * 0.5, c));
        ctx.fillStyle = seaG;
        ctx.fillRect(0, 100, W, H - 100);
    },

    drawWaves: function(ctx, W, H, t) {
        const drawLayer = (t, yOff, color, amp) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            let startY = 100 + yOff;
            ctx.moveTo(0, startY);
            for(let x=0; x<=W; x+=10) {
                ctx.lineTo(x, startY + Math.sin(x*0.02 + t) * amp);
            }
            ctx.lineTo(W, H); ctx.lineTo(0, H);
            ctx.fill();
        };
        drawLayer(t * 0.5, 10, 'rgba(1, 87, 155, 0.3)', 8);
        drawLayer(t * 0.8, 5, 'rgba(3, 169, 244, 0.2)', 5);
        drawLayer(t * 1.2, 0, 'rgba(179, 229, 252, 0.2)', 3);
    },

    drawHook: function(ctx, hook) {
        const origin = FT.config.origin;
        // Pole
        ctx.fillStyle = '#795548';
        ctx.fillRect(origin.x - 4, 0, 8, origin.y);

        // Line
        let hx = origin.x + Math.sin(hook.angle) * hook.length;
        let hy = origin.y + Math.cos(hook.angle) * hook.length;
        
        ctx.strokeStyle = FT.config.colors.hookLine;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(hx, hy);
        ctx.stroke();

        // Head
        ctx.save();
        ctx.translate(hx, hy);
        ctx.rotate(-hook.angle);
        
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.strokeStyle = FT.config.colors.hookBody;
        ctx.lineWidth = 5;

        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(0, 25);
        ctx.arc(15, 25, 15, Math.PI, 0, true);
        ctx.lineTo(30, 15); ctx.stroke();

        ctx.beginPath(); ctx.moveTo(30, 15); ctx.lineTo(24, 21); ctx.stroke(); // Barb

        ctx.fillStyle = FT.config.colors.hookBody;
        ctx.beginPath(); ctx.arc(0, -3, 5, 0, Math.PI*2); ctx.fill(); // Eye
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(0, -3, 2.5, 0, Math.PI*2); ctx.fill(); // Hole

        // Caught fish
        if(hook.caughtFish && hook.caughtFish.active) {
            ctx.save();
            ctx.translate(15, 30);
            ctx.rotate(Math.PI/2);
            this.drawFishBody(ctx, hook.caughtFish);
            ctx.restore();
        }
        ctx.restore();
    },

    drawFishes: function(ctx, fishes) {
        fishes.forEach(f => {
            if(f.active && !f.caught) {
                ctx.save();
                ctx.translate(f.x, f.y);
                if(f.dir < 0) ctx.scale(-1, 1);
                this.drawFishBody(ctx, f);
                ctx.restore();
            }
        });
    },

    drawFishBody: function(ctx, f) {
        ctx.fillStyle = '#ff7043';
        ctx.beginPath();
        ctx.ellipse(0, 0, f.radius, f.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef6c00';
        ctx.beginPath();
        ctx.moveTo(-f.radius, f.radius * 0.1);
        ctx.lineTo(-f.radius - 12, 0);
        ctx.lineTo(-f.radius, f.radius * -0.1);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(f.radius * 0.6, -f.radius * 0.1, 4, 0, Math.PI * 2);
        ctx.fill();
    },

    drawUI: function(ctx, W, H, state) {
        if(state.showClickHint) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath(); ctx.arc(W/2, H/2, 40, 0, Math.PI*2); ctx.fill();
            
            ctx.fillStyle = '#e65100'; ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center'; ctx.fillText('点击!', W/2, H/2+5);
            
            ctx.strokeStyle = '#e65100'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(W/2, H/2, 35, 0, Math.PI*2); ctx.stroke();
        }

        if(state.status === 'score') {
            ctx.fillStyle = '#ffeb3b'; ctx.font = 'bold 40px Arial';
            ctx.strokeStyle = '#f57f17'; ctx.lineWidth = 2;
            ctx.textAlign = 'center';
            ctx.fillText('+10', FT.config.origin.x, FT.config.origin.y + 50);
            ctx.strokeText('+10', FT.config.origin.x, FT.config.origin.y + 50);
        }

        ctx.fillStyle = '#fff';
        ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 4;
        ctx.font = '16px Microsoft YaHei'; ctx.textAlign = 'center';
        let text = '';
        switch(state.status) {
            case 'swing': text = '瞄准游动的鱼...'; break;
            case 'drop': case 'drop_hint': text = '点击屏幕放下鱼钩'; break;
            case 'catch': text = '抓住了！'; break;
            case 'retrieve': text = '自动收线...'; break;
            case 'score': text = '得分！'; break;
        }
        ctx.fillText(text, W/2, H - 20);
        ctx.shadowBlur = 0;
    }
};