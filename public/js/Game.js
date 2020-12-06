// JavaScript source code
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const socket=new io();


var paintColor;
var colorButton = document.getElementsByClassName('colorButton');
var isGuestOrHostInput=document.getElementById('isGuestOrHost');
var attendedRoomInput=document.getElementById('attendedRoom');
var messageInput=document.getElementById('messageInput');
var messageButton=document.getElementById('messageButton');

//°_©lÂI
let x1 = 0;
let y1 = 0;

// ²×ÂI
let x2 = 0;
let y2 = 0;

const hasTouchEvent = 'ontouchstart' in window ? true : false;

const downEvent = hasTouchEvent ? 'ontouchstart' : 'mousedown';
const moveEvent = hasTouchEvent ? 'ontouchmove' : 'mousemove';
const upEvent = hasTouchEvent ? 'touchend' : 'mouseup';

var isMouseActive=false;

function sendCanvas(){
	let canvasContents=canvas.toDataURL();
	//let canvasJSON=JSON.stringify(canvasContents);
	socket.emit('clientCanvas', canvasContents);
}

canvas.addEventListener(downEvent, function (e) {

    isMouseActive = true;
    x1 = e.offsetX;
    y1 = e.offsetY;
    
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
})

canvas.addEventListener(moveEvent, function (e) {
    if (!isMouseActive) {
        return;
    }
    // ¨ú±o²×ÂI®y¼Ð
    x2 = e.offsetX;
    y2 = e.offsetY;

    // ¶}©lÃ¸¹Ï
    ctx.strokeStyle = paintColor || "000000";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // §ó·s°_©lÂI®y¼Ð
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

function rgbToHex(rgb) {  //ÅÜ´«ÃC¦âªº¥\¯à
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

for (let button of colorButton) {//´«ÃC¦â³¡¥÷
    button.addEventListener('click', () => {
        let tmpString = window.getComputedStyle(button, null).backgroundColor;
        paintColor = rgbToHex(tmpString);
    });
}

socket.on('isGuestOrHost', (data)=>{
	console.log(data);
	if(isGuestOrHostInput.value === '' || attendedRoomInput.value === ''){
		isGuestOrHostInput.value=data.isGuestOrHost;
		attendedRoomInput.value=data.attendedRoom;
	}
	
});

socket.on('serverMessage', (data)=>{
	alert(data);
});

socket.on('hostCloseRoom', ()=>{
	alert('æˆ¿ä¸»å·²ç¶“é›¢é–‹äº†');
	window.location=('Select.html');
});

socket.on('serverCanvas', (data)=>{
	let image=new Image();
	image.onload=function(){
		ctx.drawImage(image, 0, 0);
	}
	image.src=data;
});
