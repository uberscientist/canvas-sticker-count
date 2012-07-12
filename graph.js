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

socket.on('active', function(data){
  if(data == true){
    document.queryform.submit.disabled=true;
    document.queryform.id.disabled=true;
  } else {
    document.queryform.submit.disabled=false;
    document.queryform.id.disabled=false;
  }
});
