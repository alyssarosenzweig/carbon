@{% function only(d) { return d[0] } %}
@{% function doubleonly(d) { return d[0][0] } %}
@{% function flat(d) { return d[1].concat(d[0]) } %}

# main
main -> _ function _ {% function(d) { return d[1] } %}

baretype -> "int" | "float"
type -> baretype {% doubleonly %}

number -> [0-9] {% id %}
          | number [0-9] {% function(d) { return "" + d[0] + d[1] } %}
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
declaration -> _ declInit | _ declUndef

return -> _ "return " value {% function(d) { return ["return", d[2]] } %}

function -> type " " word _ "(" _ params _ ")" _ "{" block _ "}"
            {% function(d) { return ["func", d[0], d[2], d[6], d[11]] }%}
param -> type " " word {% function(d) { return [d[0], d[2]] } %}
params -> null | param | params _ "," _ param {% function(d){ return d[0].concat([d[4]])} %}

block -> statement | block statement {% function(d) { return d[0].concat([d[1]])} %}
statement -> declaration ";" {% function(d){return d[0][1]} %}
            | return ";"  {% id %}

# whitespace
_ -> null {% function(d) { return null } %}
    | [\s] _ {% function(d) { return null } %}
