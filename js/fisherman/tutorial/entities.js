window.FT = window.FT || {};
FT.Entities = {
    createFish: function(offsetIndex) {
        return {
            x: -50 - offsetIndex * 120,
            y: 150 + Math.random() * 100,
            speed: 1.5 + Math.random() * 1.5,
            caught: false,
            active: true,
            radius: 20 + Math.random() * 10,
            dir: 1
        };
    },
    
    resetHook: function() {
        FT.state.hook = { 
            x: FT.config.origin.x, 
            y: FT.config.origin.y, 
            angle: 0, 
            length: FT.config.hookBaseLength, 
            state: 'swing', 
            caughtFish: null 
        };
    }
};