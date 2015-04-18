function Soda(stdlib, foreign, buffer) {
"use asm";
var MathImul = stdlib.Math.imul;
var HEAP32 = new stdlib.Int32Array(buffer);
var HEAPD64 = new stdlib.Float64Array(buffer);
var numSprites = 0;
var isTouching = 0;
var touchX = 0;
var touchY = 0;
var px = 0;
var py = 0;
var pw = 0;
var ph = 0;
var ptx1 = 0;
var pty1 = 0;
var ptx2 = 0;
var pty2 = 0;
var ox = 0;
var oy = 0;
var ow = 0;
var oh = 0;
var otx1 = 0;
var oty1 = 0;
var otx2 = 0;
var oty2 = 0;
var direction = 0;
function init(){
isTouching=(65536|0)
touchX=(65544|0)
touchY=(65552|0)
px=(8|0)
py=(16|0)
pw=(24|0)
ph=(32|0)
ptx1=(40|0)
pty1=(48|0)
ptx2=(56|0)
pty2=(64|0)
ox=(72|0)
oy=(80|0)
ow=(88|0)
oh=(96|0)
otx1=(104|0)
oty1=(112|0)
otx2=(120|0)
oty2=(128|0)
HEAP32[(numSprites)>>2]=(2|0)
HEAPD64[(pw)>>3]=+0.4
HEAPD64[(ph)>>3]=+0.4
HEAPD64[(ow)>>3]=+HEAPD64[(pw)>>3]
HEAPD64[(oh)>>3]=+HEAPD64[(ph)>>3]
HEAPD64[(ptx1)>>3]=+0
HEAPD64[(pty1)>>3]=+0
HEAPD64[(ptx2)>>3]=+0.5
HEAPD64[(pty2)>>3]=+0.5
HEAPD64[(otx1)>>3]=+0.5
HEAPD64[(oty1)>>3]=+0
HEAPD64[(otx2)>>3]=+1
HEAPD64[(oty2)>>3]=+0.5
}
function loop(){
if((+HEAPD64[(isTouching)>>3])==(+1)){
HEAPD64[(pw)>>3]=+1
HEAPD64[(ph)>>3]=+1
} else 
{
HEAPD64[(pw)>>3]=+0.4
HEAPD64[(ph)>>3]=+0.4
} 
HEAPD64[(px)>>3]=+HEAPD64[(touchX)>>3]
HEAPD64[(py)>>3]=+HEAPD64[(touchY)>>3]
if(((direction|0))==((0|0))){
HEAPD64[(ox)>>3]=+((+HEAPD64[(ox)>>3])-(+0.01))
HEAPD64[(oy)>>3]=+((+HEAPD64[(oy)>>3])-(+0.01))
} else 
{
HEAPD64[(ox)>>3]=+((+HEAPD64[(ox)>>3])+(+0.01))
HEAPD64[(oy)>>3]=+((+HEAPD64[(oy)>>3])+(+0.01))
} 
if((+HEAPD64[(ox)>>3])>(+1.5)){
direction=(0|0)
}
if((+HEAPD64[(ox)>>3])<(+-1.5)){
direction=(1|0)
}
}
return {
init: init,
loop: loop,
}
}