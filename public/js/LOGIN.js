window.onload=function(){
	var button=document.getElementsByTagName('button')[0];
	var text=document.getElementsByTagName('input')[0];
	
	text.addEventListener('input', ()=>{
		let userName=text.value;
		console.log(userName);
		$.get('queryUserName?userName='+userName, (data)=>{
			console.log(data);
		});
	});
}

