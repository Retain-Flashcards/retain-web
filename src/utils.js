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

export function randomizeFilename(filename, acceptedExtensions = ['jpeg', 'jpg', 'png']) {
    const extension = filename.split('.').pop().toLowerCase()
    if (!(acceptedExtensions.includes(extension))) throw new Error('Invalid File Format')
    return generate_uuid() + '.' + extension
}

export function standardDateString(date) {
    return date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0')
}