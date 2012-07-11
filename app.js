
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , app = module.exports = express.createServer()
  , io = require('socket.io').listen(app)
  , canvas = require('canvas.js');

var redis = require('redis'),
    db = redis.createClient();


// Configuration

io.set('log level', 1);

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
  var id = req.params.id;

  res.render('index');

  io.sockets.on('connection', function(socket){

    var update = function(){
      db.zrevrange('stickers:'+id, 0, -1, 'withscores', function(err, data){
        if(err) throw err;
        var graphData = [];

        if(data.length == 0){

          //User we haven't seen before, get all sticker info
          canvas.getStickers(id, 0, update, function(){
            console.log('app.js callback fired');
          });

        }

        //Get sticker count from Redis and push them all to an array that Flotr2 can understand
        for(var i=0; i < data.length/2; i += 2){
          graphData.push({data: [[ 0, parseFloat(data[i+1]) ]], label: data[i]});
          if(i == data.length/2 - 1){
            //Send array over socket
            socket.emit('graph',graphData);
          }
        }

      });
    }

    update();

  });
});

app.listen(3030);
