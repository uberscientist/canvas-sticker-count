var request = require('request');
var redis = require('redis');

var db = redis.createClient();

var username = 'dmauro';
var offset = 0;
var limiting = null;
var waitLonger = 0;

function startInterval(posts){
  var c = -1;

  limiting = setInterval(function(){
      c++;

      if(posts.length < 1){
        clearInterval(limiting);
        limiting = null;
        console.log('No more posts!');
      }

      request(posts[c].api_url, function(err, res, body){
      var body = JSON.parse(body);

      if(body.success == false){
        console.log('Too fast, waiting extra ' + waitLonger + 'ms...');
        c--;
        waitLonger += 200;
        clearInterval(limiting);
        limiting = null;
        startInterval(posts);

      } else {

        //array of objects, each representing a type of sticker
        var stickers = body.stickers;
        for(var i = 0; i < stickers.length; i++){
          db.zincrby('stickers:'+username, stickers[i].count, stickers[i].name, function(err){
            if(err) throw err;
          });
        }
      }

 
    });

    if(c == posts.length - 1){

      //Increase our offset length for our next loop
      if(posts.length == 10){
        offset += 10;
      }

      clearInterval(limiting);
      limiting = null;
      getStickers(offset);
    }
  }, 50 + waitLonger);
}

function getStickers(offset){
  if(waitLonger > 0){
    waitLonger -= 100;
  }
  console.log('offset: ' + offset);
  var offset_json = {
    ids: [{user: username, skip: offset}]
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

    if(body.success == false){
      //We've gone over our limit, need to slow down
      console.log(body);

    } else {

      //Pass the posts to the interval function
      var posts = body.users[0].posts;
      startInterval(posts);

    }
  });

}

getStickers(offset);
