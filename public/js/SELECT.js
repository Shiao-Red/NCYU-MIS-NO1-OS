window.onload=function(){
	var buttons=document.getElementsByClassName('selectButton');
	
	for(let btn of buttons){
		btn.addEventListener('click', (event)=>{
			let clickedBtn=event.srcElement.innerText;
			
			switch(clickedBtn){
				case '新建房間':
					$.get('createRoom');
					window.location='Game.html';
					break;
				case '加入房間':
					window.location='GameRoomList.html';
					break;
				case '遊戲排行榜':
					console.log(3);
					break;
				case '登出':
					$.get('logout');
					window.location='/';
			}
		});
	}
}

