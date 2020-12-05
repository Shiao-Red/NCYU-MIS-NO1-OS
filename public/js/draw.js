// JavaScript source code
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const socket=io();
let paintColor;
let colorButton = document.getElementsByClassName('colorButton');

//起始點
let x1 = 0;
let y1 = 0;

// 終點
let x2 = 0;
let y2 = 0;

const hasTouchEvent = 'ontouchstart' in window ? true : false;

const downEvent = hasTouchEvent ? 'ontouchstart' : 'mousedown';
const moveEvent = hasTouchEvent ? 'ontouchmove' : 'mousemove';
const upEvent = hasTouchEvent ? 'touchend' : 'mouseup';

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
    // 取得終點座標
    x2 = e.offsetX;
    y2 = e.offsetY;

    // 開始繪圖
    ctx.strokeStyle = paintColor || "000000";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // 更新起始點座標
    x1 = x2;
    y1 = y2;
	
	
})

canvas.addEventListener(upEvent, function (e) {
    isMouseActive = false;
	sendCanvas();
})

function rgbToHex(rgb) {  //變換顏色的功能
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

for (let button of colorButton) {//換顏色部份
    button.addEventListener('click', () => {
        let tmpString = window.getComputedStyle(button, null).backgroundColor;
        paintColor = rgbToHex(tmpString);
    });
}

socket.on('serverCanvas', (data)=>{
	let image=new Image();
	image.onload=function(){
		ctx.drawImage(image, 0, 0);
	}
	image.src=data;
});
