var fs = require('fs');
var nearley = require("nearley");
var grammar = require("./carbon.nec.js");
var parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);

var output = [
  "function Soda(stdlib, foreign, buffer) {",
    '"use asm";',
    "var MathImul = stdlib.Math.imul;",
];

var globalContext = {};

var localContext = {};

var globalStatement;

fs.readFile(process.argv[2], function(err, content) {
  var tokens = parser.feed(content.toString()).results[0];

  var functionList = [];

  tokens.map(function(gs) {
    globalStatement = gs;

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
      compileBlock(globalStatement[4]);

      localContext = {};

      // end function
      output.push("}");
    } else if(globalStatement[0] == "decl") {
      output.push(declarationCoercion(globalStatement[1], globalStatement[2]));

      globalContext[globalStatement[2]] = {
        type: globalStatement[1],
        name: globalStatement[2],
        source: "decl"
      }

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

function compileArithm(exp, localContext, globalContext, op) {
  var leftOp = compileExpression(exp[1], localContext, globalContext),
      rightOp = compileExpression(exp[2], localContext, globalContext);

  var cross = crossFixnum(leftOp, rightOp);
  var o = "("+cross[0]+op+cross[1]+")";

  return [o, cross[2]];
}

function compileExpression(exp, localContext, globalContext) {
  if(exp[0] == "/") {
    return compileArithm(exp, localContext, globalContext, "/");
  } else if(exp[0] == "*") {
    var leftOp = compileExpression(exp[1], localContext, globalContext),
        rightOp = compileExpression(exp[2], localContext, globalContext);

    return "(MathImul("+leftOp+","+rightOp+")|0)";
  } else if(exp[0] == "-") {
    return compileArithm(exp, localContext, globalContext, "-");
  } else if(exp[0] == "+") {
    return compileArithm(exp, localContext, globalContext, "+");
  } else if( (exp * 1) == exp) {
    return [exp, "fixnum"];
  } else if( localContext[exp] || globalContext[exp]) {
    return [exp, (localContext[exp] && localContext.type) || globalContext[exp].type];
  }

  console.log(exp);
  return "";
}

function compileCondition(condition, localContext, globalContext) {
  var left = compileExpression(condition[0], localContext, globalContext),
     right = compileExpression(condition[2], localContext, globalContext);

  var cross = crossFixnum(left, right);

  return "(("+cross[0]+")"+condition[1]+"("+cross[1]+"))";
}

function crossFixnum(left, right) {
  console.log(left+" cross "+right);

  if(left[1] == "fixnum" && ["double", "int"].indexOf(right[1]) > -1) {
    return [fixnum(left[0], right[1]), right[0], right[1]];
  } else if(right[1] == "fixnum" && ["double", "int"].indexOf(left[1]) > -1) {
    return [left[0], fixnum(right[0], left[1]), right[1]];
  } else if(right[1] == left[1] && right[1] == "fixnum") {
    if( ((right[0]|0) != right[0]) || ((left[0]|0) != left[0]) ) {
      return ["+"+left[0], "+"+right[0], "double"];
    } else if( (right[0]|0 == right[0]) && (left[0]|0 == right[0]|0) ) {
      return [left[0]+"|0", right[0]+"|0", "int"];
    } else {
      console.error("Not sure how to fix num .-.");
      process.exit(0);
    }
  }

  return [left[0], right[0]];
}

function fixnum(num, type) {
  if( (num * 1) == num) {
    if(type == "double") {
      return "+"+num;
    } else if(type == "int") {
      return "("+num+"|0)";
    } else {
      console.error("Cannot fix "+num+" to "+type);
      return num;
    }
  }

  return num;
}

function contextType(n) {
  if(globalContext[n])
    return globalContext[n].type;
  if(localContext[n])
    return localContext[n].type;

  console.error("Cannot find type of "+n+" in any context");
  process.exit(0);
}

function compileBlock(block) {
  block.forEach(function(statement) {
    if(statement[0] == "return") {
      var c = compileExpression(statement[1], localContext, globalContext);
      output.push(returnCoercion(c[0], globalStatement[1]));
    } else if(statement[0] == "assignment") {
      var c = compileExpression(statement[3], localContext, globalContext);
      output.push(statement[1]+statement[2]+fixnum(c[0], contextType(statement[1])));
    } else if(Array.isArray(statement[0])) {
      var stmt = statement[0];

      if(stmt[0] == "if") {
        var condition = compileCondition(stmt[1], localContext, globalContext);

        output.push("if"+condition+"{")

        compileBlock(stmt[2]);

        output.push("}");
      } else if(stmt[0] == "ifElse") {
        var condition = compileCondition(stmt[1][1], localContext, globalContext);

        output.push("if"+condition+"{")
        compileBlock(stmt[1][2]);
        output.push("} else ");

        condition = compileCondition(stmt[2][0][1], localContext, globalContext);
        output.push("if"+condition+"{")
        compileBlock(stmt[2][0][2]);
        output.push("} ");


        console.log(stmt);

      } else {
        console.log("Unknown double nested statement in function body");
        console.log(statement);
        process.exit(0);
      }
    } else {
      console.log("Unknown statement in function body");
      console.log(statement);
      //process.exit(0);
    }
  })
}
