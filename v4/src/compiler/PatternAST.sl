import file:../core/Record as Record;


any =
    Record.mk1
        "type" "ANY";


variable name =
    Record.mk2
        "type" "VARIABLE"
        "name" name;


adtConstructor name patterns =
    Record.mk3
        "type" "CONSTRUCTOR"
        "name" name
        "patterns" patterns;
