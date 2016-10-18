import file:./ParserCombinatorsHelper as Helper;

import file:./Array as Array;
import file:./Result as Result;
import file:./Tuple as Tuple;
import file:./Maybe as Maybe;


symbol tokenID lexer =
    if lexer.id == tokenID then
        Result.Ok (Tuple.Tuple lexer.text (lexer.next ()))
    else
        Result.Error ("Expected the symbol " ++ tokenID);


or = Helper.or;


and = Helper.and;


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
    Tuple.first (Result.withDefault 0 (map ((+) 1) (Result.Ok (Tuple.Tuple 1 "Hello")))) == 2
};


errorMessage errorMessage =
    Result.formatError (\_ -> errorMessage)
assumptions {
    Result.errorWithDefault "none" (errorMessage "world" (Result.Error "hello")) == "world"
};
