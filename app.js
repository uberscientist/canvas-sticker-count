
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , app = module.exports = express.createServer()
  , io = require('socket.io').listen(app);

var redis = require('redis'),
    db = redis.createClient();


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index');
});

app.get('/user/:id', function(req, res){
  var graphData = [];
  var id = req.params.id;

  io.sockets.on('connection', function(socket){
    //Have express render
    res.render('index');

    db.zrevrange('stickers:'+id, 0, -1, 'withscores', function(err, data){
      if(err) throw err;

      //Get sticker count from Redis and push them all to an array that Flotr2 can understand
      for(var i=0; i < data.length/2; i += 2){
        graphData.push({data: [[ 0, parseFloat(data[i+1]) ]], label: data[i]});
      }
      io.sockets.emit('graph',graphData);
    });
  });
});

app.listen(3030);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

