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
	build:function({data, width, height, lineWidth, showY, showX, excludeCharts, renderVerticalLine}){
		this.showX = showX;
		this.showY = showY;
		this.excludeCharts = excludeCharts  || [];
		this.data = data;
		this.height = height;
		this.width = width;
		this.charts = {};
		this.lineWidth = lineWidth || 2;
		this.view = new Graphics();
		this.isAnimated = false;
		if(showY){
			this.renderVerticalLine = renderVerticalLine;
			this.panel = new Container();
			this.panel.graphics = new Graphics();
			this.panel.addChild(this.panel.graphics);
			this.texts = [];
			this.createText();
		}
		if(showX){
			this.dateTexts = [];
			this.bottomPanel = new Graphics();
			this.createDates();
		}

	},
	getChartDots:function(x){
		var filteredCharts = Object.keys(this.data.names).filter(name =>
				!this.excludeCharts.includes(name)
		);
		if(!filteredCharts.length){
			return [];
		}
		var onChartX = -this.view.x + x;
		var sourceDate = onChartX/this.kx + this.xStart;
		var {id, val:xValue} = this.xColumn
			.map(function(val, id){
				return {val, id}
			})
			.find(function({val}){
				return val >= sourceDate;
			}) || {};

		var result = filteredCharts.map( yName =>{
			var chart = this.charts[yName];
			var value = chart.yColumn[id];
			return{
				color : chart.color,
				y: this.height - (value * this.ky),
				name:this.data.names[yName],
				value,
				x:((xValue - this.xStart) * this.kx) + this.view.x,
				yName
			}	
		})
		return result
	},
	createDates:function(){
		if(this.showX){
			this.bottomPanel.beginFill(0x000000, 1);
			var w = this.showX.width || 20;
			var h = this.showY.height || 20;
			this.bottomPanel.drawRect(0, this.height, w, h);
			this.bottomPanel.endFill();
			var textStyle = this.showY.textStyle || defTextStyle;	
			for(var i=0; i<1; i+=0.1){
				var text = new Text('1000', textStyle);
				this.bottomPanel.addChild(text);
				this.dateTexts.push(text);
			}
		}
	},
	setDates:function(){
		if(this.showX){
			var dateTexts = this.dateTexts.slice();
			for(var i=0; i<1; i+=0.1){
				var text = dateTexts.pop();
				var x = this.showX.width * i;
				text.x = x;
				text.y = this.height * 1.01;
				var trueX = x - this.view.x;
				var sourceDate = trueX/this.kx + this.xStart;
				var date =  new Date( Number(sourceDate.toFixed(0)) )
				var dateStr = date.toDateString().split(' ');
			
				text.text = dateStr[1] + ' ' + dateStr[2] //+ ' ' + dateStr[3]
			}
		}
	},
	drawNumbers:function(){
		if(this.showY){
			this.view.lineStyle(1, 0xFFFFFF, 0.5, true);
			this.view.moveTo(0, 0);
			for(var i=0; i<1; i+=0.2){
				this.view.lineTo(this.width, this.height * i);
				this.view.moveTo(0, this.height * (i+0.2) );
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
		for(var i=0; i<1; i+=0.2){
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
		for(var i=0; i<1; i+=0.2){
			var text = texts.pop();
			text.x = 0;
			text.y = this.height * i;

			//var y = text.y/height;
			var yC = (height - text.y) / this.ky;
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
		this.charts = {};

		this.maxX = maxX;
		this.xColumn = xColumn;
		this.kx = kx;
		this.xStart = xStart;
		this.drawNumbers();
		var filteredCharts = Object.keys(data.names).filter(name =>
				!this.excludeCharts.includes(name)
			);
		if(!filteredCharts.length){
			return;
		}
		filteredCharts.forEach(name =>{
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
		if(typeof this.maxY === 'number' && this.maxY !== sortedCharts[0].maxY){
			this.tweenAnimation(sortedCharts[0].maxY, sortedCharts[0].ky, filteredCharts);
		}else{
			this.maxY = sortedCharts[0].maxY;
			this.ky = sortedCharts[0].ky;
			var that = this;
			this.drawNumbers();
			filteredCharts.forEach(function(name){
				that.view.lineStyle(that.lineWidth, that.charts[name].color );
				that.drawChart(name);
			});
			this.setDates();
		}
		
	},
	tweenAnimation:function(maxY, ky, filteredCharts){
		var stepCount = 30;
		var stepMaxY = (maxY - this.maxY)/stepCount;
		var stepKy = (ky - this.ky)/stepCount;
		let steps = 0;
		this.isAnimated = true;
		var that = this;
		var intervalId = setInterval(()=>{
			steps++;
			this.view.clear();
			if(steps >= stepCount){
				clearInterval(intervalId);
				this.isAnimated = false
				this.maxY = maxY;
				this.ky = ky;
			}else{
				this.maxY += stepMaxY;
				this.ky += stepKy;
			}
			if(this.renderVerticalLine){
				this.renderVerticalLine()
			}
			
			
			this.drawNumbers();
			filteredCharts.forEach(function(name){
				that.view.lineStyle(that.lineWidth, colorToHex(that.data.colors[name]) );
				that.drawChart(name);
			});
			this.setDates();
		}, 16)
	},
	drawChart:function(name){
		var chart  = this.charts[name];
		var view = this.view;
		var kx = this.kx;
		var ky = this.ky;
		var xStart = this.xStart;
		var yColumn = chart ? chart.yColumn: this.data.columns.find(findColum(name)).slice(1);;
		var height = this.height;
		var y = height - (yColumn[0] * ky );
		view.moveTo(0, y);
		
		this.xColumn.slice(1).forEach(function(xs, id){
			var x = (xs - xStart) * kx;
			var y = height - (yColumn[id+1] * ky);
			view.lineTo(x, y);
		})
	},
	
	onChange:function({width, height, showX, showY, excludeCharts}){
		this.width = width;
		this.height = height;
		this.showY = showY;
		this.showX = showX;
		this.excludeCharts = excludeCharts;
		this.view.clear();
		this.drawCharts();
		this.setNumbers();
	}

}
