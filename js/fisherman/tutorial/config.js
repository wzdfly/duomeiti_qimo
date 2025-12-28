window.FT = window.FT || {};
FT.config = {
    W: 440,
    H: 320,
    origin: { x: 220, y: 60 },
    hookBaseLength: 30,
    colors: {
        sky: ['#cbe7ff', '#9bd4ff', '#66c3ff', '#3aa9f0'],
        sea: ['#29B6F6', '#039BE5', '#01579B'],
        hookLine: '#263238',
        hookBody: '#546E7A',
        hookHighlight: '#CFD8DC'
    }
};

FT.state = {
    animId: null,
    status: 'idle', // idle, swing, drop, catch, retrieve, score
    timer: 0,
    waveT: 0,
    score: 0,
    showClickHint: false,
    hook: { x: 220, y: 60, angle: 0, length: 30, state: 'swing', caughtFish: null },
    fishes: []
};