const express=require('express');
const http=require('http');
const app=express();
const server=http.Server(app);
const io=require('socket.io')(server);

app.use(express.static(__dirname+'/public')); //我們要用到的那些 css js jpg,寫這行後，他們才可以用


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
