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
	var numberOfPersonH1=document.getElementById('numberOfPersonH1');
	var whosRoomH1=document.getElementById('whosRoomH1');

	var hostConfigBarDiv=document.getElementById('hostConfigBarDiv');
	var arrowImage=document.getElementById('arrowImage');
	var hostConfigBarSelect=document.getElementById('hostConfigBarSelect');

	const hasTouchEvent = 'ontouchstart' in window ? true : false;

	const downEvent = hasTouchEvent ? 'ontouchstart' : 'mousedown';
	const moveEvent = hasTouchEvent ? 'ontouchmove' : 'mousemove';
	const upEvent = hasTouchEvent ? 'touchend' : 'mouseup';

	var isMouseActive=false;
	
	
	//起始位置
	let x1 = 0;
	let y1 = 0;

	// 終止位置
	let x2 = 0;
	let y2 = 0;
	
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
	
	function downEventFunction(e){ //事件獨立出來，方便之後弄掉
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
	}
	
	function moveEventFunction(e){
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
	}
	
	function upEventFunction(e){
		isMouseActive = false;
		sendCanvas();
	}
	
	function changeCanvasListen(trueOrFalse){ //加入或移除 Canvas 的監聽事件
		//就是自己的 canvas 能不能畫
		if(trueOrFalse){
			canvas.addEventListener(downEvent, downEventFunction);
			canvas.addEventListener(moveEvent, moveEventFunction);
			canvas.addEventListener(upEvent, upEventFunction);
		}
		else{
			canvas.removeEventListener(downEvent, downEventFunction);
			canvas.removeEventListener(moveEvent, moveEventFunction);
			canvas.removeEventListener(upEvent, upEventFunction);
		}
	}

	arrowImage.addEventListener('click', ()=>{ //收起或展開 host 選單的部份
		if(arrowImage.style.transform === ''){//沒變型的話，表示目前是收起來
			arrowImage.style.transform='scaleY(-1)';
			hostConfigBarDiv.style.top='0px';
		}
		else{
			arrowImage.style.transform='';
			hostConfigBarDiv.style.top='-240px';
		}
	});
	
	hostConfigBarSelect.addEventListener('change', ()=>{ //變更誰可以畫圖的事件
		socket.emit('clientDrawerChange', hostConfigBarSelect.value);
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
	});

	/*
	******************************
	******************************
	* 下面的部份是 socket 的程式碼
	******************************
	******************************
	*/
	
	socket.on('serverProfile', (data)=>{//初始化的部份
		if(isGuestOrHostInput.value === '' || attendedRoomInput.value === '' || userNameInput === ''){ //把那些資訊都存到前端的 hidden input裡
			isGuestOrHostInput.value=data.isGuestOrHost;
			attendedRoomInput.value=data.attendedRoom;
			userNameInput.value=data.userName;
		}
		
		whosRoomH1.innerText=data.attendedRoom;// 顯示房主的名字
		
		if(isGuestOrHost.value === 'guest'){//只有 host 才會顯示 host config bar
			hostConfigBarDiv.style.display='none';
		}
		
		if(isGuestOrHost.value === 'host'){ //host 沒選擇的話，預設是他自己可以畫畫
			changeCanvasListen(true);
		}
	});
	
	socket.on('serverDrawerChange', (data)=>{ //可以畫畫的人變了
		if(userNameInput.value === data){ //自己可以畫畫了
			changeCanvasListen(true);
		}
		else{//自己不能畫畫了
			changeCanvasListen(false); //如果自己的 canvas 被去除原本就沒註冊的事件，好像沒關系
		}
	});
	
	socket.on('numberOfPersonChange', (data)=>{ //更動人數
		numberOfPersonH1.innerText=data.toString();
	});

	socket.on('hostConfigBarSelectUpdate', (data)=>{ //更新 host config bar select 可選的人
		hostConfigBarSelect.innerHTML=''; //先清空內容
		
		for(let d of data){
			let tmpOption=document.createElement('option');
			tmpOption.innerText=d;
			tmpOption.value=d;
			hostConfigBarSelect.appendChild(tmpOption);
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