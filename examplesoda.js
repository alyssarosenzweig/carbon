function Soda(stdlib, foreign, buffer) {
"use asm";
var MathImul = stdlib.Math.imul;
var HEAP32 = new stdlib.Int32Array(buffer);
var HEAPD64 = new stdlib.Float64Array(buffer);
var numSprites = 0;
var px = 0;
var py = 0;
var pw = 0;
var ph = 0;
var ox = 0;
var oy = 0;
var ow = 0;
var oh = 0;
var direction = 0;
function init(){
px=(8|0)
py=(16|0)
pw=(24|0)
ph=(32|0)
ox=(40|0)
oy=(48|0)
ow=(56|0)
oh=(64|0)
HEAP32[(numSprites)>>2]=(2|0)
HEAPD64[(pw)>>3]=+0.1
HEAPD64[(ph)>>3]=+0.1
HEAPD64[(ow)>>3]=++HEAPD64[(pw)>>3]
HEAPD64[(oh)>>3]=++HEAPD64[(ph)>>3]
}
function loop(){
if((direction)==((0|0))){
HEAPD64[(px)>>3]=+((+HEAPD64[(px)>>3])+(+0.01))
HEAPD64[(py)>>3]=+((+HEAPD64[(py)>>3])+(+0.01))
HEAPD64[(ox)>>3]=+((+HEAPD64[(ox)>>3])-(+0.01))
HEAPD64[(oy)>>3]=+((+HEAPD64[(oy)>>3])-(+0.01))
} else 
{
HEAPD64[(ox)>>3]=+((+HEAPD64[(ox)>>3])+(+0.01))
HEAPD64[(oy)>>3]=+((+HEAPD64[(oy)>>3])+(+0.01))
HEAPD64[(px)>>3]=+((+HEAPD64[(px)>>3])-(+0.01))
HEAPD64[(py)>>3]=+((+HEAPD64[(py)>>3])-(+0.01))
} 
if((+HEAPD64[(px)>>3])>(+1.5)){
direction=(1|0)
}
if((+HEAPD64[(ox)>>3])>(+1.5)){
direction=(0|0)
}
}
return {
init: init,
loop: loop,
}
}