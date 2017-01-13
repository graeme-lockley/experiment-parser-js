import file:../../core/Array as List;
import file:../../core/Record as Record;
import file:../../core/Set as Set;

import file:../../core/Debug as DEBUG;


TCon name variables =
    Record.mk3
        "type" "CONSTANT"
        "name" name
        "variables" variables;


TVar name =
    Record.mk2
        "type" "VARIABLE"
        "name" name;


TArr domain range =
    Record.mk3
        "type" "FUNCTION"
        "domain" domain
        "range" range;


typeBoolean = TCon "Boolean" List.empty;


typeCharacter = TCon "Character" List.empty;


typeInteger = TCon "Integer" List.empty;


typeString = TCon "String" List.empty;


typeUnit = TCon "Unit" List.empty;


isTCon type =
    type.type == "CONSTANT"
assumptions {
    isTCon (TCon "a" List.empty);
    !isTCon (TVar "a");
    !isTCon (TArr typeBoolean typeBoolean)
};


isTVar type =
    type.type == "VARIABLE"
assumptions {
    !isTVar (TCon "a" List.empty);
    isTVar (TVar "a");
    !isTVar (TArr typeBoolean typeBoolean)
};


isTArr type =
    type.type == "FUNCTION"
assumptions {
    !isTArr (TCon "a" List.empty);
    !isTArr (TVar "a");
    isTArr (TArr typeBoolean typeBoolean)
};


show type =
    if isTCon type then
        type.name ++ (List.foldl (\acc \item -> acc ++ " " ++ item) "" type.variables)
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
    show (TArr (TVar "a") (TArr (TVar "b") (TVar "c"))) == "a -> b -> c";
    show (TCon "Type" List.empty) == "Type";
    show (TCon "List" (List.singleton "a")) == "List a"
};



ftv type =
    if isTCon type then
        Set.fromList type.variables
    else if isTVar type then
        Set.singleton type.name
    else
        Set.union (ftv type.domain) (ftv type.range)
assumptions {
    DEBUG.eq (ftv typeString) Set.empty;
    DEBUG.eq (ftv (TVar "a")) (Set.singleton "a");
    DEBUG.eq (ftv (TCon "Map" (List.mk2 "a" "a"))) (Set.singleton "a")
};
