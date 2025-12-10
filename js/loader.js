function startResourceLoad(){
    if(resourceLoadStarted) return;
    resourceLoadStarted = true;
    const INTRO_MIN_MS = 2000;
    const startTs = performance.now();

    const items = [];
    if(!image.complete) items.push({type:'image', obj:image}); else loadProgress = Math.max(loadProgress, 0.2);
    [bgMusic, correctSound, wrongSound, normalSound].forEach(a=>{
        if(a) items.push({type:'audio', obj:a});
    });

    const total = items.length || 1;
    let loaded = 0;
    function mark(){
        loaded++;
        const raw = loaded/total;
        loadProgress = Math.min(0.95, Math.max(loadProgress, raw));
    }

    for(const it of items){
        if(it.type==='image'){
            it.obj.addEventListener('load', mark, {once:true});
        }else if(it.type==='audio'){
            const handler = ()=>{ mark(); };
            it.obj.addEventListener('canplaythrough', handler, {once:true});
            try{ it.obj.load && it.obj.load(); }catch(e){}
        }
    }

    const fakeTimer = setInterval(()=>{
        if(loadProgress < 0.9){
            loadProgress = Math.min(0.9, loadProgress + 0.03);
        }
    }, 180);

    const readyCheck = setInterval(()=>{
        const elapsed = performance.now() - startTs;
        if(loaded >= total && elapsed >= INTRO_MIN_MS){
            loadProgress = 1;
            clearInterval(readyCheck);
            clearInterval(fakeTimer);
        }
    }, 50);
}
