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
�o�O�p���� socket �̭� also �i�HŪ�� session
https://stackoverflow.com/questions/32025173/nodejs-access-sessions-inside-socket
*/

/*
�쥻session�]�w���g�k�A���L�Q���N�F�A�ݬݤ����ٷ|���|�Ψ�
app.use(session({
	secret:'12345', //session �n���n�t�Xcookie��
	name:'testapp',
	cookie:{maxAge:80000},
	resave:false,
	saveUninitialized:true,
}));
*/

app.use(sessionMiddleware);
/*
�o�ӬO�ΨӰO�������ǦW�r
Node js �� Set �ϥΤ�k:
https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Set
*/

app.use(express.static(__dirname+'/public'));
io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});
/*
�ڭ̭n�Ψ쪺���� css js jpg,�g�o���A�L�̤~�i�H��
node.js �� cookie �� session:
https://cythilya.github.io/2015/08/18/node-cookie-and-session/
*/

app.get('/queryUserName', (req, res)=>{
	/*
	�� LOGIN.html �� ajax �ΡA�ϥΪ̦b��J����U
	�N�ા�D�o�W�r�O���O���H�ΤF
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
	console.log(allRooms);
	res.send(Array.from(allRooms));//�ন array �A�ǰe�L�h
	res.end();
});

app.get('/logout', (req, res)=>{
	allUsers.delete(req.session.userName);
	//�R�������H
	console.log(allUsers);
	req.session.destroy();
	//�R�� session
	res.end();
});

app.get('/createRoom', (req, res)=>{
	allRooms.add(req.session.userName);
});



app.get('/', (req, res) => {
	console.log(allUsers);
	//req.query�i�H�o��get���Ѽ�
	if(!req.session.userName){
		res.sendFile( __dirname + '/Login.html');
	}
	else{
		res.sendFile(__dirname+'/Select.html');
	}
    
	//req.session.ok='123';
});

app.get('/game1.html', (req, res)=>{
	res.sendFile(__dirname+'/game1.html');
});

app.get('/Select.html', (req, res)=>{
	/*
		�ϥΪ̭�i�J�����ɡA�n�� session
		�O���{�b���h�֤H
	*/
	if(!req.session.userName){
		req.session.userName=req.query.userName;
		allUsers.add(req.session.userName);
	}
	
	res.sendFile(__dirname+'/SELECT.html');
});

app.get('/GameRoomList.html', (req, res)=>{
	res.sendFile(__dirname+'/GameRoomList.html');
});

/*
express�p��в�ѫ�
https://socket.io/docs/v3/rooms/index.html
*/

io.on('connection', (socket)=>{
	//socket ������

	let isUserOrHost;
	let userName=socket.request.session.userName;
	
	if(allRooms.has(userName)){
		isUserOrHost='host'
	}
	else{
		isUserOrHost='user'
	}
	
	io.emit('isUserOrHost', isUserOrHost);
	
	socket.on('clientCanvas', (data)=>{
		io.emit('serverCanvas', data);
	});
	
	socket.on('disconnect',()=>{
		if(isUserOrHost === 'host'){
			allRooms.delete(userName);
		}
	});
});

server.listen(3000, ()=>{
	console.log('start');
});
