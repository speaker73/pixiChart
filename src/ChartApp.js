import { Application, Graphics } from 'pixi.js';
import Chart from './Chart';

var options = {
	antialias: true,
};
export default {
	create:function(containerId, data, width, height, startDot, endDot){
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
		
		this.chartMap = this.createChartMap();
		this.chartMap.view.y = this.height * 0.8;
		this.app.stage.addChild(this.chartMap.view);

		this.toggle = this.createToggle();
	
		this.app.stage.addChild(this.toggle);
	},
	getChartParams:function(){
		return {
			data:this.data,
			width:this.width * ( this.width /( this.endDot*this.width - this.startDot*this.width )),
			height:this.height * 0.7,
			x:0,
			y:0,
		}
	},
	getChartMapParams:function(){
		return {
			data:this.data,
			width:this.width,
			height:this.height * 0.1,
			x:0,
			y:this.height * 0.8,
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
		toggle.on('mousedown', onDragStart)
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
	renderToggle:function(toggle){
		toggle.beginFill(0xFFFFFF, 0.5);
		var x = this.width * this.startDot;
		var y = this.height * 0.8;
		var width = (this.width * this.endDot) - x;
		var height = this.height * 0.1;
		toggle.drawRect(x, y, width, height);
		toggle.endFill();
	},

	onChange:function(){
		this.toggle.clear();
		this.renderToggle(this.toggle);
		this.chart.onChange(this.getChartParams());
		this.chart.view.x = 0 - (this.chart.view.width * this.startDot); 
	},
	dragLeft:function(x){
		this.startDot = x;	
	},

	dragRight:function(x, width){
		this.endDot = x + width;
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
	  			if( ((endDot - x) >= 100) && startDot>0) {
					this.dragLeft(x/this.width);
					self.startX = event.data.global.x;
				}
	  		}else if(isDragRight){
				if( ( ((x + width) - startDot) >= 100) && endDot<this.width ){
					this.dragRight(x/this.width, width/this.width);
					self.startX = event.data.global.x;
				}
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
    this.alpha = 0.5;
    this.dragging = true;
}
function onDragEnd(event){
	this.alpha = 1;
	this.startX = null;
    this.dragging = false;
}

