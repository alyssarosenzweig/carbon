/* fountain.js
   Carbon JavaScript standard library
*/

var fountain = function(ctx) {
  ctx.MEMORY_SIZE = 1024 * 1024; // 1MB (enough for small demoes)

  ctx.init = function(recipe) {
    ctx.heap = new ArrayBuffer(ctx.MEMORY_SIZE);
    ctx.int32View = new Int32Array(ctx.heap);
    ctx.float64View = new Float64Array(ctx.heap);

    ctx.drink = recipe(window, null, ctx.heap);
    ctx.drink.init();

    ctx.touching = false;
    ctx.touchX = 0;
    ctx.touchY = 0;
  }

  ctx.initTouchEvents = function(surface) {
    // TODO: multi touch

    surface.addEventListener("touchstart", function(e) {
      e.preventDefault();
      ctx.touching = true;
    });

    surface.addEventListener("touchend", function(e) {
      e.preventDefault();
      ctx.touching = false;
    });

    surface.addEventListener("touchmove", function(e) {
      e.preventDefault();
      ctx.touchX = ctx.page2canvasX(e.changedTouches[0].pageX);
      ctx.touchY = ctx.page2canvasY(e.changedTouches[0].pageY);
    });

    surface.addEventListener("mousedown", function(e) {
      ctx.touching = true;
    });

    surface.addEventListener("mouseup", function(e) {
      ctx.touching = false;
    });

    surface.addEventListener("mousemove", function(e) {
      if(ctx.touching) {
        ctx.touchX = ctx.page2canvasX(e.pageX);
        ctx.touchY = ctx.page2canvasY(e.pageY);
      }
    });

  }

  ctx.page2canvasX = function(x) { return +((x / ctx.width) * 4) - 2 }
  ctx.page2canvasY = function(y) { return -((y / ctx.height) * 4) + 2  }

  ctx.initWebGL = function (width, height, shaders) {
    // init canvas
    ctx.width = width;
    ctx.height = height;

    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    ctx.container.appendChild(canvas);
    ctx.surface = canvas;

    ctx.shaders = shaders;

    // detect WebGL
    var gl = (canvas.getContext("webgl") ||
              canvas.getContext("experimental-webgl"));

    if(!gl) {
      console.error("WebGL is not supported in this browser");
      console.error("Please upgrade your browser.");
      return;
    }

    // save context
    ctx.gl = gl;

    var frag = ctx.loadShader("frag");
    var vert = ctx.loadShader("vert");
    ctx.gl.whiteShader = ctx.gl.createProgram();
    ctx.gl.attachShader(ctx.gl.whiteShader, vert);
    ctx.gl.attachShader(ctx.gl.whiteShader, frag);
    ctx.gl.linkProgram(ctx.gl.whiteShader);

    if(!ctx.gl.getProgramParameter(ctx.gl.whiteShader, ctx.gl.LINK_STATUS)) {
      console.error("Linking failed");
      return null;
    }

    ctx.gl.useProgram(ctx.gl.whiteShader);

    ctx.gl.enable(ctx.gl.DEPTH_TEST);
    ctx.gl.enable(ctx.gl.BLEND);
    ctx.gl.depthFunc(ctx.gl.LEQUAL);

    ctx.squareTexMap = ctx.gl.createBuffer();
    ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, ctx.squareTexMap);

    ctx.gl.textureCoordAttr = ctx.gl.getAttribLocation(ctx.gl.whiteShader, "aTextureCoord")
    ctx.gl.enableVertexAttribArray(ctx.gl.textureCoordAttr);

    ctx.gl.vertexPositionAttribute = ctx.gl.getAttribLocation(ctx.gl.whiteShader, "aVertexPosition");
    ctx.gl.enableVertexAttribArray(ctx.gl.vertexPositionAttribute);

    ctx.gl.spritePositionAttribute = ctx.gl.getAttribLocation(ctx.gl.whiteShader, "aSpritePosition");
    ctx.gl.enableVertexAttribArray(ctx.gl.spritePositionAttribute);

    ctx.gl.angleAttr = ctx.gl.getAttribLocation(ctx.gl.whiteShader, "angle");
    ctx.gl.enableVertexAttribArray(ctx.gl.angleAttr);

    ctx.sheet1 = ctx.makeTexture("spritesheet.png");
  }

  ctx.loadShader = function(shadername) {
    var shaderDef = ctx.shaders[shadername];
    var shader;

    if(shaderDef.type == "fragment") {
      shader = ctx.gl.createShader(ctx.gl.FRAGMENT_SHADER);
    } else if(shaderDef.type == "vertex") {
      shader = ctx.gl.createShader(ctx.gl.VERTEX_SHADER);
    } else {
      console.error("Unknown shader type");
      return null;
    }

    ctx.gl.shaderSource(shader, shaderDef.source.join("\n"));
    ctx.gl.compileShader(shader);

    if(!ctx.gl.getShaderParameter(shader, ctx.gl.COMPILE_STATUS)) {
      console.error("Error compiling shader:");
      console.error(ctx.gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }

  ctx.glLoop = function() {
    ctx.float64View[8192] = !!ctx.touching;
    ctx.float64View[8193] = ctx.touchX;
    ctx.float64View[8194] = ctx.touchY;

    program.drink.loop();

    ctx.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    ctx.gl.clear(ctx.gl.COLOR_BUFFER_BIT | ctx.gl.DEPTH_BUFFER_BIT);

    var buffer = ctx.gl.createBuffer();
    var buffer2 = ctx.gl.createBuffer();

    var spriteCount = ctx.int32View[0];

    var rbuffer = new Float32Array(spriteCount * 18);
    var pbuffer = new Float32Array(spriteCount * 18);

    for(var i = 0; i < spriteCount; ++i) {
      var sindex = 1 + (i * 9); // starting index for sprite
      var xv = ctx.float64View[sindex+0], // x coord
          yv = ctx.float64View[sindex+1], // y coord
          wv = ctx.float64View[sindex+2], // width
          hv = ctx.float64View[sindex+3]; // height

      var inc = i * 18;

      rbuffer[inc+ 0] = 0; rbuffer[inc+ 1] = 0;
      rbuffer[inc+ 3] = -wv; rbuffer[inc+ 4] = 0;
      rbuffer[inc+ 6] = 0; rbuffer[inc+ 7] = -hv;

      rbuffer[inc+ 9] = -wv; rbuffer[inc+10] = 0;
      rbuffer[inc+12] = -wv; rbuffer[inc+13] = -hv;
      rbuffer[inc+15] = 0; rbuffer[inc+16] = -hv;

      pbuffer[inc+ 0] = xv   ; pbuffer[inc+ 1] = yv   ;
      pbuffer[inc+ 3] = xv   ; pbuffer[inc+ 4] = yv   ;
      pbuffer[inc+ 6] = xv   ; pbuffer[inc+ 7] = yv   ;
      pbuffer[inc+ 9] = xv   ; pbuffer[inc+10] = yv   ;
      pbuffer[inc+12] = xv   ; pbuffer[inc+13] = yv   ;
      pbuffer[inc+15] = xv   ; pbuffer[inc+16] = yv   ;
    }

    ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, buffer);
    ctx.gl.bufferData(ctx.gl.ARRAY_BUFFER, rbuffer, ctx.gl.STATIC_DRAW);
    ctx.gl.vertexAttribPointer(ctx.gl.vertexPositionAttribute, 3, ctx.gl.FLOAT, false, 0, 0);

    ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, buffer2);
    ctx.gl.bufferData(ctx.gl.ARRAY_BUFFER, pbuffer, ctx.gl.STATIC_DRAW);
    ctx.gl.vertexAttribPointer(ctx.gl.spritePositionAttribute, 3, ctx.gl.FLOAT, false, 0, 0);

    var vertData = ctx.gl.createBuffer();
    ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, vertData);

    var angleBuffer = new Float32Array(6 * spriteCount);
    for(var i = 0; i < spriteCount; ++i) {
      var sindex = 1 + (i * 9); // starting index for sprite
      var angle = ctx.float64View[sindex+8];
      var ind = 6 * i;

      angleBuffer[ind] = angle;
      angleBuffer[ind+1] = angle;
      angleBuffer[ind+2] = angle;
      angleBuffer[ind+3] = angle;
      angleBuffer[ind+4] = angle;
      angleBuffer[ind+5] = angle;
    }

    ctx.gl.bufferData(ctx.gl.ARRAY_BUFFER, angleBuffer, ctx.gl.STATIC_DRAW);
    ctx.gl.vertexAttribPointer(ctx.gl.angleAttr, 1, ctx.gl.FLOAT, false, 0, 0);

    ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, ctx.squareTexMap);
    var arr = new Float32Array(12 * spriteCount);

    for(var i = 0; i < spriteCount; ++i) {
      var sindex = 1 + (i * 9); // starting index for sprite
      var x1 = ctx.float64View[sindex+4], // tex x1
          y1 = ctx.float64View[sindex+5], // tex y1
          x2 = ctx.float64View[sindex+6], // tex x2
          y2 = ctx.float64View[sindex+7]; // tex y2


      var ind = i * 12;

      arr[ind+0] = x1;
      arr[ind+1] = y1;

      arr[ind+2] = x2;
      arr[ind+3] = y1;

      arr[ind+4] = x1;
      arr[ind+5] = y2;


      arr[ind+6] = x2;
      arr[ind+7] = y1;

      arr[ind+8] = x2;
      arr[ind+9] = y2;

      arr[ind+10] = x1;
      arr[ind+11] = y2;
    }

    ctx.gl.bufferData(ctx.gl.ARRAY_BUFFER, arr, ctx.gl.STATIC_DRAW);

    ctx.gl.vertexAttribPointer(ctx.gl.textureCoordAttr, 2, ctx.gl.FLOAT, false, 0, 0);

    ctx.gl.activeTexture(ctx.gl.TEXTURE0);
    ctx.gl.bindTexture(ctx.gl.TEXTURE_2D, ctx.sheet1);
    ctx.gl.uniform1i(ctx.gl.getUniformLocation(ctx.gl.whiteShader, "uSampler"), 0);

    ctx.gl.drawArrays(ctx.gl.TRIANGLES, 0, 6 * spriteCount);

    requestAnimationFrame(ctx.glLoop);
  }

  ctx.makeTexture = function(src) {
    var texture = ctx.gl.createTexture();
    var image = new Image();

    image.onload = function() {
      console.log("Image loaded");
      ctx.gl.bindTexture(ctx.gl.TEXTURE_2D, texture);
      ctx.gl.texImage2D(ctx.gl.TEXTURE_2D, 0, ctx.gl.RGBA, ctx.gl.RGBA, ctx.gl.UNSIGNED_BYTE, image);
      ctx.gl.texParameteri(ctx.gl.TEXTURE_2D, ctx.gl.TEXTURE_MAG_FILTER, ctx.gl.LINEAR);
      ctx.gl.texParameteri(ctx.gl.TEXTURE_2D, ctx.gl.TEXTURE_MIN_FILTER, ctx.gl.LINEAR_MIPMAP_NEAREST);
      ctx.gl.generateMipmap(ctx.gl.TEXTURE_2D);
      ctx.gl.bindTexture(ctx.gl.TEXTURE_2D, null);
    }

    image.src = src;

    return texture;
  }

  return ctx;
}
