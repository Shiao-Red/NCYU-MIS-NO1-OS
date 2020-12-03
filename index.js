const express=require('express');
const app=express();
const server=require('http').Server(app);
const io=require('socket.io')(server);
const session = require('express-session');
const cookieParser=require('cookie-parser');

app.use(express.static(__dirname+'/public')); //�ڭ̭n�Ψ쪺���� css js jpg,�g�o���A�L�̤~�i�H��
app.use(session({
	secret:'12345', //session �n���n�t�Xcookie��
	name:'testapp',
	cookie:{maxAge:80000},
	resave:false,
	saveUninitialized:true,
}));

app.get('/', (req, res) => {
    res.sendFile( __dirname + '/LOGIN.html');
	//req.session.ok='123';
	
	console.log(req.session.ok);
});

app.get('/game1.html', (req, res)=>{
	res.sendFile(__dirname+'/game1.html');
	
});

io.on('connection', (socket)=>{
	console.log('yep');
	
	socket.on('clientCanvas', (data)=>{
		io.emit('serverCanvas', data);
	});
	socket.on('disconnect',()=>{
	});
});

server.listen(3000, ()=>{
	console.log('start');
});
