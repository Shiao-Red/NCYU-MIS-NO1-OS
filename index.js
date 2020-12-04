const express=require('express');
const app=express();
const server=require('http').Server(app);
const io=require('socket.io')(server);
const session = require('express-session');
const cookieParser=require('cookie-parser');

var allUsers=new Set();
/*
�o�ӬO�ΨӰO�������ǦW�r
Node js �� Set �ϥΤ�k:
https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Set
*/

app.use(express.static(__dirname+'/public')); 
/*
�ڭ̭n�Ψ쪺���� css js jpg,�g�o���A�L�̤~�i�H��
node.js �� cookie �� session:
https://cythilya.github.io/2015/08/18/node-cookie-and-session/
*/
app.use(session({
	secret:'12345', //session �n���n�t�Xcookie��
	name:'testapp',
	cookie:{maxAge:80000},
	resave:false,
	saveUninitialized:true,
}));

app.get('/', (req, res) => {
	//req.query�i�H�o��get���Ѽ�
	console.log(req.session.userName);
    res.sendFile( __dirname + '/LOGIN.html');
	//req.session.ok='123';
});

app.get('/game1.html', (req, res)=>{
	res.sendFile(__dirname+'/game1.html');
});

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

app.get('/SELECT.html', (req, res)=>{
	/*
		�ϥΪ̭�i�J�����ɡA�n�� session
		�O���{�b���h�֤H
	*/
	req.session.userName=req.query.userName;
	allUsers.add(req.session.userName);
	console.log(allUsers);
	res.sendFile(__dirname+'/SELECT.html');
});

app.get('/logout', (req, res)=>{
	allUsers.delete(req.session.userName);
	//�R�������H
	console.log(allUsers);
	req.session.destroy();
	//�R�� session
	res.end();
});

/*
express�p��в�ѫ�
https://socket.io/docs/v3/rooms/index.html
*/

io.on('connection', (socket)=>{
	/*
		socket ������
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
