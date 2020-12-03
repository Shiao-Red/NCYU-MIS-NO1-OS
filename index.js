const express=require('express');
const app=express();
const server=require('http').Server(app);
const io=require('socket.io')(server);
const session = require('express-session');
const cookieParser=require('cookie-parser');

app.use(express.static(__dirname+'/public')); //我們要用到的那些 css js jpg,寫這行後，他們才可以用
app.use(session({
	secret:'12345', //session 好像要配合cookie用
	name:'testapp',
	cookie:{maxAge:80000},
	resave:false,
	saveUninitialized:true,
}));

app.get('/', (req, res) => {
    res.sendFile( __dirname + '/LOGIN.html');
	req.session.ok='123';
	
	console.log(req.session.ok);
});

io.on('connection', (socket)=>{
	console.log('yep');
	
	socket.on('disconnect',()=>{
	});
});

server.listen(3000, ()=>{
	console.log('start');
});
