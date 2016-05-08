"use strict"
const koa = require('koa');
const koaStatic = require('koa-static')
const Router = require('koa-router');
const session = require('koa-session');
const fs = require('fs');
const path = require('path');
const mime = require("./mime").types;
const parse = require('co-body');

var app  = koa();
app.keys = ['scret','keys'];
const opts = {'maxAge' : 60*60*1000};
app.use(session(app,opts));
var router = new Router();

var server = require('http').createServer(app.callback());
var io = require('socket.io')(server);
var userNum = 0;
var userNickName = [];


app.use(function* (next){
    	// console.log('有人访问： ' + this.ip);
    	// console.log('user-agent : ' + this.header['user-agent']);
     //   console.log('path : ' + this.path);
    	// console.log('************************\n');
        // this.session.name = null;
        // this.session.isSigned = null;
        var ext = path.extname(this.url);
        ext = ext ? ext.slice(1) : 'unknow';
        if(ext == 'html' && this.session.isSigned != '1' &&this.path != '/log.html'){
          this.redirect('log.html');
          return ;
        }
        else if(this.path == '/log.html' && this.session.isSigned == '1' && ext == 'html'){
          this.redirect('index.html');
          return ;
        }
    	// for(var i in this.header){
    	// 	console.log(i + " : " + this.header[i]);
    	// }
    	yield next;
})


app.use(koaStatic('./public/'));

//io.sockets.emit() 全局广播
//socket.broadcast.emit() 全局广播（除了自己）

// socket.io
io.on('connection', function(socket){
//用emit代替send
  //添加用户
  socket.on('add user', function(data){
      // if(! userNickName.indexOf(data.nickName)){
          socket.nickName = data.nickName;
          ++userNum;
          // userNickName.push(data.nickName);
          io.sockets.emit('user joined', {
          // socket.broadcast.emit('user joined', {
              nickName : socket.nickName,
              userNum : userNum
          })
      // }
  })

  socket.on('new message', function(data){
      io.sockets.emit('new message', {
      // socket.broadcast.emit('new message', {
          nickName : socket.nickName,
          message : data.message
      })
  })

  socket.on('disconnect', function(){
    --userNum;
    io.sockets.emit('user left', {
    // socket.broadcast.emit('user left', {
        nickName : socket.nickName,
        userNum : userNum
    })
  })


  socket.on('chat', function(data){
    console.log('chat data : ' + data.message);
    // socket.broadcast.to('chatRoom').emit('chat', {message : data.nickName + " : " + data.message});
    io.sockets.emit('chat', {message : data.nickName + " : " + data.message});
  })
});




// koa-router
router
    .get('/:name',function*(next){
        this.redirect('404.jpg');
    })
    .get('/getMethod/:name', function* (next){
        if(this.params.name == 'getNickName'){
            this.body = {
                nickName : this.session.nickName,
                userNickName : userNickName,
                userNum : userNum
            }
        }
    })
    .post('/postMethod/:name', function* (next){
        var body = yield parse(this);
        if(this.params.name == 'logIn'){
            if(this.session.isSigned != "1"){
              this.session.nickName = body.nickName;
              this.session.isSigned = '1';
              this.body = {ok : '1'};
            }
            else{
              this.body  =  {ok : '-1'};
            }
            return yield next;
        }
    })





app.use(router.routes()).use(router.allowedMethods());
server.listen(2333)
