// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }
 function only(d) { return d[0] } 
 function doubleonly(d) { return d[0][0] } 
 function flat(d) { return d[1].concat(d[0]) } 
 function nullify(d) { return null } var grammar = {
    ParserRules: [
    {"name": "main", "symbols": ["_", "program"], "postprocess":  function(d) { return d[1] } },
    {"name": "globalLine", "symbols": ["function"], "postprocess":  id },
    {"name": "globalLine", "symbols": ["declaration", {"literal":";"}], "postprocess":  id },
    {"name": "globalLine", "symbols": ["BlockComment"], "postprocess":  id },
    {"name": "globalLine", "symbols": ["LineComment"], "postprocess":  id },
    {"name": "globalLine", "symbols": ["struct"], "postprocess":  id },
    {"name": "program", "symbols": ["globalLine", "_"], "postprocess":  function(d) { return [d[0]] } },
    {"name": "program", "symbols": ["program", "globalLine", "_"], "postprocess":  function(d) { return d[0].concat([d[1]]) }},
    {"name": " string$1", "symbols": [{"literal":"i"}, {"literal":"n"}, {"literal":"t"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "baretype", "symbols": [" string$1"]},
    {"name": " string$2", "symbols": [{"literal":"d"}, {"literal":"o"}, {"literal":"u"}, {"literal":"b"}, {"literal":"l"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "baretype", "symbols": [" string$2"]},
    {"name": " string$3", "symbols": [{"literal":"v"}, {"literal":"o"}, {"literal":"i"}, {"literal":"d"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "baretype", "symbols": [" string$3"]},
    {"name": "pointer", "symbols": [], "postprocess":  function() { return "" } },
    {"name": "pointer", "symbols": [{"literal":"*"}, "pointer"], "postprocess":  function(d) { return d[0]+d[1] } },
    {"name": "type", "symbols": ["baretype", "pointer"], "postprocess":  function(d) { return d[0][0] + d[1] } },
    {"name": " string$4", "symbols": [{"literal":"s"}, {"literal":"t"}, {"literal":"r"}, {"literal":"u"}, {"literal":"c"}, {"literal":"t"}, {"literal":"p"}, {"literal":"t"}, {"literal":"r"}, {"literal":"("}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "type", "symbols": [" string$4", "word", {"literal":")"}], "postprocess":  function(d) { return d.join("") } },
    {"name": "integer", "symbols": [/[0-9\-]/], "postprocess":  id },
    {"name": "integer", "symbols": ["integer", /[0-9]/], "postprocess":  function(d) { return "" + d[0] + d[1] } },
    {"name": "floating", "symbols": ["integer", {"literal":"."}, "integer"], "postprocess":  function(d) { return +(d[0]+d[1]+d[2]) } },
    {"name": "number", "symbols": ["floating"], "postprocess":  id },
    {"name": "number", "symbols": ["integer"], "postprocess":  id },
    {"name": "word", "symbols": [/[A-Za-z]/], "postprocess":  id },
    {"name": "word", "symbols": ["word", /[A-Za-z0-9]/], "postprocess":  function(d) { return "" + d[0] + d[1] } },
    {"name": "FunctionCall", "symbols": ["word", {"literal":"("}, "_", "paramvals", "_", {"literal":")"}], "postprocess":  function(d) { return ["call", d[0], d[3]] } },
    {"name": "P", "symbols": [{"literal":"("}, "_", "AS", "_", {"literal":")"}], "postprocess":  function(d) { return d[2] } },
    {"name": "P", "symbols": ["N"], "postprocess":  id },
    {"name": "P", "symbols": ["FunctionCall"], "postprocess":  id },
    {"name": "MD", "symbols": ["MD", "_", {"literal":"*"}, "_", "P"], "postprocess":  function(d) { return ["*", d[0], d[4]] } },
    {"name": "MD", "symbols": ["MD", "_", {"literal":"/"}, "_", "P"], "postprocess":  function(d) { return ["/", d[0], d[4]] } },
    {"name": "MD", "symbols": ["P"], "postprocess":  id },
    {"name": "AS", "symbols": ["AS", "_", {"literal":"+"}, "_", "MD"], "postprocess":  function(d) { return ["+", d[0], d[4]]} },
    {"name": "AS", "symbols": ["AS", "_", {"literal":"-"}, "_", "MD"], "postprocess":  function(d) { return ["-", d[0], d[4]]} },
    {"name": "AS", "symbols": ["MD"], "postprocess":  id },
    {"name": "N", "symbols": ["number"], "postprocess":  id },
    {"name": "N", "symbols": ["variable"], "postprocess":  id },
    {"name": "variable", "symbols": ["word"], "postprocess":  id },
    {"name": "variable", "symbols": [{"literal":"*"}, "AS"], "postprocess":  function(d) { return ["derefexp", d[0], d[1]] } },
    {"name": " string$5", "symbols": [{"literal":"-"}, {"literal":">"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "variable", "symbols": ["word", " string$5", "word"], "postprocess":  function(d) { return d.join("") } },
    {"name": "value", "symbols": ["AS"], "postprocess":  id },
    {"name": "declUndef", "symbols": ["type", {"literal":" "}, "word"], "postprocess":  function(d) { return ["decl", d[0], d[2], null] } },
    {"name": "declInit", "symbols": ["declUndef", "_", {"literal":"="}, "_", "value"], "postprocess":  function(d) { return [d[0][0], d[0][1], d[0][2], d[4]] } },
    {"name": "declaration", "symbols": ["declInit"], "postprocess":  id },
    {"name": "declaration", "symbols": ["declUndef"], "postprocess":  id },
    {"name": " string$6", "symbols": [{"literal":"s"}, {"literal":"t"}, {"literal":"r"}, {"literal":"u"}, {"literal":"c"}, {"literal":"t"}, {"literal":" "}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " string$7", "symbols": [{"literal":"}"}, {"literal":";"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "struct", "symbols": [" string$6", "_", "word", "_", {"literal":"{"}, "structBits", "_", " string$7"], "postprocess":  function(d) { return ["struct", d[2], d[5]]} },
    {"name": "structBit", "symbols": ["_", "declUndef", {"literal":";"}], "postprocess":  function(d) { return [d[1][1], d[1][2]] } },
    {"name": "structBits", "symbols": ["structBit"]},
    {"name": "structBits", "symbols": ["structBits", "structBit"], "postprocess":  function(d) { return d[0].concat([d[1]]) } },
    {"name": "assignment", "symbols": ["variable", "_", "assignmentOperator", "_", "value"], "postprocess":  function(d) { return ["assignment", d[0], d[2], d[4]] } },
    {"name": "assignmentOperator", "symbols": [{"literal":"="}], "postprocess":  id },
    {"name": " string$8", "symbols": [{"literal":"+"}, {"literal":"="}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "assignmentOperator", "symbols": [" string$8"], "postprocess":  id },
    {"name": " string$9", "symbols": [{"literal":"-"}, {"literal":"="}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "assignmentOperator", "symbols": [" string$9"], "postprocess":  id },
    {"name": " string$10", "symbols": [{"literal":"*"}, {"literal":"="}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "assignmentOperator", "symbols": [" string$10"], "postprocess":  id },
    {"name": " string$11", "symbols": [{"literal":"/"}, {"literal":"="}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "assignmentOperator", "symbols": [" string$11"], "postprocess":  id },
    {"name": "IfStatement", "symbols": ["bareifStatement"]},
    {"name": "IfStatement", "symbols": ["elseIfStatement"]},
    {"name": "ElseBlock", "symbols": ["IfStatement"], "postprocess":  id },
    {"name": "ElseBlock", "symbols": [{"literal":"{"}, "block", "_", {"literal":"}"}], "postprocess":  function(d) { return d[1] } },
    {"name": " string$12", "symbols": [{"literal":"i"}, {"literal":"f"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "bareifStatement", "symbols": [" string$12", "_", {"literal":"("}, "_", "condition", "_", {"literal":")"}, "_", {"literal":"{"}, "block", "_", {"literal":"}"}], "postprocess":  function(d) { return ["if", d[4], d[9]] } },
    {"name": " string$13", "symbols": [{"literal":"e"}, {"literal":"l"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "elseIfStatement", "symbols": ["bareifStatement", "_", " string$13", "_", "ElseBlock"], "postprocess":  function(d) { return ["ifElse", d[0], d[4]] } },
    {"name": "condition", "symbols": ["value", "_", "conditional", "_", "value"], "postprocess":  function(d) { return [d[0], d[2], d[4]]} },
    {"name": " string$14", "symbols": [{"literal":"="}, {"literal":"="}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "conditionals", "symbols": [" string$14"]},
    {"name": " string$15", "symbols": [{"literal":">"}, {"literal":"="}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "conditionals", "symbols": [" string$15"]},
    {"name": " string$16", "symbols": [{"literal":"<"}, {"literal":"="}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "conditionals", "symbols": [" string$16"]},
    {"name": " string$17", "symbols": [{"literal":"!"}, {"literal":"="}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "conditionals", "symbols": [" string$17"]},
    {"name": "conditionals", "symbols": [{"literal":">"}]},
    {"name": "conditionals", "symbols": [{"literal":"<"}]},
    {"name": "conditional", "symbols": ["conditionals"], "postprocess":  function(d) { return d[0][0] } },
    {"name": " string$18", "symbols": [{"literal":"r"}, {"literal":"e"}, {"literal":"t"}, {"literal":"u"}, {"literal":"r"}, {"literal":"n"}, {"literal":" "}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "return", "symbols": ["_", " string$18", "value"], "postprocess":  function(d) { return ["return", d[2]] } },
    {"name": " string$19", "symbols": [{"literal":"/"}, {"literal":"*"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " string$20", "symbols": [{"literal":"*"}, {"literal":"/"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "BlockComment", "symbols": ["_", " string$19", "commentbody", " string$20"], "postprocess":  function(d) { return ["comment"] } },
    {"name": " string$21", "symbols": [{"literal":"/"}, {"literal":"/"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "LineComment", "symbols": ["_", " string$21", "LineEnd"], "postprocess":  function(d) { return ["comment"]} },
    {"name": " string$22", "symbols": [{"literal":"w"}, {"literal":"h"}, {"literal":"i"}, {"literal":"l"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "WhileLoop", "symbols": [" string$22", "_", {"literal":"("}, "_", "condition", "_", {"literal":")"}, "_", {"literal":"{"}, "block", "_", {"literal":"}"}], "postprocess":  function(d) { return ["while", d[4], d[9]] } },
    {"name": " string$23", "symbols": [{"literal":"f"}, {"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "ForLoop", "symbols": [" string$23", "_", {"literal":"("}, "_", "assignment", {"literal":";"}, "_", "condition", {"literal":";"}, "_", "assignment", "_", {"literal":")"}, "_", {"literal":"{"}, "block", "_", {"literal":"}"}], "postprocess":  function(d) { return ["for", d[4], d[7], d[10], d[15]] } },
    {"name": "function", "symbols": ["type", {"literal":" "}, "word", "_", {"literal":"("}, "_", "params", "_", {"literal":")"}, "_", {"literal":"{"}, "block", "_", {"literal":"}"}], "postprocess":  function(d) { return ["func", d[0], d[2], d[6], d[11]] }},
    {"name": "function", "symbols": ["type", {"literal":" "}, "word", "_", {"literal":"("}, "_", "params", "_", {"literal":")"}, "_", {"literal":"{"}, "_", {"literal":"}"}], "postprocess":  function(d) { return ["func", d[0], d[2], d[6], []] } },
    {"name": "param", "symbols": ["type", {"literal":" "}, "word"], "postprocess":  function(d) { return [d[0], d[2]] } },
    {"name": "paramval", "symbols": ["value"], "postprocess":  id },
    {"name": "params", "symbols": []},
    {"name": "params", "symbols": ["param"]},
    {"name": "params", "symbols": ["params", "_", {"literal":","}, "_", "param"], "postprocess":  function(d){ return d[0].concat([d[4]])} },
    {"name": "paramvals", "symbols": []},
    {"name": "paramvals", "symbols": ["paramval"]},
    {"name": "paramvals", "symbols": ["paramvals", "_", {"literal":","}, "_", "paramval"], "postprocess":  function(d) { return d[0].concat([d[4]])} },
    {"name": "block", "symbols": ["statement"]},
    {"name": "block", "symbols": ["block", "statement"], "postprocess":  function(d) { return d[0].concat([d[1]])} },
    {"name": "statement", "symbols": ["_", "declaration", {"literal":";"}], "postprocess":  function(d) { return d[1] } },
    {"name": "statement", "symbols": ["return", {"literal":";"}], "postprocess":  id },
    {"name": "statement", "symbols": ["_", "assignment", {"literal":";"}], "postprocess":  function(d) { return d[1] } },
    {"name": "statement", "symbols": ["_", "IfStatement"], "postprocess":  function(d) { return d[1] } },
    {"name": "statement", "symbols": ["_", "WhileLoop"], "postprocess":  function(d) { return d[1] } },
    {"name": "statement", "symbols": ["_", "ForLoop"], "postprocess":  function(d) { return d[1] } },
    {"name": "statement", "symbols": ["_", "FunctionCall", {"literal":";"}], "postprocess":  function(d) { return d[1] } },
    {"name": "statement", "symbols": ["BlockComment"], "postprocess":  id },
    {"name": "statement", "symbols": ["LineComment"], "postprocess":  id },
    {"name": "_", "symbols": [], "postprocess":  nullify },
    {"name": "_", "symbols": [/[\s]/, "_"], "postprocess":  nullify },
    {"name": "_", "symbols": ["LineComment", "_"], "postprocess":  nullify },
    {"name": "_", "symbols": ["BlockComment", "_"], "postprocess":  nullify },
    {"name": "commentbody", "symbols": [], "postprocess":  nullify },
    {"name": "commentbody", "symbols": [/[^\*]/, "commentbody"], "postprocess":  nullify },
    {"name": "commentbody", "symbols": [{"literal":"*"}, /[^\/]/, "commentbody"], "postprocess":  nullify },
    {"name": "LineEnd", "symbols": [], "postprocess":  nullify },
    {"name": "LineEnd", "symbols": [/[^\n]/, "LineEnd"], "postprocess":  nullify }
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
