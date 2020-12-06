window.onload=function(){
	var listTable=document.getElementById('listTable');
	var colCount=0;
	var colMax=3;
	var tmpTr;
	var tableWidth=window.innerWidth*3/4; //直接調整 table 的寛
	var tableTrHeight=window.innerHeight/8;
	
	listTable.style.width=tableWidth+"px";
	
	function enterGame(event){ //按鈕被按時，要做的確認
		let whosRoom=event.srcElement.innerText;
		$.get('/isRoomAlive?Room='+whosRoom,(data)=>{
			if(data === 'yes'){
				window.location='/Game.html?Room='+whosRoom;
			}
			else{
				alert('這個房間已經不在了!!');
				window.location.reload();
			}
		}); 
	}
	
	function updateRooms(){
		$.get('queryRooms', (data)=>{
			if(data.length === 0){
				alert("目前好像沒有人開任何房間哦，等等再看看吧");
				window.location='/Select.html';
			}
			for(let d of data){
				if(colCount === 0){ //新的 tr
					tmpTr=document.createElement('tr');
					tmpTr.style.height=tableTrHeight+"px";
					tmpTr.className="list-tr"
				}
			
				let tmpButton=document.createElement('button');
				let tmpTd=document.createElement('td');
			
				tmpButton.className="list-button";
				tmpButton.onclick=enterGame;
				tmpButton.innerText=d;
				tmpButton.style.width=tableWidth/3 - 10;
				tmpButton.style.height=tableTrHeight - 10;
			
				tmpTd.className="list-td";
				tmpTd.appendChild(tmpButton);
				tmpTr.appendChild(tmpTd);
				colCount++;
			
				if(colCount === 3){
					colCount=0;
					listTable.appendChild(tmpTr);
				}
			}
		
			if(colCount != 0){ //如果沒有剛好滿三個的話
				for(let i=3; i > colCount; i--){
					let tmpTd=document.createElement('td');
					tmpTd.className="list-td";
					tmpTr.appendChild(tmpTd);
				}
				listTable.appendChild(tmpTr);
			}
		});
	}
	updateRooms();
}