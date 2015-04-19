var fs = require('fs');
var nearley = require("nearley");
var grammar = require("./carbon.nec.js");
var parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);

var output = [
  "function Soda(stdlib, foreign, buffer) {",
    '"use asm";',
    "var MathImul = stdlib.Math.imul;",
    "var HEAP32 = new stdlib.Int32Array(buffer);",
    "var HEAPD64 = new stdlib.Float64Array(buffer);"
];

var structptrRegex = /structptr\(([^\)]+)\)/;

var globalContext = {};
var initCode = [];
var localContext = {};

var functionLookup = {};

var structLookup = {};

var initExists = false, loopExists = false;

var globalStatement;

fs.readFile(process.argv[2], function(err, content) {
  var tokens = parser.feed(fs.readFileSync("fountain.c")+content.toString()).results[0];

  var functionList = [];

  // iterate to find metadata AOT
  tokens.map(function(gs) {
    if(gs[0] == "func") {
      var params = {};
      gs[3].forEach(function(p) {
        params[p[1]] = p[0];
      })

      functionLookup[gs[2]] = {
        return: gs[1],
        paramList: gs[3],
        params: params
      }
    } else if(gs[0] == "decl") {
      output.push(declarationCoercion(gs[1], gs[2]));

      globalContext[gs[2]] = {
        type: gs[1],
        name: gs[2],
        source: "decl"
      }

      if(!!gs[3] && gs[3] != 0) {
        initCode.push(["assignment", gs[2], "=", gs[3]]);
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
      /* handled ahead-of-time to resolve asm.js compilation errors */
    } else if(globalStatement[0] == "comment") {
      /* no comment */
    } else if(globalStatement[0] == "struct") {
      var pointers = {};
      var types = {};

      // generate lookup table

      globalStatement[2].forEach(function(member, index) {
        pointers[member[1]] = index * 8; // maximum padding yay
        types[member[1]] = member[0];
      })

      structLookup[globalStatement[1]] = {
        pointers: pointers,
        types: types,
        sizeof: globalStatement[2].length * 8
      }
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
  if(type == "int" || type.indexOf("*") > -1 || type.indexOf("ptr") > -1) {
    return "var "+name+" = 0;";
  } else if(type == "double") {
    return "var "+name+" = 0.0;";
  }

  die("Unknown declaraion type: ", type, name);
}

function parameterCoercion(type, name) {
  // TODO: more types
  if(type == "int" || type.indexOf("*") > -1 || type.indexOf("ptr") > -1) {
    return name+" = "+name+"|0;";
  } else if(type == "double") {
    return name+" = +"+name+";";
  }

  die("Unknown parameter type: ", type, name);
}

function returnedCoercion(call, type) {
  if(type == "int" || type.indexOf("*") > -1 || type.indexOf("ptr") > -1) {
    return call+"|0";
  } else if(type == "double") {
    return "+"+call;
  }

  die("Unknown type returned from function", type, call);
}

function returnCoercion(value, type) {
  // TODO: more types
  if(type == "int" || type.indexOf("*") > -1 || type.indexOf("ptr") > -1) {
    return "return ("+value+")|0;";
  } else if(type == "double") {
    return "return +("+value+")";
  }

  die("Unknown return type: ", type, value);
}

function compileArithm(exp, localContext, globalContext, op) {
  var leftOp = compileExpression(exp[1], localContext, globalContext),
      rightOp = compileExpression(exp[2], localContext, globalContext);

  var cross = crossFixnum(leftOp, rightOp);
  var o = "(("+cross[0]+")"+op+"("+cross[1]+"))";

  return [fixnum(o, cross[2]), cross[2]];
}

function compileExpression(exp, localContext, globalContext, typehint) {
  if(exp[0] == "/") {
    return compileArithm(exp, localContext, globalContext, "/");
  } else if(exp[0] == "*" && Array.isArray(exp)) { // multiplication vs pointer dereferencing
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
    if(typehint) {
      return [fixnum(exp, typehint), typehint];
    }

    return [exp, "fixnum"];
  } else if( localContext[exp] || globalContext[exp]) {
    return [exp, contextType(exp)];
  } else if(exp[0] == "derefexp") {
    return dereference(exp[2]);
  } else if( exp.indexOf("->") > 0) {
    return structAccess(exp);
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
  console.log(left+";"+right);

  if(left[1] == "fixnum" && ["double", "int", "int*"].indexOf(right[1]) > -1 || right[1].indexOf("ptr") > -1) {
    return [fixnum(left[0], right[1]), fixnum(right[0], right[1]), right[1]];
  } else if(right[1] == "fixnum" && ["double", "int", "int*"].indexOf(left[1]) > -1 || left[1].indexOf("ptr") > -1) {
    return [fixnum(left[0], left[1]), fixnum(right[0], left[1]), left[1]];
  } else if(right[1] == left[1] && right[1] == "fixnum") {
    if( ((right[0]|0) != right[0]) || ((left[0]|0) != left[0]) ) {
      return ["+("+left[0]+")", "+("+right[0]+")", "double"];
    } else if( (right[0]|0 == right[0]) && (left[0]|0 == right[0]|0) ) {
      return [left[0]+"|0", right[0]+"|0", "int"];
    } else {
      die("Not sure how to fix num .-.", left, right);
    }
  }

  if(left[1] == "int") {
    left[0] = "("+left[0]+"|0)";
  } else if(left[1] == "double") {
    left[0] = "+("+left[0]+")";
  }

  if(right[1] == "int") {
    right[0] = "("+right[0]+"|0)";
  } else if(right[1] == "double") {
    right[0] = "+("+right[0]+")";
  }

  return [left[0], right[0], left[1]];
}

function fixnum(num, type) {
  //if( (num * 1) == num) {
    if(type == "double") {
      return "+"+num;
    } else if(type == "int" || type.indexOf("*") > -1 || type.indexOf("ptr") > -1) {
      return "("+num+"|0)";
    } else {
      console.trace("Cannot fix "+num+" to "+type);
      return num;
    }
//  }

  return num;
}

function contextType(n) {
  n = n.toString();

  if(n[0] == "*") {
    var depth = n.split("*").length - 1;
    return contextType(n.slice(depth));
  }

  if(n.indexOf("->") > 0) {
    var comps = n.split("->");
    var structType = contextType(comps[0]).slice(10, -1);
    var struct = structLookup[structType];
    return struct.types[comps[1]];
  }

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

      var lvalue = statement[1];

      if(statement[1][0] == "derefexp") {
        var type = contextType(statement[1][2]);
        lvalue = heapForType(type)+"[("+statement[1][2]+")"+addressHeap(type)+"]";
      }

      if(lvalue.indexOf("->") > 0) {
        lvalue = structAccess(lvalue)[0];
      }

      if(statement[2].length == 2 && statement[2][1] == "=") {
        var expa = compileExpression([statement[2][0], statement[1], c[0]],
                    localContext, globalContext);
        output.push(lvalue+"="+expa[0]);
        return;
      }

      output.push(lvalue+statement[2]+fixnum(c[0], dereference(statement[1])[1]));
    } else if(statement[0] == "decl") {
      output.push(declarationCoercion(statement[1], statement[2]));

      localContext[statement[2]] = {
        type: statement[1],
        name: statement[2],
        source: "decl"
      }

      if(!!statement[3] && statement[3] != 0) {
        var c = compileExpression(statement[3], localContext, globalContext);
        output.push(statement[2]+"="+fixnum(c[0], statement[1]));
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

        //condition = compileCondition(stmt[2][0][1], localContext, globalContext);
        //output.push("if"+condition+"{")
        // TODO: else-if chains
        output.push("{");
        compileBlock(stmt[2]);
        output.push("} ");
      } else {
        die("Unknown double nested statement in function body", statement);
      }
    } else if(statement[0] == "comment") {
      /* no comment */
    } else if(statement[0] == "call") {
      output.push(generateFunctionCall(statement)[0]);
    } else if(statement[0] == "for") {
      compileBlock([statement[1]]);
      output.push(";"+compileCondition(statement[2], localContext, globalContext)+";");
      compileBlock([statement[3]]);

      var header = output.slice(-3).join("");
      output.splice(-3);

      output.push("for("+header+"){");
      compileBlock(statement[4]);
      output.push("}");
    } else {
      die("Unknown statement in function body", statement);
    }
  })
}

function generateFunctionCall(call) {
  var func = functionLookup[call[1]];

  if(call[1] == "int2double") {
    return ["+("+compileExpression(call[2], localContext, globalContext)[0]+"|0)", "double"];
  } else if(call[1] == "double2int") {
    return ["(~~(+"+compileExpression(call[2], localContext, globalContext)[0]+")|0)", "int"];
  } else if(call[1] == "get") {
    var t = contextType(call[2][0]);

    return [compileExpression(["+",
        call[2][0],
        ["*", call[2][1], ptrsizeof(t)]
    ], localContext, globalContext)[0], t];
  }

  var params = "";

  call[2].forEach(function(p, index) {
      var param = func.paramList[index];
      params += (compileExpression(p, localContext, globalContext, param[0])[0])+",";
  })

  if(params.length > 1) params = params.slice(0, -1);

  if(func.return != "void") {
    return ["("+returnedCoercion(call[1]+"("+params+")", func.return)+")", func.return];
  }

  return [call[1]+"("+params+");", func.return];

}

function heapForType(type) {
  if(type == "int" || type == "void*") {
    return "HEAP32";
  }

  if(type == "double") {
    return "HEAPD64";
  }

  console.error("Unknown heap for type "+type);
  return "HEAP32";
}

function addressHeap(type) {
  type = stripChar(type, "*")

  if(type == "int" || type == "void") {
    return ">>2";
  }

  if(type == "double") {
    return ">>3";
  }

  console.error("Unknown heap shift for type "+type);
  return "";
}

function stripChar(word, s) {
  return word.toString().replace(s, "");
}

function dereference(exp) {
  // TODO: multi depth

  var i = compileExpression(exp, localContext, globalContext);
  var bareType = i[1];

  if(bareType.slice(-1) == "*") {
    bareType = bareType.slice(0, -1);
  }

  if(bareType.slice(0, 9) == "structptr") {
    // TODO: what actually goes here?
    bareType = "int";
  }

  var d = heapForType(bareType) + "[("+i[0]+")"+addressHeap(bareType)+"]";

  return [d, bareType];
}

function structAccess(exp) {
  var comps = exp.split("->");
  var structType = contextType(comps[0]).slice(10, -1);
  var struct = structLookup[structType];
  var memberType = struct.types[comps[1]];

  var index = "("+comps[0]+"|0)" + "+ ("+struct.pointers[comps[1]]+"|0)";

  var d = heapForType(memberType) + "[("+index+")"+addressHeap(memberType)+"]";
  return [d, memberType];
}

function ptrsizeof(type) {
  if(type == "int*") return 4;
  if(type == "double*") return 8;

  if(structptrRegex.test(type)) {
    var structName = type.match(structptrRegex)[1];

    return structLookup[structName].sizeof;
  }
}

// reports an error message and dies
function die() {
  for(var i = 0; i < arguments.length; ++i) {
    console.error(arguments[i]);
  }

  console.trace("Exiting");

  process.exit(0);
}
