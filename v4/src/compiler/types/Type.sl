import file:../../core/Record as Record;

import file:../../core/Debug as DEBUG;


TCon name =
    Record.mk2
        "type" "CONSTANT"
        "name" name;


TVar name =
    Record.mk2
        "type" "VARIABLE"
        "name" name;


TArr domain range =
    Record.mk3
        "type" "FUNCTION"
        "domain" domain
        "range" range;


typeBoolean = TCon "Boolean";


typeCharacter = TCon "Character";


typeInteger = TCon "Integer";


typeString = TCon "String";


typeUnit = TCon "Unit";


isTCon type =
    type.type == "CONSTANT"
assumptions {
    isTCon (TCon "a");
    !isTCon (TVar "a");
    !isTCon (TArr typeBoolean typeBoolean)
};


isTVar type =
    type.type == "VARIABLE"
assumptions {
    !isTVar (TCon "a");
    isTVar (TVar "a");
    !isTVar (TArr typeBoolean typeBoolean)
};


isTArr type =
    type.type == "FUNCTION"
assumptions {
    !isTArr (TCon "a");
    !isTArr (TVar "a");
    isTArr (TArr typeBoolean typeBoolean)
};


show type =
    if isTCon type then
        type.name
    else if isTVar type then
        type.name
    else
        let {
            showDomain = show type.domain;
            showRange = show type.range
        } in (
            if isTArr (type.domain) then
                "(" ++ showDomain ++ ") -> " ++ showRange
            else
                showDomain ++ " -> " ++ showRange
        )
assumptions {
    show typeString == "String";
    show (TVar "a") == "a";
    DEBUG.eq (show (TArr (TVar "a") (TVar "b"))) "a -> b";
    show (TArr (TArr (TVar "a") (TVar "b")) (TVar "c")) == "(a -> b) -> c";
    show (TArr (TVar "a") (TArr (TVar "b") (TVar "c"))) == "a -> b -> c"
};
