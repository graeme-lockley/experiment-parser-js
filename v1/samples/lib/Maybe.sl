import file:./MaybeHelper as MH;
import file:./Boolean as Boolean;

Just = MH.Just;


Nothing = MH.Nothing;


isJust = MH.isJust
assumptions {
    isJust (Just 1);
    Boolean.not o isJust Nothing
};


isNothing = Boolean.not o isJust
assumptions {
    Boolean.not o isNothing (Just 1);
    isNothing Nothing
};


withDefault = MH.withDefault
assumptions {
    withDefault 0 (Just 1) == 1;
    withDefault 0 Nothing == 0
};


map = MH.map
assumptions {
    withDefault 0 (map (\n -> n + 1) (Just 1)) == 2;
    withDefault 0 (map (\n -> n + 1) Nothing) == 0
};
