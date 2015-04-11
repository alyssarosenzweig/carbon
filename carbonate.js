var fs = require('fs');
var nearley = require("nearley");
var grammar = require("./carbon.nec.js");
var parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);

fs.readFile(process.argv[2], function(err, content) {
  var tokens = parser.feed(content.toString()).results[0];

  var output = [
    "function Soda(stdlib, foreign, buffer) {",
      '"use asm";',
      "var MathImul = stdlib.Math.imul;",
  ];

  var functionList = [];

  var globalContext = {};

  tokens.map(function(globalStatement) {
    if(globalStatement[0] == "func") {
      functionList.push(globalStatement[2]);

      var flatParams = [];

      globalStatement[3].map(function(p) {
        if(p.length == 2) {
          flatParams.push(p[1]);
        }
      });

      // function declaration
      output.push("function "+globalStatement[2]+"("+flatParams.join(",")+")"+"{");

      localContext = {};

      // parameter coercion
      globalStatement[3].map(function(p) {
        if(p.length == 2) {
          // add a parameter coercion
          output.push(parameterCoercion(p[0], p[1]));

          // remember in context
          localContext[p[1]] = {
            type: p[0],
            name: p[1],
            source: "param"
          }
        }
      })

      // function body compilation
      globalStatement[4].map(function(statement) {
        if(statement[0] == "return") {
          var c = compileExpression(statement[1], localContext, globalContext);
          output.push(returnCoercion(c, globalStatement[1]));
        } else {
          console.log("Unknown statement in function body");
          console.log(statement);
          //process.exit(0);
        }
      })

      // end function
      output.push("}");
    } else if(globalStatement[0] == "decl") {
      output.push(declarationCoercion(globalStatement[1], globalStatement[2]));

      if(globalStatement[3] != 0) {
        console.error("Carbonation cannot initialize variable yet.");
        console.error("Problematic variable:");
        console.error(globalStatement);
        process.exit(0);
      }
    } else {
      console.log("Unknown global statement");
      console.log(globalStatement);
      process.exit(0);
    }
  });

  // return function list

  output.push("return {");
  functionList.map(function(f) {
    output.push(f+": "+f+",");
  })
  output.push("}");

  output.push("}");

  fs.writeFile("testsoda.js", output.join("\n"));
})

function declarationCoercion(type, name) {
  if(type == "int") {
    return "var "+name+" = 0;";
  } else if(type == "double") {
    return "var "+name+" = 0.0;";
  }

  console.error("Unknown declaration type:");
  console.error(type+" "+name);
  process.exit(0);
}

function parameterCoercion(type, name) {
  // TODO: more types
  if(type == "int") {
    return name+" = "+name+"|0;";
  } else if(type == "double") {
    return name+" = +"+name+";";
  }

  console.error("Unknown parameter type:");
  console.log(type);
  console.log(name);

  process.exit(0);
}

function returnCoercion(value, type) {
  // TODO: more types
  if(type == "int") {
    return "return ("+value+")|0;";
  } else if(type == "double") {
    return "return +("+value+")";
  }

  console.error("Unknown return type:");
  console.log(type);
  console.log(name);

  process.exit(0);
}

function compileExpression(exp, localContext, globalContext) {
  if(exp[0] == "/") {
    var leftOp = compileExpression(exp[1], localContext, globalContext),
        rightOp = compileExpression(exp[2], localContext, globalContext);

    return "("+leftOp+"/"+rightOp+")";
  } else if(exp[0] == "*") {
    var leftOp = compileExpression(exp[1], localContext, globalContext),
        rightOp = compileExpression(exp[2], localContext, globalContext);

    return "(MathImul("+leftOp+","+rightOp+")|0)";
  } else if(exp[0] == "-") {
    var leftOp = compileExpression(exp[1], localContext, globalContext),
        rightOp = compileExpression(exp[2], localContext, globalContext);

    return "("+leftOp+"-"+rightOp+")";
  } else if(exp[0] == "+") {
    var leftOp = compileExpression(exp[1], localContext, globalContext),
        rightOp = compileExpression(exp[2], localContext, globalContext);

    return "("+leftOp+"+"+rightOp+")";
  } else if( (exp * 1) == exp) {
    return exp;
  } else if( localContext[exp] || globalContext[exp]) {
    return exp;
  }

  console.log(exp);
  return "";
}
