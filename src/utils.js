/*export function calcY([x1, y1, x2, y2], x) {
    const k = ((y2 + y1) / (1 + x1 / x2)) / x2;
    const m = k * x1 - y1;

    return {
        x,
        y: k * x + m
    }
};
*/
export function calcY(data, x3) {
    const [x1, y1, x2, y2] = data;
    const a = y1 - y2;
    const b = x2 - x1;
    const rad = Math.atan(a / b);
    // const beta = (90 *  Math.PI/180)-rad;
    const ka = x3 - x1;
    const kb = ka * Math.tan(rad);
    const res = a + y2 - kb;
    //console.log({res, ka,kb, a, b});
    return {
    	x:x3, 
    	y:res
    }
}

export function findColum(columnName) {
    return function(column) {
        return column[0] === columnName;
    }
}

export function colorToHex(color) {
    return Number("0x" + String(color).slice(1))
}