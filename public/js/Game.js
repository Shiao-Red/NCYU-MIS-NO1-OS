window.onload=function(){
	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext('2d');
	const socket=new io();


	var paintColor;
	var colorButton = document.getElementsByClassName('color-button');
	var isGuestOrHostInput=document.getElementById('isGuestOrHost');
	var attendedRoomInput=document.getElementById('attendedRoom');
	var userNameInput=document.getElementById('userName');
	var eraserButton=document.getElementById('eraserButton');

	var messageInput=document.getElementById('messageInput');
	var messageButton=document.getElementById('messageButton');

	//起始位置
	let x1 = 0;
	let y1 = 0;

	// 終止位置
	let x2 = 0;
	let y2 = 0;

	const hasTouchEvent = 'ontouchstart' in window ? true : false;

	const downEvent = hasTouchEvent ? 'ontouchstart' : 'mousedown';
	const moveEvent = hasTouchEvent ? 'ontouchmove' : 'mousemove';
	const upEvent = hasTouchEvent ? 'touchend' : 'mouseup';

	var isMouseActive=false;

	function sendCanvas(){
		let canvasContents=canvas.toDataURL();
		socket.emit('clientCanvas', canvasContents);
	}

	canvas.addEventListener(downEvent, function (e) {
		isMouseActive = true;
		x1 = e.offsetX;
		y1 = e.offsetY;
		
		if(paintColor === '#ffffff'){
			ctx.lineWidth=50;
		}
		else{
			ctx.lineWidth = 5;
		}
		
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
	});

	canvas.addEventListener(moveEvent, function (e) {
		if (!isMouseActive) {
			return;
		}
		// 起始點
		x2 = e.offsetX;
		y2 = e.offsetY;
		
		// 畫筆部份
		ctx.strokeStyle = paintColor || "#000000";
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();

		x1 = x2;
		y1 = y2;
	})

	canvas.addEventListener(upEvent, function (e) {
		isMouseActive = false;
		sendCanvas();
	});

	messageButton.addEventListener('click', ()=>{
		if(messageInput.value === '') return;
	
		socket.emit('clientMessage', messageInput.value);
	});

	function rgbToHex(rgb) {  //把 rgb 轉成 16 進位
		let returnString="#";
		rgb = rgb.slice(4, -1);
		rgb=rgb.split(',');

		for (s of rgb) {
			let tmpInt = parseInt(s);
			if (tmpInt === 0) {
				returnString += '00';
			}
			else {
				returnString += tmpInt.toString(16);
			}
		}

		return returnString;
	}

	for (let button of colorButton) {//換顏色的 button
		button.addEventListener('click', () => {
			let tmpString = window.getComputedStyle(button, null).backgroundColor;
			paintColor = rgbToHex(tmpString);
		});
	}
	
	eraserButton.addEventListener('click', ()=>{
		let tmpString = window.getComputedStyle(eraserButton, null).backgroundColor;
		paintColor = rgbToHex(tmpString);
		console.log(paintColor);//test
	});

	/*
	******************************
	******************************
	* 下面的部份是 socket 的程式碼
	******************************
	******************************
	*/
	
	socket.on('serverProfile', (data)=>{
		if(isGuestOrHostInput.value === '' || attendedRoomInput.value === '' || userNameInput === ''){
			isGuestOrHostInput.value=data.isGuestOrHost;
			attendedRoomInput.value=data.attendedRoom;
			userNameInput.value=data.userName;
		}
	});

	socket.on('serverMessage', (data)=>{
		alert(data);
	});

	socket.on('hostCloseRoom', ()=>{
		alert('房主已經離開了');
		window.location=('Select.html');
	});

	socket.on('serverCanvas', (data)=>{
		let image=new Image();
		image.onload=function(){
			ctx.drawImage(image, 0, 0);
		}
		image.src=data;
	});

	socket.emit('clientProfile'); //向 server 發送請求(有關自已是 guest or host，還有加入的房名，名字
}