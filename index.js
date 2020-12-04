const express=require('express');
const app=express();
const server=require('http').Server(app);
const io=require('socket.io')(server);
const session = require('express-session');
const cookieParser=require('cookie-parser');

var allUsers=new Set();
/*
這個是用來記錄有哪些名字
Node js 的 Set 使用方法:
https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Set
*/

app.use(express.static(__dirname+'/public')); 
/*
我們要用到的那些 css js jpg,寫這行後，他們才可以用
node.js 的 cookie 跟 session:
https://cythilya.github.io/2015/08/18/node-cookie-and-session/
*/
app.use(session({
	secret:'12345', //session 好像要配合cookie用
	name:'testapp',
	cookie:{maxAge:80000},
	resave:false,
	saveUninitialized:true,
}));

app.get('/', (req, res) => {
	//req.query可以得到get的參數
	console.log(req.session.userName);
    res.sendFile( __dirname + '/LOGIN.html');
	//req.session.ok='123';
});

app.get('/game1.html', (req, res)=>{
	res.sendFile(__dirname+'/game1.html');
});

app.get('/queryUserName', (req, res)=>{
	/*
	給 LOGIN.html 的 ajax 用，使用者在輸入的當下
	就能知道這名字是不是有人用了
	*/
	let userName=req.query.userName;
	
	if(!allUsers.has(userName)){
		res.send('ok');
	}
	else{
		res.send('no');
	}
	
	res.end();
});

app.get('/SELECT.html', (req, res)=>{
	/*
		使用者剛進入網頁時，要用 session
		記錄現在有多少人
	*/
	req.session.userName=req.query.userName;
	allUsers.add(req.session.userName);
	console.log(allUsers);
	res.sendFile(__dirname+'/SELECT.html');
});

app.get('/logout', (req, res)=>{
	allUsers.delete(req.session.userName);
	//刪掉有的人
	console.log(allUsers);
	req.session.destroy();
	//刪掉 session
	res.end();
});

/*
express如何創聊天室
https://socket.io/docs/v3/rooms/index.html
*/

io.on('connection', (socket)=>{
	/*
		socket 的部份
	*/
	console.log('yep');
	
	socket.on('clientCanvas', (data)=>{
		io.emit('serverCanvas', data);
	});
	
	socket.on('disconnect',()=>{
	});
	
	socket.on('disconnecting', ()=>{
		console.log(socket.rooms);
	});
});

server.listen(3000, ()=>{
	console.log('start');
});
