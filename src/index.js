import ChartApp from './ChartApp';
import chart_data from './chart_data.json';

var charts = [];

var wK = 0.6;
var hK = 0.49;
chart_data.forEach(function(data){
	var chart = Object.create(ChartApp);
	chart.create('chart-box', data, window.innerWidth * wK, window.innerHeight * hK, 0.1, 0.3);
	charts.push(chart);
})


window.addEventListener("resize", ()=>{
		charts.forEach(function(chart){
			var width = window.innerWidth * wK;
			var height = window.innerHeight * hK;
			chart.onResize(width, height);
		})
}, false)