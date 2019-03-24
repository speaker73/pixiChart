import { Graphics, Text, Container } from 'pixi.js';

function findColum(columnName){
	return function(column){
		return column[0] === columnName;
	}
}

function colorToHex(color){
	return Number("0x" +  String(color).slice(1))
}

var defTextStyle = {fontFamily : 'Arial', fontSize: 12, align:'left', fill:"#FFFFFF" };
export default {
	build:function({data, width, height, lineWidth, showY, showX}){
		this.showX = showX;
		this.showY = showY;
		this.data = data;
		this.height = height;
		this.width = width;
		this.charts = {};
		this.lineWidth = lineWidth || 2;
		this.view = new Graphics();
		
		if(showY){
			this.panel = new Container();
			this.panel.graphics = new Graphics();
			this.panel.addChild(this.panel.graphics);
			this.texts = [];
			this.createText();
		}
	},
	drawNumbers:function(){
		if(this.showY){
			this.view.lineStyle(0.2, 0xFFFFFF, 0.5, true);
			this.view.moveTo(0, 0);
			for(var i=0; i<1; i+=0.1){
				this.view.lineTo(this.width, this.height * i);
				this.view.moveTo(0, this.height * (i+0.1) );
			}
			var width = this.showY.width || 20;
			var background = this.showY.background || 0x000000;
			var color = this.showY.color || 0xFFFFFF;
			var panel = this.panel.graphics; 
			panel.clear();
			panel.beginFill(background, 0.7);
			panel.drawRect(0, 0, this.panel.width || width, this.height);
			panel.endFill();
			this.setNumbers();
		}
	},
	createText:function(){
		var textStyle = this.showY.textStyle || defTextStyle;	
		for(var i=0; i<1; i+=0.1){
			var text = new Text('', textStyle);
			this.texts.push(text);
			this.panel.addChild(text);
		}
	},
	setNumbers:function(){
		if(!this.showY){
			return;
		}
		var height = this.height;
		var ky = this.ky;
		var texts = this.texts.slice();	
		for(var i=0; i<1; i+=0.1){
			var text = texts.pop();
			text.x = 0;
			text.y = this.height * i;

			var y = text.y/height;
			var yC = (height - y) / ky;
			text.text = yC.toFixed(3);
		}
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
		this.drawNumbers();
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
		})
		const sortedCharts = Object.values(this.charts).sort(function(a, b){
			return b.maxY - a.maxY;
		})
		this.maxY = sortedCharts[0].maxY;
		this.ky = sortedCharts[0].ky;
		var that = this;
		this.drawNumbers();
		Object.keys(this.charts).forEach(function(name){
			that.view.lineStyle(that.lineWidth, that.charts[name].color );
			that.drawChart(name);
		})
	},
	drawChart:function(name){
		var chart  = this.charts[name];
		var view = this.view;
		var kx = this.kx;
		var ky = this.ky;
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
		this.setNumbers();
	},

	onResize:function(width, height){

	}
}
