var container = document.getElementById('container');
var messagetext = document.getElementById('message');

socket.on('graph', function(data){
  var graph = Flotr.draw(container, data,
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

socket.on('message', function(data){
   messagetext.innerHTML = data;
});
