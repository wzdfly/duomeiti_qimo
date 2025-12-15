let FW_rockets = [];
let FW_particles = [];
let FW_lastSpawnTs = 0;

function fireworksReset(){
    FW_rockets = [];
    FW_particles = [];
    FW_lastSpawnTs = 0;
}

function fireworksTick(ctx, ts, W, H){
    spawnFireworks(ts, W, H);
    updateAndPaintFireworks(ctx, ts);
}

function spawnFireworks(ts, W, H){
    if(!FW_lastSpawnTs) FW_lastSpawnTs = ts;
    const interval = 600 + Math.random()*800;
    if(ts - FW_lastSpawnTs > interval){
        FW_lastSpawnTs = ts;
        const rocket = new Sprite('rocket',{
            paint(s,c){
                c.save();
                c.shadowColor = 'rgba(255,220,150,0.6)';
                c.shadowBlur = 12;
                c.globalAlpha = 0.95;
                c.fillStyle = '#ffd54f';
                c.beginPath();
                c.arc(s.left, s.top, s.radius, 0, Math.PI*2);
                c.fill();
                c.restore();
            }
        },[
            {execute(s){
                s.top -= s.speed;
                if(s.top <= s.targetY){
                    s.visible = false;
                    createFireworksExplosion(s.left, s.top, s.explodeSize);
                }
            }}
        ]);
        rocket.left = 60 + Math.random()*(W-120);
        rocket.top = H - 10;
        rocket.radius = 8 + Math.random()*14;
        rocket.speed = 6 + Math.random()*8;
        rocket.targetY = H/2 - Math.random()*200;
        rocket.explodeSize = 14 + Math.random()*10;
        FW_rockets.push(rocket);
    }
}

function createFireworksExplosion(cx, cy, size){
    const count = 40 + Math.floor(Math.random()*40);
    for(let i=0;i<count;i++){
        const angle = Math.random()*Math.PI*2;
        const speed = 2 + Math.random()*5;
        const vx = Math.cos(angle)*speed;
        const vy = Math.sin(angle)*speed;
        const color = `hsl(${Math.floor(Math.random()*360)}, 90%, 60%)`;
        const p = new Sprite('particle',{
            paint(s,c){
                c.save();
                c.globalAlpha = s.alpha;
                c.fillStyle = color;
                c.beginPath();
                c.arc(s.left, s.top, s.radius, 0, Math.PI*2);
                c.fill();
                c.restore();
            }
        },[
            {execute(s){
                s.left += s.vx;
                s.top += s.vy;
                s.vy += 0.04;
                s.radius *= 0.98;
                s.alpha -= 0.015;
                if(s.alpha <= 0 || s.radius < 0.5) s.visible = false;
            }}
        ]);
        p.left = cx; p.top = cy;
        p.vx = vx; p.vy = vy;
        p.radius = size * (0.6 + Math.random()*0.6);
        p.alpha = 1;
        FW_particles.push(p);
    }
}

function updateAndPaintFireworks(ctx, ts){
    const arrR = [];
    for(const r of FW_rockets){
        r.update(ctx, ts);
        if(r.visible){ r.paint(ctx); arrR.push(r); }
    }
    FW_rockets = arrR;
    const arrP = [];
    for(const p of FW_particles){
        p.update(ctx, ts);
        if(p.visible){ p.paint(ctx); arrP.push(p); }
    }
    FW_particles = arrP;
}
