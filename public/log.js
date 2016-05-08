"use strict"
var rce = React.createElement.bind();
React.initializeTouchEvents(true); 

var total = React.createClass({displayName : "total",
	getInitialState : function(){
		return{
			inputValue : ""
		}
	},
	handleClick : function(e){
		// console.info(  $(e.target).prev()  );
		$.post('/postMethod/logIn',{nickName : this.state.inputValue}  ,function(data,status){
			// console.info(data);
			if(data.ok == '1'){
				window.location = "index.html";
			}
			else{
				alert('something wrong');
			}
		})
	},
	onChange : function(e){
		this.setState({'inputValue': e.target.value});
	},
	render : function(){
		return (
			rce('div',null,
				rce('input',{'placeholder':'昵称', 'value':this.state.inputValue, 'onChange' : this.onChange}),
				rce('button',{'onClick' : this.handleClick},'提交')
			)
		);
	}
})


React.render(rce(total,null), document.body);
