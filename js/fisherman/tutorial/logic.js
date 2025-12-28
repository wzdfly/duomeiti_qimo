window.FT = window.FT || {};
FT.Logic = {
    reset: function() {
        FT.Entities.resetHook();
        FT.state.fishes = [];
        for(let i=0; i<4; i++) FT.state.fishes.push(FT.Entities.createFish(i));
        
        FT.state.score = 0;
        FT.state.status = 'swing';
        FT.state.timer = 0;
        FT.state.showClickHint = false;
        FT.state.waveT = 0;
    },

    update: function() {
        const state = FT.state;
        const config = FT.config;
        
        state.timer++;
        state.waveT += 0.02;

        this.updateFishes();
        if(state.hook.caughtFish) this.syncCaughtFish();
        this.updateState();
    },

    updateFishes: function() {
        FT.state.fishes.forEach(f => {
            if(!f.caught) {
                f.x += f.speed * f.dir;
                if(f.x > FT.config.W + 50) {
                    f.x = -50;
                    f.y = 150 + Math.random() * 100;
                    f.speed = 1.5 + Math.random() * 1.5;
                }
            }
        });
    },

    syncCaughtFish: function() {
        const hook = FT.state.hook;
        const origin = FT.config.origin;
        if(hook.caughtFish) {
            hook.caughtFish.x = origin.x + Math.sin(hook.angle) * hook.length;
            hook.caughtFish.y = origin.y + Math.cos(hook.angle) * hook.length;
        }
    },

    updateState: function() {
        const state = FT.state;
        const hook = state.hook;
        const origin = FT.config.origin;

        switch(state.status) {
            case 'swing':
                hook.angle = Math.sin(state.waveT * 2) * 1.2;
                hook.length = 30;
                // Auto drop logic
                if(state.fishes.some(f => f.x > 180 && f.x < 260 && !f.caught)) {
                    state.status = 'drop_hint';
                }
                break;

            case 'drop_hint':
                hook.angle = Math.sin(state.waveT * 2) * 1.2;
                state.showClickHint = true;
                if(state.timer % 40 === 0) {
                    state.status = 'drop';
                    state.showClickHint = false;
                }
                break;

            case 'drop':
                hook.length += 5;
                let hx = origin.x + Math.sin(hook.angle) * hook.length;
                let hy = origin.y + Math.cos(hook.angle) * hook.length;
                
                // Collision
                if(!hook.caughtFish) {
                    for(let f of state.fishes) {
                        if(f.caught) continue;
                        let distSq = (hx - f.x)**2 + (hy - f.y)**2;
                        let catchRad = (f.radius + 10) * 1.5;
                        if(distSq < catchRad**2) {
                            state.status = 'retrieve';
                            f.caught = true;
                            hook.caughtFish = f;
                            break;
                        }
                    }
                }
                
                if(hook.length > 250 || hx < 0 || hx > FT.config.W || hy > 320) {
                    state.status = 'retrieve';
                }
                break;

            case 'retrieve':
                hook.length -= 5;
                if(hook.length <= 30) {
                    hook.length = 30;
                    if(hook.caughtFish) {
                        state.score += 10;
                        state.status = 'score';
                        state.timer = 0;
                        hook.caughtFish.active = false;
                        hook.caughtFish.x = -200;
                        hook.caughtFish.caught = false;
                        hook.caughtFish = null;
                    } else {
                        state.status = 'swing';
                    }
                }
                break;

            case 'score':
                if(state.timer > 60) this.reset();
                break;
        }
    }
};