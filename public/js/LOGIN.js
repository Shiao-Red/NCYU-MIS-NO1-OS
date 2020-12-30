window.onload=function(){
	var isInputOk;
	var button=document.getElementsByTagName('button')[1];
	var text=document.getElementsByTagName('input')[0];
	var messageBar=document.getElementById('findpass');
	var userName;
	
	text.addEventListener('input', ()=>{
		userName=text.value;
		
		if(userName === ''){
			messageBar.innerText='請輸入你的暱稱';
			isInputOk=false;
			return;
		}
		
		if(userName.length < 3){
			messageBar.style.color='red';
			messageBar.innerText='長度太短';
			isInputOk=false;
			return;
		}
		
		$.get('queryUserName?userName='+userName, (data)=>{
			if(data === 'ok'){
				messageBar.style.color='green';
				messageBar.innerText='暱稱沒問題';
				isInputOk=true;
			}
			else{
				messageBar.style.color='red';
				messageBar.innerText='這暱稱有人用了';
				isInputOk=false;
			}
		});
	});
	
	button.addEventListener('click', ()=>{
		if(isInputOk){
			window.location='/SELECT.html?userName='+userName;
		}
		else{
			alert('你的輸入有誤');
		}
	});
}

