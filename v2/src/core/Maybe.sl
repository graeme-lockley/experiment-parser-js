import file:./Boolean as Boolean;
import file:./Record as Record;

import file:./Debug as DEBUG;


Just value =
    Record.mk1
        "value" value;


Nothing =
    Record.mk0 ();


isJust maybe =
    Record.get "value" maybe
assumptions {
    isJust (Just 1);
    Boolean.not o isJust Nothing
};


isNothing = Boolean.not o isJust
assumptions {
    Boolean.not o isNothing (Just 1);
    isNothing Nothing
};


withDefault defaultValue maybe =
    if isJust maybe then
        Record.get "value" maybe
    else
        defaultValue
assumptions {
    withDefault 0 (Just 1) == 1;
    withDefault 0 Nothing == 0
};


map f maybe =
    if isJust maybe then
        Just (f (Record.get "value" maybe))
    else
        maybe
assumptions {
    DEBUG.eq (map (\n -> n + 1) (Just 1)) (Just 2);
    DEBUG.eq (map (\n -> n + 1) Nothing) Nothing
};
