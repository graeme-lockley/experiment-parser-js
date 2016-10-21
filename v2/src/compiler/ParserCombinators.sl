import file:../core/Array as Array;
import file:../core/Result as Result;
import file:../core/Tuple as Tuple;
import file:../core/Maybe as Maybe;

import file:../core/Object as Object;

import file:./Lexer as Lexer;

import file:../core/Debug as DEBUG;


tokens = Lexer.TokenEnum;
testLexer = Lexer.fromString("hello ! the ! world");


symbol tokenID lexer =
    if lexer.id == tokenID then
        empty lexer.text (lexer.next ())
    else
        Result.Error ("Expected the symbol " ++ tokenID)
assumptions {
    Object.eq (symbol tokens.IDENTIFIER testLexer) (empty "hello" (nextLexer 1 testLexer));
    Object.eq (symbol tokens.CONSTANT_INTEGER testLexer) (Result.Error ("Expected the symbol " ++ tokens.CONSTANT_INTEGER))
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
    Object.eq (and (mk1Array (symbol tokens.IDENTIFIER)) testLexer) (empty (mk1Array "hello") (nextLexer 1 testLexer));
    Object.eq (and (mk2Array (symbol tokens.IDENTIFIER) (symbol tokens.BANG)) testLexer) (empty (mk2Array "hello" "!") (nextLexer 2 testLexer));
    Object.eq (and (mk2Array (symbol tokens.IDENTIFIER) (symbol tokens.IDENTIFIER)) testLexer) (Result.Error ("Expected the symbol " ++ tokens.IDENTIFIER));
    Object.eq (and (mk2Array (symbol tokens.BANG) (symbol tokens.IDENTIFIER)) testLexer) (Result.Error ("Expected the symbol " ++ tokens.BANG))
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
    Object.eq (andOpResultMerge (Result.Error "oops") (empty "hello" testLexer)) (Result.Error "oops");
    Object.eq (andOpResultMerge (empty Array.empty testLexer) (Result.Error "oops")) (Result.Error "oops");
    Object.eq (andOpResultMerge (empty (mk1Array "hello") testLexer) (empty "world" (nextLexer 1 testLexer))) (empty (mk2Array "hello" "world") (nextLexer 1 testLexer))
};


empty value lexer =
    Result.Ok (Tuple.Tuple value lexer);


option parser lexer =
    Result.Ok (Result.flatMap (\ok -> Tuple.mapFirst Maybe.Just ok) (\_ -> Tuple.Tuple Maybe.Nothing lexer) (parser lexer));


many parser lexer =
    or (mk2Array (many1 parser) (empty Array.empty)) lexer;


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
            sepBy1p (map (\item -> mk1Array item) accumulatedResult) tailParser
        else
            accumulatedResult
    ) (parser lexer) ((map (\item -> Maybe.withDefault () (Array.at 1 item))) o (and (mk2Array separator parser)))
assumptions {
    Object.eq (sepBy1 (symbol tokens.IDENTIFIER) (symbol tokens.BANG) testLexer) (empty (mk3Array "hello" "the" "world") (nextLexer 5 testLexer))
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
    ) (parser lexer) (and (mk2Array separator parser));



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
    Object.eq (map ((+) 1) (Result.Ok (Tuple.Tuple 1 "Hello"))) (Result.Ok (Tuple.Tuple 2 "Hello"))
};


errorMessage errorMessage =
    Result.formatError (\_ -> errorMessage)
assumptions {
    Object.eq (errorMessage "world" (Result.Error "hello")) (Result.Error "world")
};


extractResult result =
    Tuple.first (Result.withDefault () result);


extractLexer result =
    Tuple.second (Result.withDefault () result);


mk1Array _1 =
    Array.prepend _1 Array.empty;


mk2Array _1 _2 =
    Array.prepend _1 (Array.prepend _2 Array.empty);


mk3Array _1 _2 _3 =
    Array.prepend _1 (mk2Array _2 _3);


nextLexer n lexer =
    if n <= 0 then lexer else (nextLexer (n - 1) (lexer.next()));
