import file:../core/Array as Array;
import file:../core/Result as Result;
import file:../core/Tuple as Tuple;
import file:../core/Maybe as Maybe;

import file:./Lexer as Lexer;

import file:../core/Debug as DEBUG;


tokens = Lexer.TokenEnum;
testLexer = Lexer.fromString "hello ! the ! world" "stream";


symbol tokenID lexer =
    if (Lexer.id lexer) == tokenID then
        empty (Lexer.text lexer) (Lexer.next lexer)
    else
        Result.Error ("Expected the symbol " ++ tokenID)
assumptions {
    DEBUG.eq (symbol tokens.IDENTIFIER testLexer) (empty "hello" (nextLexer 1 testLexer));
    DEBUG.eq (symbol tokens.CONSTANT_INTEGER testLexer) (Result.Error ("Expected the symbol " ++ tokens.CONSTANT_INTEGER))
};


or parsers lexer =
    Array.foldl (\result \parser -> if Result.isOk result then result else (parser lexer)) (Result.Error "None of the OR terms could be matched") parsers;


and parsers lexer =
    Array.foldl (\accumulatedResult \parser ->
        if Result.isOk accumulatedResult then
            andOpResultMerge accumulatedResult (parser (extractLexer accumulatedResult))
        else
            accumulatedResult) (empty Array.empty lexer) parsers
assumptions {
    DEBUG.eq (and (Array.mk1 (symbol tokens.IDENTIFIER)) testLexer) (empty (Array.mk1 "hello") (nextLexer 1 testLexer));
    DEBUG.eq (and (Array.mk2 (symbol tokens.IDENTIFIER) (symbol tokens.BANG)) testLexer) (empty (Array.mk2 "hello" "!") (nextLexer 2 testLexer));
    DEBUG.eq (and (Array.mk2 (symbol tokens.IDENTIFIER) (symbol tokens.IDENTIFIER)) testLexer) (Result.Error ("Expected the symbol " ++ tokens.IDENTIFIER));
    DEBUG.eq (and (Array.mk2 (symbol tokens.BANG) (symbol tokens.IDENTIFIER)) testLexer) (Result.Error ("Expected the symbol " ++ tokens.BANG))
};


andOpResultMerge accumulatedResult newResult =
    if Result.isOk accumulatedResult then
        if Result.isOk newResult then
            empty (Array.append (extractResult newResult) (extractResult accumulatedResult)) (extractLexer newResult)
        else
            newResult
    else
        accumulatedResult
assumptions {
    DEBUG.eq (andOpResultMerge (Result.Error "oops") (empty "hello" testLexer)) (Result.Error "oops");
    DEBUG.eq (andOpResultMerge (empty Array.empty testLexer) (Result.Error "oops")) (Result.Error "oops");
    DEBUG.eq (andOpResultMerge (empty (Array.mk1 "hello") testLexer) (empty "world" (nextLexer 1 testLexer))) (empty (Array.mk2 "hello" "world") (nextLexer 1 testLexer))
};


empty value lexer =
    Result.Ok (Tuple.Tuple value lexer);


option parser lexer =
    Result.Ok (Result.flatMap (\ok -> Tuple.mapFirst Maybe.Just ok) (\_ -> Tuple.Tuple Maybe.Nothing lexer) (parser lexer));


many parser lexer =
    or (Array.mk2 (many1 parser) (empty Array.empty)) lexer;


many1 parser lexer =
    (\result ->
        if Result.isOk result then
            map (\r -> Array.prepend (extractResult result) r) (many parser (extractLexer result))
        else
            result
    ) (parser lexer);


empty value lexer =
    Result.Ok (Tuple.Tuple value lexer);


sepBy1 parser separator lexer =
    (\accumulatedResult \tailParser ->
        if Result.isOk accumulatedResult then
            sepBy1p (map (\item -> Array.mk1 item) accumulatedResult) tailParser
        else
            accumulatedResult
    ) (parser lexer) ((map (\item -> Maybe.withDefault () (Array.at 1 item))) o (and (Array.mk2 separator parser)))
assumptions {
    DEBUG.eq (sepBy1 (symbol tokens.IDENTIFIER) (symbol tokens.BANG) testLexer) (empty (Array.mk3 "hello" "the" "world") (nextLexer 5 testLexer))
};


sepBy1p accumulatedResult parser =
    (\newResult ->
        if Result.isOk newResult then
            sepBy1p (andOpResultMerge accumulatedResult newResult) parser
        else
            accumulatedResult
    ) (parser (extractLexer accumulatedResult));


chainl1 parser separator lexer =
    (\accumulatedResult \tailParser ->
        if Result.isOk accumulatedResult then
            chainl1p accumulatedResult tailParser
        else
            accumulatedResult
    ) (parser lexer) (and (Array.mk2 separator parser));



chainl1p accumulatedResult parser =
    (\newResult ->
        if Result.isOk newResult then
            chainl1p (map (\item -> ((at 0 item) (extractResult accumulatedResult) (at 1 item))) newResult) parser
        else
            accumulatedResult
    ) (parser (extractLexer accumulatedResult));


at i a = Maybe.withDefault () (Array.at i a);


map f result =
    Result.map (\t -> Tuple.mapFirst f t) result
assumptions {
    DEBUG.eq (map ((+) 1) (Result.Ok (Tuple.Tuple 1 "Hello"))) (Result.Ok (Tuple.Tuple 2 "Hello"))
};


errorMessage errorMessage =
    Result.formatError (\_ -> errorMessage)
assumptions {
    DEBUG.eq (errorMessage "world" (Result.Error "hello")) (Result.Error "world")
};


extractResult result =
    Tuple.first (Result.withDefault () result);


extractLexer result =
    Tuple.second (Result.withDefault () result);


nextLexer n lexer =
    if n <= 0 then lexer else (nextLexer (n - 1) (Lexer.next lexer));
