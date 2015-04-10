@{% function only(d) { return d[0] } %}
@{% function doubleonly(d) { return d[0][0] } %}
@{% function flat(d) { return d[1].concat(d[0]) } %}

# main
main -> _ params _ {% function(d) { return d[1] } %}

baretype -> "int" | "float"
type -> baretype {% doubleonly %}

number -> [0-9] {% id %}
          | number [0-9] {% function(d) { return "" + d[0] + d[1] } %}
word -> [A-Za-z0-9] {% id %}
        | word [A-Za-z0-9] {% function(d) { return "" + d[0] + d[1] } %}
value -> number {% only %}

declUndef -> type " " word {% function(d) { return ["decl", d[0], d[2], null] } %}
declInit -> declUndef _ "=" _ value {% function(d) { return [d[0][0], d[0][1], d[0][2], d[4]] } %}
declaration -> declInit | declUndef

function -> type " " word _ "(" _ params _ ")" _ "{" _ block _  "}"
            {% function(d) { return ["func", d[0], d[2], d[6], d[12]] }%}
param -> type " " word {% function(d) { return [d[0], d[2]] } %}
params -> null | param | params _ "," _ param {% function(d){ return d[0].concat([d[4]])} %}

block -> statement | block statement {% flat %}
statement -> _ declaration ";" {% function(d){return d[1]} %}

# whitespace
_ -> null {% function(d) { return null } %}
    | [\s] _ {% function(d) { return null } %}
