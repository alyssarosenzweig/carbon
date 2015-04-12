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
    {"name": "type", "symbols": ["baretype"], "postprocess":  doubleonly },
    {"name": "integer", "symbols": [/[0-9\-]/], "postprocess":  id },
    {"name": "integer", "symbols": ["integer", /[0-9]/], "postprocess":  function(d) { return "" + d[0] + d[1] } },
    {"name": "floating", "symbols": ["integer", {"literal":"."}, "integer"], "postprocess":  function(d) { return +(d[0]+d[1]+d[2]) } },
    {"name": "number", "symbols": ["floating"], "postprocess":  id },
    {"name": "number", "symbols": ["integer"], "postprocess":  id },
    {"name": "word", "symbols": [/[A-Za-z]/], "postprocess":  id },
    {"name": "word", "symbols": ["word", /[A-Za-z0-9]/], "postprocess":  function(d) { return "" + d[0] + d[1] } },
    {"name": "P", "symbols": [{"literal":"("}, "_", "AS", "_", {"literal":")"}], "postprocess":  function(d) { return d[2] } },
    {"name": "P", "symbols": ["N"], "postprocess":  id },
    {"name": "MD", "symbols": ["MD", "_", {"literal":"*"}, "_", "P"], "postprocess":  function(d) { return ["*", d[0], d[4]] } },
    {"name": "MD", "symbols": ["MD", "_", {"literal":"/"}, "_", "P"], "postprocess":  function(d) { return ["/", d[0], d[4]] } },
    {"name": "MD", "symbols": ["P"], "postprocess":  id },
    {"name": "AS", "symbols": ["AS", "_", {"literal":"+"}, "_", "MD"], "postprocess":  function(d) { return ["+", d[0], d[4]]} },
    {"name": "AS", "symbols": ["AS", "_", {"literal":"-"}, "_", "MD"], "postprocess":  function(d) { return ["-", d[0], d[4]]} },
    {"name": "AS", "symbols": ["MD"], "postprocess":  id },
    {"name": "N", "symbols": ["number"], "postprocess":  id },
    {"name": "N", "symbols": ["word"], "postprocess":  id },
    {"name": "value", "symbols": ["AS"], "postprocess":  id },
    {"name": "declUndef", "symbols": ["type", {"literal":" "}, "word"], "postprocess":  function(d) { return ["decl", d[0], d[2], null] } },
    {"name": "declInit", "symbols": ["declUndef", "_", {"literal":"="}, "_", "value"], "postprocess":  function(d) { return [d[0][0], d[0][1], d[0][2], d[4]] } },
    {"name": "declaration", "symbols": ["declInit"], "postprocess":  id },
    {"name": "declaration", "symbols": ["declUndef"], "postprocess":  id },
    {"name": "assignment", "symbols": ["word", "_", "assignmentOperator", "_", "value"], "postprocess":  function(d) { return ["assignment", d[0], d[2], d[4]] } },
    {"name": "assignmentOperator", "symbols": [{"literal":"="}], "postprocess":  id },
    {"name": " string$4", "symbols": [{"literal":"+"}, {"literal":"="}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "assignmentOperator", "symbols": [" string$4"], "postprocess":  id },
    {"name": " string$5", "symbols": [{"literal":"-"}, {"literal":"="}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "assignmentOperator", "symbols": [" string$5"], "postprocess":  id },
    {"name": " string$6", "symbols": [{"literal":"*"}, {"literal":"="}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "assignmentOperator", "symbols": [" string$6"], "postprocess":  id },
    {"name": " string$7", "symbols": [{"literal":"/"}, {"literal":"="}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "assignmentOperator", "symbols": [" string$7"], "postprocess":  id },
    {"name": "IfStatement", "symbols": ["bareifStatement"]},
    {"name": "IfStatement", "symbols": ["elseIfStatement"]},
    {"name": "ElseBlock", "symbols": ["IfStatement"], "postprocess":  id },
    {"name": "ElseBlock", "symbols": [{"literal":"{"}, "_", "block", "_", {"literal":"}"}], "postprocess":  function(d) { return d[2] } },
    {"name": " string$8", "symbols": [{"literal":"i"}, {"literal":"f"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "bareifStatement", "symbols": [" string$8", "_", {"literal":"("}, "_", "condition", "_", {"literal":")"}, "_", {"literal":"{"}, "_", "block", "_", {"literal":"}"}], "postprocess":  function(d) { return ["if", d[4], d[10]] } },
    {"name": " string$9", "symbols": [{"literal":"e"}, {"literal":"l"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "elseIfStatement", "symbols": ["bareifStatement", "_", " string$9", "_", "ElseBlock"], "postprocess":  function(d) { return ["ifElse", d[0], d[4]] } },
    {"name": "condition", "symbols": ["value", "_", "conditional", "_", "value"], "postprocess":  function(d) { return [d[0], d[2], d[4]]} },
    {"name": " string$10", "symbols": [{"literal":"="}, {"literal":"="}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "conditionals", "symbols": [" string$10"]},
    {"name": " string$11", "symbols": [{"literal":">"}, {"literal":"="}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "conditionals", "symbols": [" string$11"]},
    {"name": " string$12", "symbols": [{"literal":"<"}, {"literal":"="}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "conditionals", "symbols": [" string$12"]},
    {"name": " string$13", "symbols": [{"literal":"!"}, {"literal":"="}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "conditionals", "symbols": [" string$13"]},
    {"name": "conditionals", "symbols": [{"literal":">"}]},
    {"name": "conditionals", "symbols": [{"literal":"<"}]},
    {"name": "conditional", "symbols": ["conditionals"], "postprocess":  function(d) { return d[0][0] } },
    {"name": " string$14", "symbols": [{"literal":"r"}, {"literal":"e"}, {"literal":"t"}, {"literal":"u"}, {"literal":"r"}, {"literal":"n"}, {"literal":" "}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "return", "symbols": ["_", " string$14", "value"], "postprocess":  function(d) { return ["return", d[2]] } },
    {"name": " string$15", "symbols": [{"literal":"/"}, {"literal":"*"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " string$16", "symbols": [{"literal":"*"}, {"literal":"/"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "BlockComment", "symbols": [" string$15", "commentbody", " string$16"], "postprocess":  function(d) { return ["comment"] } },
    {"name": " string$17", "symbols": [{"literal":"/"}, {"literal":"/"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "LineComment", "symbols": [" string$17", "LineEnd"], "postprocess":  function(d) { return ["comment"]} },
    {"name": "function", "symbols": ["type", {"literal":" "}, "word", "_", {"literal":"("}, "_", "params", "_", {"literal":")"}, "_", {"literal":"{"}, "_", "block", "_", {"literal":"}"}], "postprocess":  function(d) { return ["func", d[0], d[2], d[6], d[12]] }},
    {"name": "function", "symbols": ["type", {"literal":" "}, "word", "_", {"literal":"("}, "_", "params", "_", {"literal":")"}, "_", {"literal":"{"}, "_", {"literal":"}"}], "postprocess":  function(d) { return ["func", d[0], d[2], d[6], []] } },
    {"name": "param", "symbols": ["type", {"literal":" "}, "word"], "postprocess":  function(d) { return [d[0], d[2]] } },
    {"name": "params", "symbols": []},
    {"name": "params", "symbols": ["param"]},
    {"name": "params", "symbols": ["params", "_", {"literal":","}, "_", "param"], "postprocess":  function(d){ return d[0].concat([d[4]])} },
    {"name": "block", "symbols": ["statement"]},
    {"name": "block", "symbols": ["block", "statement"], "postprocess":  function(d) { return d[0].concat([d[1]])} },
    {"name": "statement", "symbols": ["declaration", {"literal":";"}], "postprocess":  id },
    {"name": "statement", "symbols": ["return", {"literal":";"}], "postprocess":  id },
    {"name": "statement", "symbols": ["assignment", {"literal":";"}], "postprocess":  id },
    {"name": "statement", "symbols": ["_", "IfStatement"], "postprocess":  function(d) { return d[1] } },
    {"name": "statement", "symbols": ["BlockComment"], "postprocess":  id },
    {"name": "statement", "symbols": ["LineComment"], "postprocess":  id },
    {"name": "_", "symbols": [], "postprocess":  nullify },
    {"name": "_", "symbols": [/[\s]/, "_"], "postprocess":  nullify },
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
