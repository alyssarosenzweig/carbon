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
var initCode = [];
var localContext = {};

var functionLookup = {};

var initExists = false, loopExists = false;

var globalStatement;

fs.readFile(process.argv[2], function(err, content) {
  var tokens = parser.feed(content.toString()).results[0];

  var functionList = [];

  // iterate to find functions AOT
  tokens.map(function(gs) {
    if(gs[0] == "func") {
      console.log(gs);
      functionLookup[gs[2]] = {
        return: gs[1]
      }
    }
  })

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

      // carbonation can inject code if necessary
      if(globalStatement[2] == "init") {
        globalStatement[4] = initCode.concat(globalStatement[4]);
        initExists = true;
      } else if(globalStatement[2] == "loop") {
        // prevents weird ReferenceError's at runtime
        loopExists = true;
      }

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
        initCode.push(["assignment", globalStatement[2], "=", globalStatement[3]]);
      }
    } else if(globalStatement[0] == "comment") {
      /* no comment */
    } else {
      die("Unknown global statement: "+globalStatement);
    }
  });

  // return function list

  output.push("return {");
  functionList.map(function(f) {
    output.push(f+": "+f+",");
  })
  output.push("}");

  output.push("}");

  if(!(initExists && loopExists)) {
    fs.writeFileSync("badsoda.js", output.join("\n"));

    die("init and/or loop don't exist",
        "Please define these functions to produce working Soda",
        "If this behaviour was desired, partial code is in badsoda.js");
  }

  fs.writeFile("testsoda.js", output.join("\n"));
})

function declarationCoercion(type, name) {
  if(type == "int" || type.indexOf("*") > -1) {
    return "var "+name+" = 0;";
  } else if(type == "double") {
    return "var "+name+" = 0.0;";
  }

  die("Unknown declaraion type: ", type, name);
}

function parameterCoercion(type, name) {
  // TODO: more types
  if(type == "int" || type.indexOf("*") > -1) {
    return name+" = "+name+"|0;";
  } else if(type == "double") {
    return name+" = +"+name+";";
  }

  die("Unknown parameter type: ", type, name);
}

function returnedCoercion(call, type) {
  if(type == "int" || type.indexOf("*") > -1) {
    return call+"|0";
  } else if(type == "double") {
    return "+"+call;
  }

  die("Unknown type returned from function", type, call);
}

function returnCoercion(value, type) {
  // TODO: more types
  if(type == "int" || type.indexOf("*") > -1) {
    return "return ("+value+")|0;";
  } else if(type == "double") {
    return "return +("+value+")";
  }

  die("Unknown return type: ", type, value);
}

function compileArithm(exp, localContext, globalContext, op) {
  console.log(exp);

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
    // TODO: multiplication of doubles
    var leftOp = compileExpression(exp[1], localContext, globalContext),
        rightOp = compileExpression(exp[2], localContext, globalContext);

    if(leftOp[1] == "double" || rightOp[1] == "double") {
      return compileArithm(exp, localContext, globalContext, "*");
    }

    return ["(MathImul("+leftOp[0]+","+rightOp[0]+")|0)", "int"];
  } else if(exp[0] == "-" && Array.isArray(exp)) { // subtraction vs unary negative
    return compileArithm(exp, localContext, globalContext, "-");
  } else if(exp[0] == "+" && Array.isArray(exp)) { // addition vs unary positive
    return compileArithm(exp, localContext, globalContext, "+");
  } else if(exp[0] == "call") {
    return generateFunctionCall(exp);
  } else if( (exp * 1) == exp) {
    return [exp, "fixnum"];
  } else if( localContext[exp] || globalContext[exp]) {
    return [exp, (!!localContext[exp]) ? localContext.type
              :  (!!globalContext[exp]) ? globalContext[exp].type
              :  console.error("Ahhh "+exp)];
  } else {
    die("Unknown expression: ", exp);
  }
}

function compileCondition(condition, localContext, globalContext) {
  var left = compileExpression(condition[0], localContext, globalContext),
     right = compileExpression(condition[2], localContext, globalContext);

  var cross = crossFixnum(left, right);

  return "(("+cross[0]+")"+condition[1]+"("+cross[1]+"))";
}

function crossFixnum(left, right) {
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
      die("Not sure how to fix num .-.", left, right);
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
      console.warn("Cannot fix "+num+" to "+type);
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

  die("Cannot find type of "+n+" in any context");
}

function compileBlock(block) {
  block.forEach(function(statement) {
    if(!statement) return;

    if(statement[0] == "return") {
      var c = compileExpression(statement[1], localContext, globalContext);
      output.push(returnCoercion(c[0], globalStatement[1]));
    } else if(statement[0] == "assignment") {
      var c = compileExpression(statement[3], localContext, globalContext);

      if(statement[2].length == 2 && statement[2][1] == "=") {
        statement[2] = "="+statement[1]+statement[2][0];
      }

      output.push(statement[1]+statement[2]+fixnum(c[0], contextType(statement[1])));
    } else if(statement[0] == "decl") {
      output.push(declarationCoercion(statement[1], statement[2]));

      localContext[statement[2]] = {
        type: statement[1],
        name: statement[2],
        source: "decl"
      }

      if(statement[3] != 0) {
        var c = compileExpression(statement[3], localContext, globalContext);
        output.push(statement[2]+"="+fixnum(c[0], contextType(statement[1])));
      }
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
      } else {
        die("Unknown double nested statement in function body", statement);
      }
    } else if(statement[0] == "comment") {
      /* no comment */
    } else {
      die("Unknown statement in function body", statement);
    }
  })
}

function generateFunctionCall(call) {
  var func = functionLookup[call[1]];
  return ["("+returnedCoercion(call[1]+"()", func.return)+")", func.return];
}

// reports an error message and dies
function die() {
  for(var i = 0; i < arguments.length; ++i) {
    console.error(arguments[i]);
  }

  process.exit(0);
}
