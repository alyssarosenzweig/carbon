@{% function only(d) { return d[0] } %}
@{% function doubleonly(d) { return d[0][0] } %}
@{% function flat(d) { return d[1].concat(d[0]) } %}

# main
main -> _ program {% function(d) { return d[1] } %}

globalLine -> function {% id %} | declaration ";" {% id %}
program -> globalLine _ {% function(d) { return [d[0]] } %}
        | program globalLine _ {% function(d) { return d[0].concat([d[1]]) }%}

baretype -> "int" | "double" | "void"
type -> baretype {% doubleonly %}

integer -> [0-9] {% id %}
          | integer [0-9] {% function(d) { return "" + d[0] + d[1] } %}
floating -> integer "." integer {% function(d) { return +(d[0]+d[1]+d[2]) } %}
number -> floating {% id %} | integer {% id %}

word -> [A-Za-z] {% id %}
        | word [A-Za-z0-9] {% function(d) { return "" + d[0] + d[1] } %}

# order of operations

# parans
P -> "(" _ AS _ ")" {% function(d) { return d[2] } %}
    | N {% id %}

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
    | word {% id %}

value -> AS {% id %}

declUndef -> type " " word {% function(d) { return ["decl", d[0], d[2], null] } %}
declInit -> declUndef _ "=" _ value {% function(d) { return [d[0][0], d[0][1], d[0][2], d[4]] } %}
declaration -> declInit {% id %}
              | declUndef {% id %}

assignment -> word _ assignmentOperator _ value {% function(d) { return ["assignment", d[0], d[2], d[4]] } %}
assignmentOperator -> "=" {% id %}

IfStatement -> bareifStatement | elseIfStatement
ElseBlock -> IfStatement {% id %}
          | "{" _ block _ "}" {% function(d) { return d[2] } %}
bareifStatement -> "if" _ "(" _ condition _ ")" _ "{" _ block _ "}"
                {% function(d) { return ["if", d[4], d[10]] } %}
elseIfStatement -> bareifStatement _ "else" _ ElseBlock
                  {% function(d) { return ["ifElse", d[0], d[4]] } %}

condition -> value _ conditional _ value {% function(d) { return [d[0], d[2], d[4]]} %}
conditionals -> "==" | ">=" | "<=" | "!=" | ">" | "<"
conditional -> conditionals {% function(d) { return d[0][0] } %}

return -> _ "return " value {% function(d) { return ["return", d[2]] } %}

function -> type " " word _ "(" _ params _ ")" _ "{" _ block _ "}"
            {% function(d) { return ["func", d[0], d[2], d[6], d[12]] }%}
param -> type " " word {% function(d) { return [d[0], d[2]] } %}
params -> null | param | params _ "," _ param {% function(d){ return d[0].concat([d[4]])} %}

block -> statement | block statement {% function(d) { return d[0].concat([d[1]])} %}
statement -> declaration ";" {% id %}
            | return ";"  {% id %}
            | assignment ";" {% id %}
            | _ IfStatement _ {% function(d) { return d[1] } %}

# whitespace
_ -> null {% function(d) { return null } %}
    | [\s] _ {% function(d) { return null } %}
