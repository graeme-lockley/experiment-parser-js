import file:./ParserCombinatorsHelper as Helper;

import file:../core/Array as Array;
import file:../core/Result as Result;
import file:../core/Tuple as Tuple;
import file:../core/Maybe as Maybe;

import file:../core/Object as Object;


symbol tokenID lexer =
    if lexer.id == tokenID then
        Result.Ok (Tuple.Tuple lexer.text (lexer.next ()))
    else
        Result.Error ("Expected the symbol " ++ tokenID);


or parsers lexer =
    Array.foldl (\result \parser -> if (Result.isOk result) then result else (parser lexer)) (Result.Error "None of the OR terms could be matched") parsers;


and parsers lexer =
    Helper.and parsers lexer;


and2 parsers lexer =
    Array.foldl (\result \parser ->
        if (Result.isOk result) then
            Result.flatMap (\ok -> map (\item -> Array.append (Tuple.first ok) item) result) (\error -> Result.Error error) (parser (extractLexer result))
        else
            result) (Result.Ok (Tuple.Tuple Array.empty lexer)) parsers;


option parser lexer =
    Result.Ok (Result.flatMap (\ok -> Tuple.mapFirst Maybe.Just ok) (\_ -> Tuple.Tuple Maybe.Nothing lexer) (parser lexer));


many parser lexer =
    or (Array.prepend (many1 parser) (Array.prepend (empty Array.empty) Array.empty)) lexer;


many1 parser lexer =
    (\result ->
        if Result.isOk result then
            map (\r -> Array.prepend (extractResult result) r) (many parser (extractLexer result))
        else
            result
    ) (parser lexer);


empty value lexer =
    Result.Ok (Tuple.Tuple value lexer);


extractResult result =
    Tuple.first (Result.withDefault () result);

extractLexer result =
    Tuple.second (Result.withDefault () result);


sepBy1 = Helper.sepBy1;


chainl1 = Helper.chainl1;


map f result =
    Result.map (\t -> Tuple.mapFirst f t) result
assumptions {
    Object.eq (map ((+) 1) (Result.Ok (Tuple.Tuple 1 "Hello"))) (Result.Ok (Tuple.Tuple 2 "Hello"))
};


errorMessage errorMessage =
    Result.formatError (\_ -> errorMessage)
assumptions {
    Object.eq (errorMessage "world" (Result.Error "hello")) (Result.Error "world")
};
