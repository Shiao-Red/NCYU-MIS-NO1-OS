const express=require('express');
const app=express();
const server=require('http').Server(app);
const io=require('socket.io')(server);
const session = require('express-session');
const cookieParser=require('cookie-parser');

var allUsers=new Set();
var allRooms=new Set();

var sessionMiddleware = session({
  secret: "1234",
  resave: true,
  saveUninitialized: true
});
io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});
/*
這個可以讓 session 在 socket 裡面被存到
https://stackoverflow.com/questions/32025173/nodejs-access-sessions-inside-socket
*/

/*
我原本那個session的寫法，不過被取代了，看看之後會不會用到
app.use(session({
	secret:'12345',
	name:'testapp',
	cookie:{maxAge:80000},
	resave:false,
	saveUninitialized:true,
}));
*/

app.use(sessionMiddleware);
/*
用 Set 來記有什麼人
Node js 的 Set 使用方法
https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Set
*/

app.use(express.static(__dirname+'/public'));
io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});
/*
https://cythilya.github.io/2015/08/18/node-cookie-and-session/
*/


/*
	這些是會用到的 session
	userName:自己的名稱
	attendedRoom:加入的聊天室，如如 attendedRoom === userName
	表示自己就是房主
*/

app.get('/queryUserName', (req, res)=>{
	/*
	可以讓使用者在輸入時，就知道這名字有沒有人使用
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

app.get('/queryRooms', (req, res)=>{
	res.send(Array.from(allRooms));//現有的房間，以陣列來傳送
	res.end();
});

app.get('/isRoomAlive', (req, res)=>{
	if(allRooms.has(req.query.Room)){
		res.send('yes');
	}
	else{
		res.send('no');
	}
	res.end()
});

app.get('/logout', (req, res)=>{
	allUsers.delete(req.session.userName);
	//登出作業
	req.session.destroy();
	//清除 session
	res.end();
});

app.get('/createRoom', (req, res)=>{
	allRooms.add(req.session.userName);
	req.session.attendedRoom=req.session.userName; //創建房間的session
	res.end();
});



app.get('/', (req, res) => {
	//req.query可以得到 parameters
	if(!req.session.userName){
		res.sendFile( __dirname + '/Login.html');
	}
	else{
		res.sendFile(__dirname+'/Select.html');
	}
});

app.get('/Game.html', (req, res)=>{
	if(!req.session.userName){
		res.sendFile( __dirname + '/Login.html');
		return;
	}
	/*
		如果是以 Guest 進入的話，預設是沒有 attendedRoom，
		Guest 會在 GameRoomList 以 get 送 Room 的參數來告知
		它加入的是哪個房間
	*/
	
	console.log(`game.html?room=${req.query.Room}`);
	if(req.query.Room){
		req.session.attendedRoom=req.query.Room;
	}
	
	res.sendFile(__dirname+'/Game.html');
});

app.get('/Select.html', (req, res)=>{
	/*
		選單的 html 
	*/
	if(req.query.userName){
		req.session.userName=req.query.userName;
		allUsers.add(req.session.userName);
		res.sendFile(__dirname+'/Select.html');
	}
	else if(req.session.userName){
		req.session.attendedRoom=undefined;
		res.sendFile(__dirname+'/Select.html');
	}
	else{
		res.sendFile(__dirname+'/Login.html');
	}
});

app.get('/GameRoomList.html', (req, res)=>{
	res.sendFile(__dirname+'/GameRoomList.html');
});

/*
express創造 room 的方法
https://socket.io/docs/v3/rooms/index.html
*/

io.on('connection', (socket)=>{
	//socket 的程式

	let isGuestOrHost;
	
	if(allRooms.has(socket.request.session.userName)){
	//如果這人有創房的話，allRooms 裡就會有他的名字
		isGuestOrHost='host'
	}
	else{
		isGuestOrHost='guest'
	}
	
	socket.join(socket.request.session.attendedRoom); //加入房間
	console.log(`attendedRoom = ${socket.request.session.attendedRoom}`);
	
	io.to(socket.request.session.attendedRoom).emit('isGuestOrHost', {isGuestOrHost:isGuestOrHost, attendedRoom:socket.request.session.attendedRoom});
	//讓 client 端知道自己是 host or guest
	//還有加入的房間是哪個
	
	socket.on('clientCanvas', (data)=>{
		io.emit('serverCanvas', data);
	});
	
	socket.on('clientMessage', (data)=>{
		io.to(socket.request.session.attendedRoom).emit('serverMessage', data);
	});
	
	socket.on('disconnect',()=>{
		if(isGuestOrHost === 'host'){ //是host的話，還要清除房間
			io.to(socket.request.session.attendedRoom).emit('hostCloseRoom');
			allRooms.delete(socket.request.session.userName);
		}
		socket.leave(socket.request.session.attendedRoom); //離開房間
	});
});

server.listen(80, ()=>{
	console.log('start');
});
