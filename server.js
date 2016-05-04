"use strict"
var koa = require('koa');
var Router = require('koa-router');
var fs = require('fs');
var path = require('path');
var mime = require("./mime").types;
var app  = koa();
app.keys = ['scret','keys'];
var router = new Router();

var server = require('http').createServer(app.callback());
var io = require('socket.io')(server);

var myReadFile = function(_this, _path){
  var ext = path.extname(_this.url);
       ext = ext ? ext.slice(1) : 'html';
       var contentType = mime[ext] || "text/plain";
       _this.status = 200;
       _this.type = contentType;
       _this.body = fs.readFileSync(_path);
}





// socket.io
io.on('connection', function(socket){
    console.log('connect');
    socket.emit('lxk', '连接成功咯');
    socket.on('message',function(data){
        console.log('in connection message')
    })
    socket.on('disconnect', function(){
      console.log('in disconnect')
    })
});
//chat房间
io.of('chat').on('connection', function(socket){
//用emit代替send
  socket.emit('chat', '正在聊天');
  socket.on('message', function(data){
    console.log('chat message data = ' + data);
  })
  socket.on('disconnect', function(){
    console.log('chat disconnect');
  })
})




//koa-router
router
    .get('/',function*(next){
        var _path = './index.html';
        myReadFile(this, _path);
    })




app
  .use(router.routes())
  .use(router.allowedMethods());

server.listen(2333)
