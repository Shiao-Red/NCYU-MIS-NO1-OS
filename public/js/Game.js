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
	
	var messageTextarea=document.getElementById('messageTextareaDiv');
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
	
	window.onpopstate = function(event) {
		alert('重整就會離開房間哦!');
		window.location='/Select.html';
	};
	
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

	messageButton.addEventListener('click', ()=>{ //client傳送訊息的部份
		if(messageInput.value === '') return; //沒輸入東西的話，就直接忽略
		let data={userName:userNameInput.value, message:messageInput.value, isGuestOrHost:isGuestOrHostInput.value};
		console.log(data.isGuestOrHost);
		socket.emit('clientMessage', data);
		messageInput.value=''; //清空
	});

	for (let button of colorButton) {//換顏色的 button
		button.addEventListener('click', () => {
			let tmpString = window.getComputedStyle(button, null).backgroundColor;
			paintColor = rgbToHex(tmpString);
		});
	}
	
	eraserButton.addEventListener('click', ()=>{
		//橡皮擦
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

	socket.on('serverMessage', (data)=>{ //接收到有人傳的 data
		let userNameP=document.createElement('p'); //要加在 messageTextareaDiv 的東西  使用者名稱
		let messageP=document.createElement('p');
		
		userNameP.style.margin='0px';
		userNameP.style.display='inline-block';
		userNameP.innerHTML=data.userName+' : ';
		
		messageP.style.margin='0px';
		messageP.style.display='inline-block';
		messageP.innerHTML=data.message;
		
		if(data.isGuestOrHost === 'host'){//如果是房主傳的，顏色是紅色
			 userNameP.style.color='red';
		}
		else{
			 userNameP.style.color='green';
		}
		 
		messageTextarea.appendChild(userNameP);
		messageTextarea.appendChild(messageP);
		messageTextarea.appendChild(document.createElement('br'));
		
		messageTextarea.scrollTop = messageTextarea.scrollHeight; //自動卷到最下面
	});

	socket.on('hostCloseRoom', ()=>{
		if(isGuestOrHostInput.value === 'guest'){
			alert('房主已經離開了');
			window.location=('Select.html');
		}
		
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