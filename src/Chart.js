import { Graphics } from 'pixi.js';

function findColum(columnName){
	return function(column){
		return column[0] === columnName;
	}
}

function colorToHex(color){
	return Number("0x" +  String(color).slice(1))
}


export default {
	build:function({data, width, height, lineWidth}){
		this.data = data;
		this.height = height;
		this.width = width;
		this.charts = {};
		this.lineWidth = lineWidth || 2;
		this.view = new Graphics();
	},
	drawCharts:function(){
		var data = this.data;
		var xFinder = findColum('x');
		var xColumn = data.columns.find(xFinder).slice(1);
		var xStart = xColumn[0];
		var maxX = Math.max.apply(null, xColumn) - xStart;
		var kx = this.width/maxX;
	

		this.maxX = maxX;
		this.xColumn = xColumn;
		this.kx = kx;
		this.xStart = xStart;

		Object.keys(data.names).forEach(name =>{
			var yFinder = findColum(name);
			var color = colorToHex( data.colors[name] );
			var yColumn = data.columns.find(yFinder).slice(1);
			var maxY = Math.max.apply(null, yColumn);
			var ky = this.height/maxY;
			this.charts[name] = {
				color : color,
				yColumn : yColumn,
				maxY : maxY,
				ky: ky,
			}
			this.view.lineStyle(this.lineWidth, color);
			this.drawChart(name);
		})
	},
	drawChart:function(name){
		var chart  = this.charts[name];
		var view = this.view;
		var kx = this.kx;
		var ky = chart.ky;
		var xStart = this.xStart;
		var yColumn = chart.yColumn;
		var height = this.height;
		var y = height - (yColumn[0] * ky );
		view.moveTo(0, y);
		
		this.xColumn.slice(1).forEach(function(xs, id){
			var x = (xs - xStart) * kx;
			var y = height - (yColumn[id+1] * ky);
			view.lineTo(x, y);
		})
	},
	
	onChange:function({width, height}){
		this.width = width;
		this.height = height;
		this.view.clear();
		this.drawCharts();
	},

	onResize:function(width, height){

	}
}
