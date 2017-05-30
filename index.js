// Setup basic express server
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').createServer(app);
// http server를 socket.io server로 upgrade한다
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

var clients = newMap();

app.get('/clickToCall/:id/:phone/:cid', function(req, res) {
  var id = req.params.id;
  var phone = req.params.phone;
  var cid = req.params.cid;
  console.log('api clickToCall ; id : %s, phone : %s, cid : %s', id, phone, cid);

  var data = {"id": id, "phone":phone, "cid":cid};
  //io.emit('clickToCall', data);
  //io.to(id + "_" + phone).emit('clickToCall', data);
  clients.get(id+"_"+phone).emit('clickToCall', data);
});

// connection event handler
// connection이 수립되면 event handler function의 인자로 socket이 들어온다
io.on('connect', function (socket) {
  console.log('Socket initiated!');

  // 접속한 클라이언트의 정보가 수신되면
  socket.on('login', function(data) {
    console.log('Client logged-in:\n phone:' + data.phone + '\n id: ' + data.id);

    // socket에 클라이언트 정보를 저장한다
    socket.phone = data.phone;
    socket.id = data.id + '_' + data.phone;
    console.log('socket.id : ' + socket.id);
    socket.emit(socket.id);

    // 접속한 클라이언트를 배열에 담기
    clients.put(socket.id, socket);
  });

  socket.on('clickToCall', function(data) {
    clickToCall(data);
  });

  socket.on('disconnect', function() {
    console.log('user disconnected');
    clients.remove(socket.id, socket);
  });
});

function clickToCall(data) {
  console.log('Click to Call : ' + data.id);
}

function newMap() {
  var map = {};
  map.value = {};
  map.getKey = function(id) {
    return "k_"+id;
  };
  map.put = function(id, value) {
    var key = map.getKey(id);
    map.value[key] = value;
  };
  map.contains = function(id) {
    var key = map.getKey(id);
    if(map.value[key]) {
      return true;
    } else {
      return false;
    }
  };
  map.get = function(id) {
    var key = map.getKey(id);
    if(map.value[key]) {
      return map.value[key];
    }
    return null;
  };
  map.remove = function(id) {
    var key = map.getKey(id);
    if(map.contains(id)){
      map.value[key] = undefined;
    }
  };

  return map;
}
