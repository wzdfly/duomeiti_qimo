window.FT = window.FT || {};
FT.Game = {
    loop: function() {
        if(!FT.UI.overlay.classList.contains('visible') && FT.UI.overlay.style.display === 'none') return;
        
        FT.Logic.update();
        FT.Renderer.draw();
        
        FT.state.animId = requestAnimationFrame(() => FT.Game.loop());
    },

    start: function() {
        FT.UI.init(); // Ensure UI is ready
        FT.UI.show();
        FT.Logic.reset();
        if(FT.state.animId) cancelAnimationFrame(FT.state.animId);
        this.loop();
    },

    stop: function() {
        FT.UI.hide();
        if(FT.state.animId) cancelAnimationFrame(FT.state.animId);
    }
};

window.FishermanTutorial = {
    show: function() {
        if(!FT.UI.overlay) FT.UI.init();
        FT.Game.start();
    }
};