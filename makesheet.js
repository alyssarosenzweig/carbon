/* makesheet.js
   sprite sheet generator
   put all sprites as PNG files under the folder sprites

   node makesheet.js 64 out.png heart smile...

   64: size of the image (64x64)
   out.png: spritesheet output
   heart, smile.. names of .png files in sprites/ to include
*/

var fs = require('fs'),
    PNG = require('node-png').PNG;

var args = process.argv[2].split(" ");
var length = args[0] * 1,
    outs = args[1];

var components = args.slice(2);
var loadedImages = [];

components.forEach(function(image) {
  fs.createReadStream('sprites/'+image+'.png')
      .pipe(new PNG({
          filterType: 4
      }))
      .on('parsed', function() {
        loadedImages.push(this);

        if(loadedImages.length == components.length) {
          generateSheet();
        }
      });
})

function generateSheet() {
  var dimension = Math.pow(2, Math.ceil(
      Math.log(length *
        Math.ceil(Math.sqrt(components.length)))
      / Math.log(2)
  ));

  var row = dimension / length;

  var out = new PNG({
    filterType: -1,
    width: dimension,
    height: dimension
  });

  out.data.fill(0);

  loadedImages.forEach(function(img, index) {
    img.bitblt(out,
        0, 0, length, length,
        length * (index % row), 64 * Math.floor(index / row));
  });

  out.pack().pipe(fs.createWriteStream(outs));
}
