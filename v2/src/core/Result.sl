import file:./ResultHelper as RH;
import file:./Maybe as Maybe;

Ok = RH.Ok;

Error = RH.Error;


withDefault d =
    RH.flatMap (\_ -> _) (\_ -> d)
assumptions {
    withDefault 10 (Ok 1) == 1;
    withDefault 10 (Error "oops") == 10
};


errorWithDefault errorDefault =
    RH.flatMap (\_ -> errorDefault) (\_ -> _)
assumptions {
    errorWithDefault "none" (Ok 1) == "none";
    errorWithDefault "none" (Error "oops") == "oops"
};


map f =
    RH.map f (\_ -> _)
assumptions {
    withDefault 0 (map ((+) 1) (Ok 2)) == 3;
    withDefault 0 (map ((+) 1) (Error "oops")) == 0
};


formatError f =
    RH.map (\_ -> _) f
assumptions {
    errorWithDefault "oops" (formatError ((++) "hello ") (Ok 2)) == "oops";
    errorWithDefault "oops" (formatError ((++) "hello ") (Error "world")) == "hello world"
};


toMaybe =
    RH.flatMap (\x -> Maybe.Just x) (\_ -> Maybe.Nothing)
assumptions {
    Maybe.withDefault 0 (toMaybe (Ok 2)) == 2;
    Maybe.withDefault 0 (toMaybe (Error "oops")) == 0
};


fromMaybe errorMessage maybe =
    Maybe.withDefault (Error errorMessage) (Maybe.map (\_ -> Ok(_)) maybe)
assumptions {
    withDefault 0 (fromMaybe "oops" (Maybe.Just 1)) == 1;
    withDefault 0 (fromMaybe "oops" (Maybe.Nothing)) == 0;
    errorWithDefault "hello" (fromMaybe "oops" (Maybe.Just 1)) == "hello";
    errorWithDefault "hello" (fromMaybe "oops" (Maybe.Nothing)) == "oops"
};


isOk =
    RH.flatMap (\_ -> true) (\_ -> false)
assumptions {
    isOk (Ok 1);
    ! isOk (Error "oops")
};


andThen result next =
    RH.flatMap (\ok -> next ok) (\error -> Error error) result
assumptions {
    withDefault 0 (andThen (Ok 1) (\n -> Ok (n + 1))) == 2;
    withDefault 0 (andThen (Ok 1) (\n -> Error "oops")) == 0;
    withDefault 0 (andThen (Error "oops1") (\n -> Error "oops2")) == 0
};


is = RH.is;
