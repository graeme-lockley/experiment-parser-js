import file:./Type as Type;

import file:../../core/Array as List;
import file:../../core/Record as Record;


Forall names type =
    Record.mk2 "names" names "type" type;


names schema =
    schema.names
assumptions {
    names (Forall "1" "2") == "1"
};


type schema =
    schema.type
assumptions {
    type (Forall "1" "2") == "2"
};


show schema =
    if List.length (names schema) == 0 then
        Type.show (type schema)
    else
        "forall" ++ (List.foldl (\accumulator \item -> accumulator ++ " " ++ item) "" (names schema)) ++ " . " ++ (Type.show (type schema))
assumptions {
    (show (Forall (List.empty) (Type.TArr Type.typeInteger Type.typeString))) == "Integer -> String";
    (show (Forall (List.mk2 "a" "b") (Type.TArr (Type.TVar "a") (Type.TVar "b")))) == "forall a b . a -> b"
};

