import file:./ResultHelper as RH;
import file:./Maybe as Maybe;

import file:./Debug as DEBUG;


Ok = RH.Ok;

Error = RH.Error;


flatMap = RH.flatMap;


withDefault d =
    flatMap (\_ -> _) (\_ -> d)
assumptions {
    withDefault 10 (Ok 1) == 1;
    withDefault 10 (Error "oops") == 10
};


errorWithDefault errorDefault =
    flatMap (\_ -> errorDefault) (\_ -> _)
assumptions {
    errorWithDefault "none" (Ok 1) == "none";
    errorWithDefault "none" (Error "oops") == "oops"
};


map f =
    RH.map f (\_ -> _)
assumptions {
    DEBUG.eq (map ((+) 1) (Ok 2)) (Ok 3);
    DEBUG.eq (map ((+) 1) (Error "oops")) (Error "oops")
};


formatError f =
    RH.map (\_ -> _) f
assumptions {
    DEBUG.eq (formatError ((++) "hello ") (Ok 2)) (Ok 2);
    DEBUG.eq (formatError ((++) "hello ") (Error "world")) (Error "hello world")
};


toMaybe =
    flatMap (\x -> Maybe.Just x) (\_ -> Maybe.Nothing)
assumptions {
    DEBUG.eq (toMaybe (Ok 2)) (Maybe.Just 2);
    DEBUG.eq (toMaybe (Error "oops")) Maybe.Nothing
};


fromMaybe errorMessage maybe =
    Maybe.withDefault (Error errorMessage) (Maybe.map (\_ -> Ok(_)) maybe)
assumptions {
    DEBUG.eq (fromMaybe "oops" (Maybe.Just 1)) (Ok 1);
    DEBUG.eq (fromMaybe "oops" (Maybe.Nothing)) (Error "oops")
};


isOk =
    flatMap (\_ -> true) (\_ -> false)
assumptions {
    isOk (Ok 1);
    ! isOk (Error "oops")
};


andThen result next =
    flatMap (\ok -> next ok) (\error -> Error error) result
assumptions {
    DEBUG.eq (andThen (Ok 1) (\n -> Ok (n + 1))) (Ok 2);
    DEBUG.eq (andThen (Ok 1) (\n -> Error "oops")) (Error "oops");
    DEBUG.eq (andThen (Error "oops1") (\n -> Error "oops2")) (Error "oops1")
};


is = RH.is;
