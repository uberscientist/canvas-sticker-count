var io = require('socket.io').listen(3030),
    redis = require('redis'),
    request = require('request');

io.set('log level', 1);

var db = redis.createClient();

function update(id, socket){
  db.zrevrange('stickers:'+ id, 0, -1, 'withscores', function(err, data){
    if(err) throw err;
    var graphData = [];

    //Get sticker count from Redis and push them all to an array that Flotr2 can understand
    for(var i=0; i < data.length/2; i += 2){
      graphData.push({data: [[ 0, parseFloat(data[i+1]) ]], label: data[i]});
      if(i >= data.length/2 - 2){
        //Send array over socket
        socket.emit('graph',graphData);
      }
    }

  });
}

function startInterval(id, lastpost, posts, socket, offset, callback){
  var c = -1;

  limiting = setInterval(function(){
    c++;

    if(posts.length < 1){
      clearInterval(limiting);
      limiting = null;
      console.log('No more posts!');
      socket.emit('message', 'Finished downloading sticker data!');
      callback();
      return;
    }

    if(c >= posts.length - 1){

      //Increase our offset length for our next loop
      offset += 10;

      clearInterval(limiting);
      limiting = null;
      getStickers(id, lastpost, socket, offset, callback);
    }

    if(typeof(posts[c]) == 'undefined'){
      console.log('Undefined posts:');
      console.log(c);
      callback();
      return;
    }

    if(lastpost == posts[c].id){
      //Up to date now
      callback();
      return;
    }

    request(posts[c].api_url, function(err, res, body){
      var body = JSON.parse(body);

      //array of objects, each representing a type of sticker
      var stickers = body.stickers;
      for(var i = 0; i < stickers.length; i++){
        db.zincrby('stickers:'+id, stickers[i].count, stickers[i].name, function(err){
          if(err) throw err;
          update(id, socket);
        });
      }

    });


  }, 1000);
}


function getStickers(id, lastpost, socket, offset, callback){

  if(lastpost == null){
    //first time seeing user
  } else {
    //update db up until 'lastpost'
  }

  console.log('username: ' + id + '; offset: ' + offset);

  var offset_json = {
    ids: [{user: id, skip: offset}]
  }

  var options = {
    uri: 'http://canv.as/public_api/users/',
    host: 'http://canv.as',
    path: '/public_api/users/',
    method: 'POST',
    body: JSON.stringify(offset_json)
  }

  request(options, function(err, res, body){
    var body = JSON.parse(body);

    if(body.success == false || body.users.length == 0){
      //Too fast OR no such user
      console.log(body);
      callback();

    } else {

      //Pass the posts to the interval function
      var posts = body.users[0].posts;
      startInterval(id, lastpost, posts, socket, offset, callback);

    }
  });
}


io.sockets.on('connection', function(socket){
  socket.on('getStickers', function(data){

    //Check redis for latest post, then call getStickers
    db.get('lastpost:' + data.id, function(err, lastpost){
      if(err) throw err;
      getStickers(data.id, lastpost, socket, 0, function(){
        console.log('woo');
      });
    });
/*
*/
  });
});
