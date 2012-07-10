var socket = io.connect('http://localhost');

var container = document.getElementById('container'); 

socket.on('graph', function(data){
  var graph = Flotr.draw(
    container, data,

    { 
      HtmlText: false,
      grid: {
        verticalLines: false,
        horizontalLines: false
        },
      xaxis: { showLabels: false },
      yaxis: { showLabels: false },

      pie: { show: true, explode: 6},
      legend: { position: 'se' }
    }
  );
});
