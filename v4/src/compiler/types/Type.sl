import file:../../core/Array as List;
import file:../../core/Record as Record;
import file:../../core/Set as Set;

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


TADT name variables =
    Record.mk3
        "type" "ADT"
        "name" name
        "variables" variables;


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


isTADT type =
    type.type == "ADT"
assumptions {
    !isTADT (TCon "a");
    !isTADT (TVar "a");
    !isTADT (TArr typeBoolean typeBoolean);
    isTADT (TADT "List" (List.singleton "a"))
};


show type =
    if isTCon type then
        type.name
    else if isTVar type then
        type.name
    else if isTArr type then
        let {
            showDomain = show type.domain;
            showRange = show type.range
        } in (
            if isTArr (type.domain) then
                "(" ++ showDomain ++ ") -> " ++ showRange
            else
                showDomain ++ " -> " ++ showRange
        )
    else
        type.name ++ (List.foldl (\acc \item -> acc ++ " " ++ item) "" type.variables)
assumptions {
    show typeString == "String";
    show (TVar "a") == "a";
    DEBUG.eq (show (TArr (TVar "a") (TVar "b"))) "a -> b";
    show (TArr (TArr (TVar "a") (TVar "b")) (TVar "c")) == "(a -> b) -> c";
    show (TArr (TVar "a") (TArr (TVar "b") (TVar "c"))) == "a -> b -> c";
    show (TADT "Type" List.empty) == "Type";
    show (TADT "List" (List.singleton "a")) == "List a"
};



ftv type =
    if isTCon type then
        Set.empty
    else if isTVar type then
        Set.singleton type.name
    else if isTArr type then
        Set.union (ftv type.domain) (ftv type.range)
    else
        Set.fromList type.variables
assumptions {
    DEBUG.eq (ftv typeString) Set.empty;
    DEBUG.eq (ftv (TVar "a")) (Set.singleton "a");
    DEBUG.eq (ftv (TADT "Map" (List.mk2 "a" "a"))) (Set.singleton "a")
};
