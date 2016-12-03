import file:../../core/Record as Record;

mk names type =
    Record.mk2 "names" names "type" type;


names schema =
    schema.names
assumptions {
    names (mk "1" "2") == "1"
};


type schema =
    schema.type
assumptions {
    type (mk "1" "2") == "2"
};
