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
  }

  ctx.initWebGL = function (width, height, shaders) {
    // init canvas
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    ctx.container.appendChild(canvas);

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
    ctx.gl.depthFunc(ctx.gl.LEQUAL);

    ctx.squareTexMap = ctx.gl.createBuffer();
    ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, ctx.squareTexMap);

    ctx.gl.textureCoordAttr = ctx.gl.getAttribLocation(ctx.gl.whiteShader, "aTextureCoord")
    ctx.gl.enableVertexAttribArray(ctx.gl.textureCoordAttr);

    ctx.gl.vertexPositionAttribute = ctx.gl.getAttribLocation(ctx.gl.whiteShader, "aVertexPosition");
    ctx.gl.enableVertexAttribArray(ctx.gl.vertexPositionAttribute);

    ctx.heartImage = ctx.makeTexture("heart.png");
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
    var value = program.drink.loop();

    ctx.gl.clearColor(value, value, value, 1.0);
    ctx.gl.clear(ctx.gl.COLOR_BUFFER_BIT | ctx.gl.DEPTH_BUFFER_BIT);

    var pUniform = ctx.gl.getUniformLocation(ctx.gl.whiteShader, "uPMatrix");
    ctx.gl.uniformMatrix4fv(pUniform, false, new Float32Array([1.8106601717798214, 0, 0, 0, 0, 2.4142135623730954, 0, 0, 0, 0, -1.002002002002002, -1, 0, 0, -0.20020020020020018, 0]));

    var mvUniform = ctx.gl.getUniformLocation(ctx.gl.whiteShader, "uMVMatrix");
    ctx.gl.uniformMatrix4fv(mvUniform, false, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -6, 1]);

    var buffer = ctx.gl.createBuffer();
    ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, buffer);

    var spriteCount = ctx.int32View[0];

    var rbuffer = new Float32Array(spriteCount * 18);
    ctx.t = rbuffer;

    for(var i = 0; i < spriteCount; ++i) {
      var sindex = 1 + (i * 4); // starting index for sprite
      var xv = ctx.float64View[sindex+0], // x coord
          yv = ctx.float64View[sindex+1], // y coord
          wv = ctx.float64View[sindex+2], // width
          hv = ctx.float64View[sindex+3]; // height

      var inc = i * 18;

      rbuffer[inc+ 0] = xv   ; rbuffer[inc+ 1] = yv   ;
      rbuffer[inc+ 3] = xv-wv; rbuffer[inc+ 4] = yv   ;
      rbuffer[inc+ 6] = xv   ; rbuffer[inc+ 7] = yv-hv;

      rbuffer[inc+ 9] = xv-wv; rbuffer[inc+10] = yv   ;
      rbuffer[inc+12] = xv-wv; rbuffer[inc+13] = yv-hv;
      rbuffer[inc+15] = xv   ; rbuffer[inc+16] = yv-hv;
    }

    ctx.gl.bufferData(ctx.gl.ARRAY_BUFFER, rbuffer, ctx.gl.STATIC_DRAW);
    ctx.gl.vertexAttribPointer(ctx.gl.vertexPositionAttribute, 3, ctx.gl.FLOAT, false, 0, 0);

    ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, ctx.squareTexMap);
    var arr = new Float32Array(12);

    for(var i = 0; i < spriteCount; ++i) {
      var ind = i * 12;
      arr[ind+2] = 1;
      arr[ind+5] = 1;
      arr[ind+6] = 1;
      arr[ind+8] = 1;
      arr[ind+9] = 1;
      arr[ind+11] = 1;
    }

    ctx.gl.bufferData(ctx.gl.ARRAY_BUFFER, arr, ctx.gl.STATIC_DRAW);

    ctx.gl.vertexAttribPointer(ctx.gl.textureCoordAttr, 2, ctx.gl.FLOAT, false, 0, 0);

    ctx.gl.activeTexture(ctx.gl.TEXTURE0);
    ctx.gl.bindTexture(ctx.gl.TEXTURE_2D, ctx.heartImage);
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
