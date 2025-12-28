function themeBgSrc(theme){
    return theme==='night' ? 'src/bg_night.png' : 'src/bg.jpg';
}

function setTheme(theme){
    currentTheme = theme==='night' ? 'night' : 'day';
    try{ localStorage.setItem('theme', currentTheme); }catch(e){}
    image.src = themeBgSrc(currentTheme);
}

function getButtonColors(kind){
    const t = currentTheme;
    const day = {
        primary: ['#42A5F5','#1E88E5'],
        accent: ['#4CAF50','#388E3C'],
        warn: ['#FF5252','#D32F2F'],
        neutral: ['#90A4AE','#78909C']
    };
    const night = {
        primary: ['#90CAF9','#42A5F5'],
        accent: ['#81C784','#4CAF50'],
        warn: ['#EF5350','#D32F2F'],
        neutral: ['#607D8B','#546E7A']
    };
    const pal = t==='night' ? night : day;
    return pal[kind] || pal.primary;
}

function getDialogTheme(){
    const t = currentTheme;
    if(t==='night'){
        return { titleTop:'#546E7A', titleBottom:'#455A64', overlayAlpha:0.6, bg: '#37474F' };
    }
    return { titleTop:'#FFA726', titleBottom:'#FB8C00', overlayAlpha:0.5, bg: '#FFFFFF' };
}

function setVolume(vol){
    currentVolume = Math.max(0, Math.min(vol, 1));
    try{ localStorage.setItem('volume', String(currentVolume)); }catch(e){}
    bgMusic.volume = currentVolume;
    correctSound.volume = Math.min(1, currentVolume);
    wrongSound.volume = Math.min(1, currentVolume);
    normalSound.volume = Math.min(1, currentVolume);
}

function getTextColor(kind){
    const t = currentTheme;
    const day = {
        title: '#333333',
        text: '#333333',
        timer: '#333333',
        gridNumber: '#000000',
        hint: '#2E7D32'
    };
    const night = {
        title: '#e0e0e0',
        text: '#cfd8dc',
        timer: '#cfd8dc',
        gridNumber: '#e0e0e0',
        hint: '#a5d6a7'
    };
    const pal = t==='night' ? night : day;
    return pal[kind] || pal.text;
}
