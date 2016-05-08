"use strict"
var rce = React.createElement.bind();
var socket = io.connect('/');
React.initializeTouchEvents(true); 

var total = React.createClass({displayName:"total",
	getInitialState : function(){
		return{
			nickName : '',
			inputValue : '',
			users : [],
			userNum : 0,
			infoSystem : [],
			messages : []
		}
	},
	onJoin : function(nickName, userNum){
		let users = this.state.users;
		let infoSystem = this.state.infoSystem;
		infoSystem.push(nickName + ' joined ~   ' );
		users.push(nickName);
		this.setState({
			users : users,
			userNum : userNum,
			infoSystem : infoSystem
		})
	},
	onLeft : function(nickName, userNum){
		let users = this.state.users;
		users.splice(users.indexOf(nickName), 1);
		let infoSystem = this.state.infoSystem;
		infoSystem.push(nickName + ' left ...   ' );
		this.setState({
			users : users,
			userNum : userNum
		})
	},
	onNewMessage : function(nickName, message){
		let messages = this.state.messages;
		let msg = nickName + '  :  ' + message;
		messages.push(msg);
		this.setState({messages : messages});
	},
	componentDidUpdate : function(){
		$('.chatMain').animate({scrollTop : $('.chatMain').height()}, 0);
		$('.inputMain input').focus();
	},
	componentDidMount : function(){
		$.get('getMethod/getNickName', function(data,status){
			this.setState({
				'nickName': data.nickName,
				'users' : data.userNickName,
				'userNum' : data.userNum
			});
		}.bind(this))
		socket.on('connect', function(){
			// socket.send('hello world!');
			socket.emit('add user', {'nickName':this.state.nickName});
			//用户加入
			socket.on('user joined', function(data){
				console.info(data.nickName + " joined~  now we have " + data.userNum);
				this.onJoin(data.nickName, data.userNum);
			}.bind(this))
			//收到新消息
			socket.on('new message', function(data){
				console.info(data.nickName + " : " + data.message);
				this.onNewMessage(data.nickName, data.message);
			}.bind(this))
			//用户离开
			socket.on('user left', function(data){
				console.info(data.nickName + " left...  now we have " + data.userNum);
				this.onLeft(data.nickName, data.userNum);
			}.bind(this))
			// socket.on('chat', function(data){
			// 	console.info('data = ' + data.message);
			// })
		}.bind(this));
	},
	handleSendMessage: function(){
		// socket.send('i send this message to you');
		socket.emit('new message', {'nickName':this.state.nickName, 'message' : this.state.inputValue});
		this.setState({'inputValue':''});
	},
	handleInputChange : function(e){
		this.setState({'inputValue':e.target.value});
	},
	handleKeyDown : function(e){
		if(e['key'] == 'Enter'){
			this.handleSendMessage();
		}
	},

	render : function(){
		let infoSystem = this.state.infoSystem;
		// infoSystem.reverse();
		let infoSystemList = infoSystem.map(function(value,index){
			return (
				rce('p',{'key' : 'infoSystem' + index}, value)
			);
		})
		infoSystemList.reverse();


		let users = this.state.users;
		let userList = users.map(function(value, index){
			return (
				rce('p',{'key': 'users' + index, 'style':{'paddingLeft': '10px'}}, value)
			);
		})

		let messages = this.state.messages;
		let msgList = messages.map(function(value, index){
			return (
				rce('p', {'key' : 'messages' + index}, value)
			);
		})
		return (
			rce('div',{'className':'myMain'},
				// rce('p',null,this.state.nickName)
				rce('div',{'className':'contentMain'},
					rce('div',{'className':'chatMain', 'ref':'chatMain'},
						// rce('p',null,'chat')
						msgList
					),
					rce('div',{'className':'infoMain'},
						// rce('p',null,'info')
						rce('div',{'className':'infoSystem'},
							// rce('p',null,'人数 ： ' + this.state.userNum),
							rce('div',null,
								infoSystemList
							)
						),
						rce('div',{'className':'infoUser'},
							rce('p',null, 'total : ' + this.state.userNum),
							userList
						)
					)
				),
				rce('div',{'className':'inputMain'},
					rce('input',{'value':this.state.inputValue, 'onChange':this.handleInputChange, 'onKeyDown' : this.handleKeyDown}),
					rce('button',{'onClick':this.handleSendMessage},'send')
				)
			)
		);
	}
})



React.render(rce(total,null), document.body);

