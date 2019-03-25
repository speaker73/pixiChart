import { Application, Graphics, Text, Container, CANVAS_RENDERER } from 'pixi.js';
import * as PIXI from 'pixi.js';
import Chart from './Chart';

PIXI.CANVAS_RENDERER = false;

var options = {
	antialias: true,
	autoResize: true,
	resolution:window.devicePixelRatio||1,
    /*        transparent: false,
            antialias: false,
            preserveDrawingBuffer: false,
            resolution: window.devicePixelRatio || 1,
            clearBeforeRender: true,
            forceCanvas: window.PIXI.CANVAS_RENDERER,
            // powerPreference: "high-performance"*/
            legacy: true
};

function colorToHex(color){
	return Number("0x" +  String(color).slice(1))
}

var defTextStyle = {fontFamily : 'Arial', fontSize: 12, align:'center', fill:"#000000" };
export default {
	create:function(containerId, data, width, height, startDot, endDot){
		this.CHART_HEIGHT = 0.6;
		this.CHART_MAP_HEIGHT = 0.1;
		this.MIN_TOGGLE = 0.2;
		this.SHADOW_ALPHA = 0.3;
		this.LINE_DOTS_RADIUS = 8;
		this.CHART_MAP_DRAG_ZONE = 6;
		this.lineCord = 0.5;
		this.dragLeft = this.dragLeft.bind(this);
		this.move = this.move.bind(this);
		this.dragRight = this.dragRight.bind(this);
		this.data = data;
		this.height = height;
		this.width = width;
		this.startDot = startDot;
		this.endDot = endDot;
		this.app = new Application(width, height, options);
		document.getElementById(containerId).appendChild(this.app.view);
		
		this.chart = this.createChart();
		this.app.stage.addChild(this.chart.view);
		this.app.stage.addChild(this.chart.panel);
		this.app.stage.addChild(this.chart.bottomPanel);
		this.chartMap = this.createChartMap();
		this.chartMap.view.y = this.height * (this.CHART_HEIGHT + this.CHART_MAP_HEIGHT);
		this.app.stage.addChild(this.chartMap.view);	
		this.toggle = this.createToggle();
		this.beforeToggle = new Graphics();
		this.afterToggle = new Graphics();
		this.renderBeforeToggle(this.beforeToggle);
		this.renderAfterToggle(this.afterToggle);
		this.createChartTumblers();
		this.line = new Graphics();
		this.line.interactive = true;
		this.line.buttonMode = true;
		var that = this;
		this.line.on('mousedown', onDragStart)
	        .on('touchstart', onDragStart)
	        // events for drag end
	        .on('mouseup', onDragEnd)
	        .on('mouseupoutside', onDragEnd)
	        .on('touchend', onDragEnd)
	        .on('touchendoutside', onDragEnd)
	        .on('mousemove', function(event){
	        	that.onDragMoveLine(event, this);
	        })
	        .on('touchmove', function(event){
	        	that.onDragMoveLine(event, this);
	        })
		this.lineTextContainer = new Container();
		this.lineTextContainer.name = 'lineTextContainer';
		this.lineTexts = [];
		this.lineTextContainerRect = new Graphics();
	
		this.app.stage.addChild(this.toggle);
		this.app.stage.addChild(this.beforeToggle);
		this.app.stage.addChild(this.afterToggle);
		this.app.stage.addChild(this.line);
		this.lineTextContainer.addChild(this.lineTextContainerRect);
		this.app.stage.addChild(this.lineTextContainer);
		this.renderVerticalLine(this.line);
		this.onChangeBinded = this.onChange.bind(this);
	},
	onChartPress:function(event){
		var x = event.data.global.x;
	},
	renderVerticalLine:function(line){
		var dots = this.chart.getChartDots(this.width*this.lineCord)
		line.lineStyle(1, 0xFFFFFF, 1, true);
		var x = dots.length?dots[0].x : this.width*this.lineCord;
		line.moveTo(x, 0);
		line.lineTo(x, this.CHART_HEIGHT * this.height);
		let text = "";
		this.lineTexts.slice().forEach(child=>{
			this.lineTextContainer.removeChild(child);
		})

		dots.forEach((chart, id)=>{	
			var text = new Text(`${chart.name} : ${chart.value}`, {...defTextStyle, fill:chart.color});
			this.lineTexts.push(text);
			text.y = text.height * id;
			this.lineTextContainer.addChild(text);
		})
		dots.forEach(({color, y})=>{
			line.beginFill(color, 1);
		    line.drawCircle(x, y, this.LINE_DOTS_RADIUS);
		    line.endFill();
		});
		var contWidth = this.lineTextContainer.width + this.lineTextContainer.width* 0.3;
		var contHeight = this.lineTextContainer.height;
		this.lineTextContainerRect.beginFill(0xFFFFFF, 1);
		this.lineTextContainerRect.drawRect(0, 0,contWidth, contHeight);
		this.lineTextContainerRect.endFill();
		this.lineTextContainer.x = x + this.width*0.01;
		this.lineTextContainer.y = 0;
	},
	createChartTumblers:function(){
		this.excludeCharts = [];
		this.tumblers = [];
		Object.keys(this.data.names).forEach(( yName, id )=>{
			var tumbler = new Graphics();
			var name = this.data.names[yName];
			var color = colorToHex(this.data.colors[yName] );
			tumbler.interactive = true;
			tumbler.buttonMode = true;
			var onTumb = ()=>{
				if(this.excludeCharts.includes(yName) ){
					this.excludeCharts = this.excludeCharts.filter(na=> na!== yName);
				}else{
					this.excludeCharts.push(yName);
				}
				this.onChange();
			}

			tumbler
				.on("mouseup", ()=>{
					onTumb();
				})
				.on('touchend', ()=>{
					onTumb();
				})
			this.tumblers.push({tumbler, name, color, id, yName});
			this.renderTumbler(tumbler, color, name, id, yName);
			this.app.stage.addChild(tumbler);
		})
	},
	renderTumblers:function(){
		var that = this;
		this.tumblers.forEach(function({tumbler, name, color, id, yName}){
			tumbler.clear();
			that.renderTumbler(tumbler, color, name, id, yName);
		})
	},
	renderTumbler:function(tumbler, color, name, id, yName){
		var alpha = this.excludeCharts.includes(yName)?0.4:1;
		var radius = this.height * 0.05;
		var diametr = radius*2;
		var x = radius + (diametr+radius/2) * id; 
		var y = this.height * (this.CHART_HEIGHT + this.CHART_MAP_HEIGHT + 0.2)
		tumbler.beginFill(color, alpha);
		tumbler.drawCircle(x, y, radius);
		tumbler.endFill();
	},
	getChartParams:function(){
		return {
			data:this.data,
			width:this.width * ( this.width /( this.endDot*this.width - this.startDot*this.width )),
			height:this.height * this.CHART_HEIGHT,
			x:0,
			y:0,
			showY:{
				width:50,
				background:0x000000
			},
			showX:{
				width:this.width,
				height:50
			},
			excludeCharts:this.excludeCharts,
			renderVerticalLine:()=>{
				this.line.clear();
				this.lineTextContainerRect.clear();
				this.renderVerticalLine(this.line);
			}
		}
	},
	getChartMapParams:function(){
		return {
			data:this.data,
			width:this.width,
			height:this.height * this.CHART_MAP_HEIGHT,
			x:0,
			y:this.height * (this.CHART_MAP_HEIGHT + this.CHART_HEIGHT),
			excludeCharts:this.excludeCharts
		}
	},
	createChart:function() {
		var chart = Object.create(Chart);
		var params = this.getChartParams();
		chart.build(params);
		chart.drawCharts();
		chart.view.x = 0 - (chart.view.width * this.startDot); 
		return chart;
	},
	createChartMap:function() {
		var chartMap = Object.create(Chart);
		var params = this.getChartMapParams();
		chartMap.build(params);
		chartMap.drawCharts();
		return chartMap;
	},
	createToggle:function(){
		var toggle = new Graphics();
		toggle.interactive = true;
		toggle.buttonMode = true;
		var that = this;
		toggle
			.on('mousedown', onDragStart)
	        .on('touchstart', onDragStart)
	        // events for drag end
	        .on('mouseup', onDragEnd)
	        .on('mouseupoutside', onDragEnd)
	        .on('touchend', onDragEnd)
	        .on('touchendoutside', onDragEnd)
	        // events for drag move
	        .on('mousemove', function(event){
	        	that.onDragMove(event, this)
	        })
	        .on('touchmove', function(event){
	        	that.onDragMove(event, this)
	        })

		this.renderToggle(toggle);
		return toggle;
	},
	renderBeforeToggle(beforeToggle){
		var x = 0;
		var y = this.height * (this.CHART_HEIGHT + 0.08);
		var width = this.width * this.startDot;
		var height = this.height * (this.CHART_MAP_HEIGHT + 0.05);
		beforeToggle.beginFill(0xFFFFFF, this.SHADOW_ALPHA);
		beforeToggle.drawRect(x, y, width, height);
		beforeToggle.endFill();
	},
	renderAfterToggle(afterToggle){
		var x = this.width * this.endDot;
		var y = this.height * (this.CHART_HEIGHT + 0.08);
		var width = this.width - x;
		var height = this.height * (this.CHART_MAP_HEIGHT + 0.05);
		afterToggle.beginFill(0xFFFFFF, this.SHADOW_ALPHA);
		afterToggle.drawRect(x, y, width, height);
		afterToggle.endFill();
	},
	renderToggle:function(toggle){
		var x = this.width * this.startDot;
		var y = this.height * (this.CHART_HEIGHT + 0.08);
		var width = (this.width * this.endDot) - x;
		var height = this.height * (this.CHART_MAP_HEIGHT + 0.05);

		toggle.lineStyle(1, 0xFFFFFF, this.SHADOW_ALPHA, 0, true);
		toggle.beginFill(0xFFFFFF, 0);
		toggle.drawRect(x, y, width, height);
		toggle.endFill();

		toggle.lineStyle(4, 0xEEEEFF, this.SHADOW_ALPHA + 0.4, 1);
		toggle.moveTo(x, y);
		toggle.lineTo(x,y+height);
		toggle.lineStyle(4, 0xEEEEFF, this.SHADOW_ALPHA + 0.4, 0);
		toggle.moveTo(x+width, y);
		toggle.lineTo(x+width, y+height);
	},
	onChange:function(){
		this.toggle.clear();
		this.beforeToggle.clear();
		this.afterToggle.clear();
		this.renderToggle(this.toggle);
		this.renderBeforeToggle(this.beforeToggle);
		this.renderAfterToggle(this.afterToggle);
		this.chart.onChange(this.getChartParams());
		this.chart.view.x = 0 - (this.chart.view.width * this.startDot);
		this.chartMap.onChange(this.getChartMapParams() );
		this.chartMap.view.y = this.height * (this.CHART_HEIGHT + this.CHART_MAP_HEIGHT);
		this.renderTumblers();
		this.line.clear();
		this.lineTextContainerRect.clear();
		this.renderVerticalLine(this.line);
	},
	onResize:function(width, height){
		this.width = width;
		this.height = height;
		this.app.renderer.resize(width, height);
		this.toggle.clear();
		this.beforeToggle.clear();
		this.afterToggle.clear();

		this.renderToggle(this.toggle);
		this.renderBeforeToggle(this.beforeToggle);
		this.renderAfterToggle(this.afterToggle);
		this.renderTumblers();
		this.chart.onChange(this.getChartParams());
		this.chartMap.onChange(this.createChartMap());
		this.chart.view.x = 0 - (this.chart.view.width * this.startDot); 
		this.chartMap.view.y = this.height * (this.CHART_HEIGHT + this.CHART_MAP_HEIGHT);
		this.line.clear();
		this.lineTextContainerRect.clear();
		this.renderVerticalLine(this.line);
	},
	dragLeft:function(x){
		if(x >= (this.endDot - this.MIN_TOGGLE)) {
			this.startDot = this.endDot - this.MIN_TOGGLE;
			return false;
		}
		if( x < 0){
			this.startDot = 0;
			return false;
		}
		this.startDot = x;
		return true	
	},

	dragRight:function(x, width){
		if((x+width) <= (this.startDot + this.MIN_TOGGLE)) {
			this.endDot = this.startDot + this.MIN_TOGGLE;
			return false;
		}
		if( (x + width) > 1){
			this.endDot = 1;
			return false
		}
		this.endDot = x + width;
		return true
	},

	move:function(x, width){
		if(x >= (1 - width)){
			x = 1 - width;
		}
		if(x <= 0){
			x = 0;
		}
		this.startDot = x;	
		this.endDot = x + width;
	},
	onDragMove:function(event, self){
    	if (self.dragging)
	    {	
	    	var startDot = this.startDot * this.width;
	    	var endDot = this.endDot * this.width;

	        var width = endDot - startDot;
	        var deltaX = event.data.global.x - self.startX;
	  		var x = startDot + deltaX;
	  		var isDragLeft = (self.startX - startDot) <=this.CHART_MAP_DRAG_ZONE && ((self.startX - startDot) >= 0);
	  		var isDragRight = (endDot - self.startX) <=this.CHART_MAP_DRAG_ZONE && ((endDot - self.startX) >= 0);
	  		if(isDragLeft){
				if( this.dragLeft(x/this.width) )
					self.startX = event.data.global.x;
	  		}else if(isDragRight){
				if( this.dragRight(x/this.width, width/this.width) )
					self.startX = event.data.global.x;
	  		}else{
	  			this.move(x/this.width, width/this.width);
	  			self.startX = event.data.global.x;
	  		}
	  		
			this.onChange();	
	    }
	},
	onDragMoveLine:function(event, self){
    	if (self.dragging)
	    {	
	    	var deltaX = event.data.global.x - self.startX;
	    	var updatedLineCord = this.lineCord + deltaX/this.width;
	    	if(updatedLineCord >= 0.98){
	    		updatedLineCord = 0.98
	    	}
	    	if(updatedLineCord <= 0){
	    		updatedLineCord = 0
	    	}
	    	this.lineCord = updatedLineCord;
	    	self.startX = event.data.global.x;
			this.onChange();	
	    }
	}
}


function onDragStart(event){
	this.startX = event.data.global.x;
    //this.alpha = 0.5;
    this.dragging = true;
}
function onDragEnd(event){
	this.alpha = 1;
	this.startX = null;
    this.dragging = false;
}

