import generateColors from './color'

export function generate_uuid() {
    var result, i, j;
    result = '';
    for(j=0; j<32; j++) {
        if( j == 8 || j == 12 || j == 16 || j == 20)
        result = result + '-';
        i = Math.floor(Math.random()*16).toString(16).toUpperCase();
        result = result + i;
    }
    return result;
}

export function setThemeColor(primary, el) {
    let colors = generateColors(primary)

    el.style.setProperty(`--el-color-primary`, primary)
    for (const [key, value] of Object.entries(colors)) {
        el.style.setProperty(`--el-color-primary-${key}`, value)
    }
}
