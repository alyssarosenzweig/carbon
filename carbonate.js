var fs = require('fs');
var nearley = require("nearley");
var grammar = require("./carbon.nec.js");
var parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);

fs.readFile(process.argv[2], function(err, content) {
  var tokens = parser.feed(content.toString()).results;

  var output = [
    "function Soda(stdlib, foreign, buffer) {",
      '"use asm;"'
  ];

  tokens.map(function(globalStatement) {
    if(globalStatement[0] == "func") {
      var flatParams = [];

      globalStatement[3].map(function(p) {
        if(p.length == 2) {
          flatParams.push(p[1]);
        }
      });

      // function declaration
      output.push("function "+globalStatement[2]+"("+flatParams.join(",")+")"+"{");

      globalStatement[3].map(function(p) {
        if(p.length == 2) {
          // add a parameter coercion
          output.push(parameterCoercion(p[0], p[1]));
        }
      })

      // end function
      output.push("}");
    }
    console.log(globalStatement);
  });

  output.push("}");

  console.log(output.join("\n"));
})

function parameterCoercion(type, name) {
  // TODO: more types
  if(type == "int") {
    return name+" = "+name+"|0;";
  }

  console.error("Unknown parameter type:");
  console.log(type);
  console.log(name);

  process.exit(0);

  return "";
}
