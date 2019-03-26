export function calcY([x1, y1, x2, y2], x){
  var m = (y2-y1)/(x1-x2);
  var k = m*x1 + y1;
  return {
  	y: k - m*x ,
  	x
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