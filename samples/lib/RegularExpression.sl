import file:./RegularExpressionHelper as REH;
import file:./Result as Result;
import file:./List as List;
import file:./Maybe as Maybe;


ANY = REH.ANY;


compile s =
    REH.compile s;


test re s =
    REH.test re s
assumptions {
    !test (Result.withDefault ANY (compile "^[a-z]+$")) "hello world";
    test (Result.withDefault ANY (compile "^[a-z]+$")) "helloworld"
};


match re s =
    REH.match re s
assumptions {
    Maybe.isJust (match (Result.withDefault ANY (compile "^([a-z]+) ([a-z]+)")) "hello world");
    List.length (Maybe.withDefault List.Nil (match (Result.withDefault ANY (compile "^([a-z]+) ([a-z]+)")) "hello world")) == 2;
    Maybe.withDefault "" (List.at 0 (Maybe.withDefault List.Nil (match (Result.withDefault ANY (compile "^([a-z]+) ([a-z]+)")) "hello world"))) == "hello";
    Maybe.withDefault "" (List.at 1 (Maybe.withDefault List.Nil (match (Result.withDefault ANY (compile "^([a-z]+) ([a-z]+)")) "hello world"))) == "world";
    Maybe.isNothing (match (Result.withDefault ANY (compile "^([a-z]+) ([a-z]+)")) "helloworld")
};


