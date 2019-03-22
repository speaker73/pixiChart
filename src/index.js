import ChartApp from './ChartApp';
import chart_data from './chart_data.json';

chart_data.slice(1).forEach(function(data){
	var chart = Object.create(ChartApp);
	chart.create('chart-box', data, window.innerWidth * 0.5, window.innerHeight * 0.5, 0.1, 0.3);
})


