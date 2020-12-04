window.onload=function(){
	var buttons=document.getElementsByClassName('selectButton');
	
	for(let btn of buttons){
		btn.addEventListener('click', (event)=>{
			let clickedBtn=event.srcElement.innerText;
			
			switch(clickedBtn){
				case '一對一聊天':
					console.log(1);
					break;
				case '群組聊天':
					console.log(2);
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

