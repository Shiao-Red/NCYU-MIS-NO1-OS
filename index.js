const express=require('express');
const app=express();
const server=require('http').Server(app);
const io=require('socket.io')(server);
const session = require('express-session');
const cookieParser=require('cookie-parser');
const roomMaxPerson=10; //限制最大人數

var allUsers=new Set();
var allRooms=new Map();

/*
	javascript map:https://pjchender.github.io/2018/07/30/js-javascript-map/
	map 用來記有什麼房間，裡面有哪些人
*/

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
	res.send(Array.from(allRooms.keys()));//現有的房間，以陣列來傳送 test
	res.end();
});

app.get('/canEnterRoom', (req, res)=>{
	if(allRooms.has(req.query.Room)){
		if(allRooms.get(req.query.Room).length === roomMaxPerson){
			res.send('full');
		}
		else{
			res.send('can');
		}
	}
	else{
		res.send('gone');
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
	//創房間時使用的get路徑
	req.session.isGuestOrHost='host';
	allRooms.set(req.session.userName, [req.session.userName]);
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
	req.session.isGuestOrHost='guest';
	res.sendFile(__dirname+'/GameRoomList.html');
});

/*
express創造 room 的方法
https://socket.io/docs/v3/rooms/index.html
*/

io.on('connection', (socket)=>{
	//socket 的程式
	let userName=socket.request.session.userName;
	let isGuestOrHost=socket.request.session.isGuestOrHost;
	let attendedRoom=socket.request.session.attendedRoom;
	
	if(!allRooms.has(userName) && isGuestOrHost === 'host'){
		//這裡是處理房主重整房間後，會發生房間消失的事情
		allRooms.set(userName, [userName]);
	}
	
	if(isGuestOrHost === 'guest'){ //更新 allRooms 的人
		allRooms.get(attendedRoom).push(userName);
	}
	
	socket.join(attendedRoom); //加入房間
	
	io.to(attendedRoom).emit('numberOfPersonChange', allRooms.get(attendedRoom).length); //有人加入時，人數的變化事件
	io.to(attendedRoom).emit('hostConfigBarSelectUpdate', Array.from(allRooms.get(attendedRoom))); //更新 host config bar select 的東東
	
	socket.on('clientProfile', ()=>{//client端的請求
		io.to(attendedRoom).emit('serverProfile', {isGuestOrHost:isGuestOrHost, attendedRoom:attendedRoom, userName:userName});
		//讓 client 端知道自己是 host or guest
		//還有加入的房間是哪個，人數也順便
	});
	
	socket.on('clientDrawerChange', (data)=>{ //server收到畫畫的人更動的事件
		io.to(attendedRoom).emit('serverDrawerChange', data);
	});

	socket.on('clientCanvas', (data)=>{
		io.to(attendedRoom).emit('serverCanvas', data);
	});
	
	socket.on('clientMessage', (data)=>{
		io.to(attendedRoom).emit('serverMessage', data);
	});
	
	socket.on('disconnect',()=>{
		if(isGuestOrHost === 'host'){ //是host的話，還要清除房間
			io.to(attendedRoom).emit('hostCloseRoom'); //叫其它人離開
			/*
				我無法透過 delete socket.request.session.attendedRoom 來去除
				session，不過我有其它解決辦法，在 app.get('/Game.html')那邊
				有處理
			*/
			allRooms.delete(userName);
		}
		else{
			let array=allRooms.get(attendedRoom);
			
			if(array){
				array=array.filter(function(item){
					return item !== userName;
				});
				allRooms.set(attendedRoom, array);
	
				io.to(attendedRoom).emit('numberOfPersonChange', allRooms.get(attendedRoom).length);
				io.to(attendedRoom).emit('hostConfigBarSelectUpdate', Array.from(allRooms.get(attendedRoom))); //更新 host config bar select 的東東
			}
		}
		
		
		socket.leave(attendedRoom); //離開房間
	});
});

server.listen(80, ()=>{
	console.log('start');
});
