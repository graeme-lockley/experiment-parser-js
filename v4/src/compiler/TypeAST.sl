import file:../core/Record as Record;


constant name parameters =
    Record.mk3
        "type" "CONSTANT"
        "name" name
        "parameters" parameters;


functionArrow domain range =
    Record.mk3
        "type" "FUNCTION"
        "domain" domain
        "range" range;


variable name =
    Record.mk2
        "type" "VARIABLE"
        "name" name;
