@{% function only(d) { return d[0] } %}
@{% function doubleonly(d) { return d[0][0] } %}
@{% function flat(d) { return d[1].concat(d[0]) } %}
@{% function nullify(d) { return null } %}

# main
main -> _ program {% function(d) { return d[1] } %}

globalLine -> function {% id %}
            | declaration ";" {% id %}
            | BlockComment {% id %}
            | LineComment {% id %}
            | struct {% id %}

program -> globalLine _ {% function(d) { return [d[0]] } %}
        | program globalLine _ {% function(d) { return d[0].concat([d[1]]) }%}

baretype -> "int" | "double" | "void"
pointer -> null {% function() { return "" } %}
            | "*" pointer {% function(d) { return d[0]+d[1] } %}

type -> baretype pointer {% function(d) { return d[0][0] + d[1] } %}
        | "structptr(" word ")" {% function(d) { return d.join("") } %}

integer -> [0-9\-] {% id %}
          | integer [0-9] {% function(d) { return "" + d[0] + d[1] } %}
floating -> integer "." integer {% function(d) { return +(d[0]+d[1]+d[2]) } %}
number -> floating {% id %} | integer {% id %}

word -> [A-Za-z] {% id %}
        | word [A-Za-z0-9] {% function(d) { return "" + d[0] + d[1] } %}

FunctionCall -> word "(" _ paramvals _ ")"
                {% function(d) { return ["call", d[0], d[3]] } %}

# order of operations

# parans
P -> "(" _ AS _ ")" {% function(d) { return d[2] } %}
    | N {% id %}
    | FunctionCall {% id %}

# multiplication + division
MD -> MD _ "*" _ P {% function(d) { return ["*", d[0], d[4]] } %}
    | MD _ "/" _ P {% function(d) { return ["/", d[0], d[4]] } %}
    | P {% id %}

# addition + subtraction
AS -> AS _ "+" _ MD {% function(d) { return ["+", d[0], d[4]]} %}
    | AS _ "-" _ MD {% function(d) { return ["-", d[0], d[4]]} %}
    | MD {% id %}

# number
N -> number {% id %}
    | variable {% id %}

variable -> word {% id %} |
        "*" AS {% function(d) { return ["derefexp", d[0], d[1]] } %}
        | word "->" word {% function(d) { return d.join("") } %}

value -> AS {% id %}

declUndef -> type " " word {% function(d) { return ["decl", d[0], d[2], null] } %}
declInit -> declUndef _ "=" _ value {% function(d) { return [d[0][0], d[0][1], d[0][2], d[4]] } %}
declaration -> declInit {% id %}
              | declUndef {% id %}

struct -> "struct " _ word _ "{" structBits _ "};"
          {% function(d) { return ["struct", d[2], d[5]]} %}
structBit -> _ declUndef ";" {% function(d) { return [d[1][1], d[1][2]] } %}
structBits -> structBit |
              structBits structBit {% function(d) { return d[0].concat([d[1]]) } %}

assignment -> variable _ assignmentOperator _ value {% function(d) { return ["assignment", d[0], d[2], d[4]] } %}
assignmentOperator -> "=" {% id %}
                    | "+=" {% id %}
                    | "-=" {% id %}
                    | "*=" {% id %}
                    | "/=" {% id %}

IfStatement -> bareifStatement | elseIfStatement
ElseBlock -> IfStatement {% id %}
          | "{" block _ "}" {% function(d) { return d[1] } %}
bareifStatement -> "if" _ "(" _ condition _ ")" _ "{" block _ "}"
                {% function(d) { return ["if", d[4], d[9]] } %}
elseIfStatement -> bareifStatement _ "else" _ ElseBlock
                  {% function(d) { return ["ifElse", d[0], d[4]] } %}

condition -> value _ conditional _ value {% function(d) { return [d[0], d[2], d[4]]} %}
conditionals -> "==" | ">=" | "<=" | "!=" | ">" | "<"
conditional -> conditionals {% function(d) { return d[0][0] } %}

return -> _ "return " value {% function(d) { return ["return", d[2]] } %}

BlockComment -> _ "/*" commentbody "*/" {% function(d) { return ["comment"] } %}
LineComment -> _ "//" LineEnd {% function(d) { return ["comment"]} %}

WhileLoop -> "while" _ "(" _ condition _ ")" _ "{" block _ "}"
              {% function(d) { return ["while", d[4], d[9]] } %}
ForLoop -> "for" _ "(" _ assignment ";" _ condition ";" _ assignment _ ")" _ "{" block _ "}"
            {% function(d) { return ["for", d[4], d[7], d[10], d[15]] } %}

function -> type " " word _ "(" _ params _ ")" _ "{" block _ "}"
            {% function(d) { return ["func", d[0], d[2], d[6], d[11]] }%}
          | type " " word _ "(" _ params _ ")" _ "{" _ "}"
            {% function(d) { return ["func", d[0], d[2], d[6], []] } %}

param -> type " " word {% function(d) { return [d[0], d[2]] } %}
paramval -> value {% id %}
params -> null | param | params _ "," _ param {% function(d){ return d[0].concat([d[4]])} %}
paramvals -> null | paramval | paramvals _ "," _ paramval {% function(d) { return d[0].concat([d[4]])} %}
block -> statement | block statement {% function(d) { return d[0].concat([d[1]])} %}
statement -> _ declaration ";" {% function(d) { return d[1] } %}
            | return ";"  {% id %}
            | _ assignment ";" {% function(d) { return d[1] } %}
            | _ IfStatement {% function(d) { return d[1] } %}
            | _ WhileLoop {% function(d) { return d[1] } %}
            | _ ForLoop {% function(d) { return d[1] } %}
            | _ FunctionCall ";" {% function(d) { return d[1] } %}
            | BlockComment {% id %}
            | LineComment {% id %}

# whitespace
_ -> null {% nullify %}
    | [\s] _ {% nullify %}
    | LineComment _ {% nullify %}
    | BlockComment _ {% nullify %}

commentbody -> null {% nullify %}
    | [^\*] commentbody {% nullify %}
    | "*" [^\/] commentbody {% nullify %}

LineEnd -> null {% nullify %}
          | [^\n] LineEnd {% nullify %}
