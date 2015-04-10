/* ctx is an object in the form of:
{
  container: document.body
}.

function carbon returns a modified ctx
*/

var carbon = function(ctx) {
  /* initialize rending context */

  ctx.initWebGL = function (width, height) {
    // init canvas
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    ctx.container.appendChild(canvas);

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
    ctx.gl.clearColor(1.0, 1.0, 0.0, 1.0);
    ctx.gl.enable(gl.DEPTH_TEST);
    ctx.gl.depthFunc(gl.LEQUAL);
    ctx.gl.clear(ctx.gl.COLOR_BUFFER_BIT | ctx.gl.DEPTH_BUFFER_BIT);
  }

  return ctx;
};
