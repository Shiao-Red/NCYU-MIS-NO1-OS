const express=require('express');
const http=require('http');
const app=express();
const server=http.Server(app);
const io=require('socket.io')(server);

app.use(express.static(__dirname+'/public')); //�ڭ̭n�Ψ쪺���� css js jpg,�g�o���A�L�̤~�i�H��


app.get('/', (req, res) => {
    res.sendFile( __dirname + '/LOGIN.html');
});

io.on('connection', (socket)=>{
	console.log('yep');
	
	socket.on('disconnect',()=>{
		onLine=(onLine < 0) ? 0:onLine-=1
		io.emit('online', onLine);
	});
});

server.listen(3000, ()=>{
	console.log('start');
});
