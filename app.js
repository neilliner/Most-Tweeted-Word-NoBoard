//Install Modules
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Twitter = require('twitter');

client = undefined;
var client = new Twitter({
    consumer_key: 'OkbfwUVURH7DbYoYr2j8N9hjE',
    consumer_secret: 'AJcdAshH4NPwsct4VK9LUyQwC2tM68eN6vEgnXt1NnM84zG5yq',
    access_token_key: '531593766-fJwCeM0FHyBNcoqpCPUIk3bhS9Q4phU7YUPqyjqB',
    access_token_secret: 'OEnlL8jBg8dHXF04xuvzTtHBJ18cPOYu0uMTBjICYpWQf'
})

//var five = require("johnny-five"), board, potentiometer, button, vibration;

var keyword = [];

//board = new five.Board();

app.use(express.static('public'));


//Serve index.html when some make a request of the server
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

//Do this when arduino is ready
// board.on("ready", function() {

//   // Create a new `potentiometer` hardware instance.
//   potentiometer = new five.Sensor({
//     pin: "A0",
//     freq: 25
//   });

//   vibration = new five.Sensor({
//     pin: "A1",
//   });

//   button = new five.Pin(2);

//   // Inject the `sensor` hardware into
//   // the Repl instance's context;
//   // allows direct command line access
//   board.repl.inject({
//     pot: potentiometer
//   });

//   vibration.on("data", function() {
//     //console.log("Vibration : " + this.value);
//     io.sockets.emit('vib', {val: this.value});
//   });

//   // "data" get the current reading from the potentiometer
//   potentiometer.on("data", function() {
//     //console.log(this.value);
//     io.sockets.emit('data', {val: this.value});
//   });

//   button.read(function(error, value){
//     //console.log(value);
//     io.sockets.emit('btn', {val: this.value});
//   });

//   // when connect successfully do whatever
//   io.on('connect', function(socket) {
//     console.log("connected");

//     socket.on('re',function(b){
//       if(b && client.currentTwitStream){
//         client.currentTwitStream.destroy();
//         console.log("reconnect");
//         keyword.splice(0,keyword.length);
//         reconnect();
//       }
//     });

//     socket.on('key1', function(msg) {      
//       keyword.push(msg);
//     });

//     socket.on('key2', function(msg) {
//       keyword.push(msg);
//       var kw = keyword.join();
//       streamTwitter(kw);
//     });

//   });
// });

// when connect successfully do whatever
  io.on('connect', function(socket) {

    console.log("connected");

    socket.on('re',function(b){
      if(b && client.currentTwitStream){
        client.currentTwitStream.destroy();
        console.log("reconnect");
        keyword.splice(0,keyword.length);
        reconnect();
      }
    });

    socket.on('key1', function(msg) {      
      keyword.push(msg);
    });

    socket.on('key2', function(msg) {
      keyword.push(msg);
      var kw = keyword.join();
      streamTwitter(kw);
    });

  });

http.listen(3000, function() {
    console.log('listening on *:3000');
});

function reconnect(){
    client = new Twitter({
    consumer_key: 'OkbfwUVURH7DbYoYr2j8N9hjE',
    consumer_secret: 'AJcdAshH4NPwsct4VK9LUyQwC2tM68eN6vEgnXt1NnM84zG5yq',
    access_token_key: '531593766-fJwCeM0FHyBNcoqpCPUIk3bhS9Q4phU7YUPqyjqB',
    access_token_secret: 'OEnlL8jBg8dHXF04xuvzTtHBJ18cPOYu0uMTBjICYpWQf'
})
}

function streamTwitter(key){
   client.stream('statuses/filter', {
  //track a word
        track: key
    }, function(tweetStream) {
      // `tweetStream` will emit a "data" event whenever
      // a new tweet is posted.
      tweetStream.on('data', function(tweet) {
        console.log(tweet.text);

        client.currentTwitStream = tweetStream;

        var k1 = new RegExp(keyword[0],'i');
        var k2 = new RegExp(keyword[1],'i');
        if(k1.test(tweet.text)){
          //console.log("emit k1");
          io.sockets.emit('tw1', {text: tweet.text});
        }
        else if(k2.test(tweet.text)){
          //console.log("emit k2");
          io.sockets.emit('tw2', {text: tweet.text});
        }
      });
    });
}