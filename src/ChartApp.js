import { Application, Graphics } from 'pixi.js';
import Chart from './Chart';

var options = {
	antialias: true,
};
export default {
	create:function(containerId, data, width, height, startDot, endDot){
		this.CHART_HEIGHT = 0.7;
		this.CHART_MAP_HEIGHT = 0.1;
		this.MIN_TOGGLE = 0.1;
		this.SHADOW_ALPHA = 0.3;

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
		this.chartMap = this.createChartMap();
		this.chartMap.view.y = this.height * (this.CHART_HEIGHT + this.CHART_MAP_HEIGHT);
		this.app.stage.addChild(this.chartMap.view);	
		this.toggle = this.createToggle();
		this.beforeToggle = new Graphics();
		this.afterToggle = new Graphics();
		this.renderBeforeToggle(this.beforeToggle);
		this.renderAfterToggle(this.afterToggle);
		this.app.stage.addChild(this.toggle);
		this.app.stage.addChild(this.beforeToggle);
		this.app.stage.addChild(this.afterToggle);
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
	renderDate:function(){
		//@todo add render date
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

		this.chart.onChange(this.getChartParams());
		this.chartMap.onChange(this.createChartMap());
		this.chart.view.x = 0 - (this.chart.view.width * this.startDot); 
		this.chartMap.view.y = this.height * 0.8;
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
	  		var isDragLeft = (self.startX - startDot) <=5 && ((self.startX - startDot) >= 0);
	  		var isDragRight = (endDot - self.startX) <=5 && ((endDot - self.startX) >= 0);
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

