import file:./AST as AST;
import file:./Lexer as Lexer;
import file:./ParserCombinators as P;

import file:../core/Array as Array;
import file:../core/Character as Character;
import file:../core/Debug as DEBUG;
import file:../core/Maybe as Maybe;
import file:../core/Result as Result;
import file:../core/String as String;
import file:../core/Tuple as Tuple;


Tokens =
    Lexer.TokenEnum;


parseMODULE lexer =
    (
        (P.map (\e -> AST.moduleDeclaration (Lexer.sourceName lexer) (at 0 e) (at 1 e)(Maybe.withDefault AST.constantUnit (at 2 e)))) o
        (P.and (Array.mk3
            (P.many parseIMPORT)
            (P.many (
                (P.map (\es -> at 0 es)) o
                (P.and (Array.mk2
                    parseDECL
                    (P.symbol Tokens.SEMICOLON))))
            )
            (P.option parseEXPR1)))
    ) lexer;


parseIMPORT =
    (P.map (\e -> AST.importModule (AST.constantURL (at 1 e)) (AST.identifier (at 3 e)))) o
    (P.and (Array.mk5
        (P.symbol Tokens.IMPORT)
        (P.symbol Tokens.CONSTANT_URL)
        (P.symbol Tokens.AS)
        (P.symbol Tokens.IDENTIFIER)
        (P.symbol Tokens.SEMICOLON)));


markLocation parser lexer =
    Result.map (\t -> Tuple.Tuple (Array.mk3 startToken (Tuple.second t) (Tuple.first t)) (Tuple.second t)) result
        where {
            startToken =
                lexer;

            result =
                parser lexer
        };


parseDECL lexer =
    (
        (P.map parseDECLMap) o
        (P.and (Array.mk4
            (P.many1 parseIdentifier)
            (P.symbol Tokens.EQUAL)
            parseEXPR1
            (P.option (
                (P.map (parseDECLAssumptionMap lexer)) o
                (P.and (Array.mk4
                    (P.symbol Tokens.ASSUMPTIONS)
                    (P.symbol Tokens.LEFT_CURLY)
                    (P.sepBy1 (markLocation parseEXPR1) (P.symbol Tokens.SEMICOLON))
                    (P.symbol Tokens.RIGHT_CURLY)))))))
    ) lexer;


parseDECLAssumptionMap lexer es =
    Array.map (\a ->
        AST.assumption
            (Lexer.sourceName lexer)
            (Lexer.y (at 0 a))
            (String.trim (Lexer.streamText (Lexer.indexXY (at 0 a)) (Lexer.indexXY (at 1 a)) (at 0 a)))
            (at 2 a)
    ) (at 2 es);


parseDECLMap elements =
    let {
        a =
            Maybe.withDefault Array.empty (at 3 elements)
    } in
        if (Array.length (at 0 elements)) == 1 then
            AST.declaration ((\assumption -> assumption.name) (at 0 (at 0 elements))) (at 2 elements) a
        else
            AST.declaration ((\assumption -> assumption.name) (at 0 (at 0 elements))) (mkLambda (Array.map (\n -> n.name) (Array.slice 1 (at 0 elements))) (at 2 elements)) a;


parseEXPR1 lexer =
    P.or (Array.mk2
        (
            (P.map (\e -> AST.scopedDeclarations (at 2 e) (at 5 e))) o
            (P.and (Array.mk6
                (P.symbol Tokens.LET)
                (P.symbol Tokens.LEFT_CURLY)
                (P.sepBy1 parseDECL (P.symbol Tokens.SEMICOLON))
                (P.symbol Tokens.RIGHT_CURLY)
                (P.symbol Tokens.IN)
                parseEXPR1)))
        (
            (P.map (\e ->
                if Maybe.isNothing (at 1 e) then
                    at 0 e
                else
                    AST.scopedDeclarations (at 2 (Maybe.withDefault () (at 1 e))) (at 0 e))) o
            (P.and (Array.mk2
                parseEXPR2
                (P.option
                    (P.and (Array.mk4
                        (P.symbol Tokens.WHERE)
                        (P.symbol Tokens.LEFT_CURLY)
                        (P.sepBy1 parseDECL (P.symbol Tokens.SEMICOLON))
                        (P.symbol Tokens.RIGHT_CURLY)))))))
    ) lexer;


parseEXPR2 =
    P.or (Array.mk3
        (
            (P.map (\e -> AST.ifte (at 1 e) (at 3 e) (at 5 e))) o
            (P.and (Array.mk6
                (P.symbol Tokens.IF)
                parseEXPR2
                (P.symbol Tokens.THEN)
                parseEXPR2
                (P.symbol Tokens.ELSE)
                parseEXPR2)))
        (
            (P.map (\e -> if (Array.length e) == 1 then (at 0 e) else (AST.apply e))) o
            (P.many1 parseEXPR3))
        (
            (P.map (\e -> (at 1 e))) o
            (P.and (Array.mk3
                (P.symbol Tokens.LEFT_CURLY)
                (
                    (P.map (\e -> AST.expressions e)) o
                    (P.sepBy1 parseEXPR2 (P.symbol Tokens.SEMICOLON)))
                (P.symbol Tokens.RIGHT_CURLY)
            ))));


parseEXPR3 lexer =
    P.chainl1 parseEXPR4 ((P.map (\_ -> AST.booleanOr)) o (P.symbol Tokens.BAR_BAR)) lexer;


parseEXPR4 lexer =
    P.chainl1 parseEXPR5 ((P.map (\_ -> AST.booleanAnd)) o (P.symbol Tokens.AMPERSAND_AMPERSAND)) lexer;

parseEXPR5 lexer =
    P.chainl1 parseEXPR6 parseEqualOp lexer;


parseEqualOp lexer =
    P.or (Array.mk2
        ((P.map (\_ -> AST.equal)) o (P.symbol Tokens.EQUAL_EQUAL))
        ((P.map (\_ -> AST.notEqual)) o (P.symbol Tokens.BANG_EQUAL))) lexer;


parseEXPR6 lexer =
    P.chainl1 parseEXPR7 parseComparisonOp lexer;


parseComparisonOp lexer =
    P.or (Array.mk4
        ((P.map (\_ -> AST.lessThan)) o (P.symbol Tokens.LESS))
        ((P.map (\_ -> AST.lessThanEqual)) o (P.symbol Tokens.LESS_EQUAL))
        ((P.map (\_ -> AST.greaterThan)) o (P.symbol Tokens.GREATER))
        ((P.map (\_ -> AST.greaterThanEqual)) o (P.symbol Tokens.GREATER_EQUAL))) lexer;


parseEXPR7 lexer =
    P.chainl1 parseEXPR8 ((P.map (\_ -> AST.stringConcat)) o (P.symbol Tokens.PLUS_PLUS)) lexer;


parseEXPR8 =
    P.chainl1 parseEXPR9 parseAdditiveOp;


parseAdditiveOp lexer =
    P.or (Array.mk2
        ((P.map (\_ -> AST.addition)) o (P.symbol Tokens.PLUS))
        ((P.map (\_ -> AST.subtraction)) o (P.symbol Tokens.MINUS))) lexer;


parseEXPR9 lexer =
    P.chainl1 parseEXPR10 parseMultiplicativeOp lexer;


parseMultiplicativeOp =
    P.or (Array.mk2
        ((P.map (\_ -> AST.multiplication)) o (P.symbol Tokens.STAR))
        ((P.map (\_ -> AST.division)) o (P.symbol Tokens.SLASH)));


parseEXPR10 =
    P.or (Array.mk2
        ((P.map (\e -> (at 0 e) (at 1 e))) o (P.and (Array.mk2 parseUnaryOp parseEXPR10)))
        parseEXPR11);


parseUnaryOp =
    P.or (Array.mk3
        ((P.map (\_ -> AST.booleanNot)) o (P.symbol Tokens.BANG))
        ((P.map (\_ -> AST.unaryPlus)) o (P.symbol Tokens.PLUS))
        ((P.map (\_ -> AST.unaryNegate)) o (P.symbol Tokens.MINUS)));


parseEXPR11 lexer =
    P.chainl1 parseEXPR12 ((P.map (\_ -> AST.composition)) o (P.symbol Tokens.O)) lexer;


parseEXPR12 =
        (P.map (\e -> Array.foldl (\acc \item -> AST.apply acc item) (Maybe.withDefault () (Array.at 0 e)) (Array.slice 1 e))) o
        (P.many1 parseEXPR13);


parseEXPR13 =
    P.or (Array.mk10
        parseConstantInteger
        parseConstantCharacter
        parseConstantString
        ((P.map (\_ -> AST.constantBoolean true)) o (P.symbol Tokens.TRUE))
        ((P.map (\_ -> AST.constantBoolean false)) o (P.symbol Tokens.FALSE))
        parseIdentifier
        parseLambda
        parseParenthesisExpression
        parsePrefixOperator
        parseConstantUnit);


parseConstantInteger lexer =
    P.errorMessage "Expected a constant integer" ((P.map (AST.constantInteger o parseInt)) (P.symbol Tokens.CONSTANT_INTEGER lexer));


parseConstantCharacter lexer =
    (
        (P.map (\x -> AST.constantCharacter (Character.fromLiteral (String.substring 1 ((String.length x) - 1) x)))) o
        (P.symbol Tokens.CONSTANT_CHAR)
    ) lexer;


parseConstantString lexer =
    (
        (P.map (\x -> AST.constantString (String.fromLiteral (String.substring 1 ((String.length x) - 1) x)))) o
        (P.symbol Tokens.CONSTANT_STRING)
    ) lexer;


parseIdentifier lexer =
    (
        (P.map (\e -> if Maybe.isJust (at 1 e) then AST.qualifiedIdentifier (at 0 e) (at 1 (Maybe.withDefault () (at 1 e))) else AST.identifier (at 0 e))) o
        (P.and (Array.mk2
            (P.symbol Tokens.IDENTIFIER)
            (P.option
                (P.and (Array.mk2
                    (P.symbol Tokens.PERIOD)
                    (P.symbol Tokens.IDENTIFIER))))))
    ) lexer;


parseLambda lexer =
    (
        (P.map (\items ->
            mkLambda lambdaIDs lambdaExpression
                where {
                    lambdaIDs =
                            at 0 items;

                    lambdaExpression =
                            at 2 items
                })) o
        (P.and (Array.mk3
            (P.many1 (
                (P.map (\elements -> (at 1 elements))) o
                (P.and (Array.mk2
                    (P.symbol Tokens.LAMBDA)
                    (P.symbol Tokens.IDENTIFIER)))))
            (P.symbol Tokens.MINUS_GREATER)
            parseEXPR1))
    ) lexer;


mkLambda ids expression =
    if Array.length ids == 0 then
        expression
    else
        mkLambda (Array.take ((Array.length ids) - 1) ids) (AST.lambda (at ((Array.length ids) - 1) ids) expression);


parseParenthesisExpression lexer =
    (
        (P.map (\elements -> (at 1 elements))) o
        (P.and (Array.mk3
            (P.symbol Tokens.LEFT_PAREN)
            parseEXPR1
            (P.symbol Tokens.RIGHT_PAREN)))
    ) lexer;


parsePrefixOperator lexer =
    (
        (P.map (\e -> AST.infixOperator (at 1 e))) o
        (P.and (Array.mk3
            (P.symbol Tokens.LEFT_PAREN)
            (P.or (Array.mk13
                (P.symbol Tokens.BAR_BAR)
                (P.symbol Tokens.AMPERSAND_AMPERSAND)
                (P.symbol Tokens.EQUAL_EQUAL)
                (P.symbol Tokens.BANG_EQUAL)
                (P.symbol Tokens.LESS)
                (P.symbol Tokens.LESS_EQUAL)
                (P.symbol Tokens.GREATER)
                (P.symbol Tokens.GREATER_EQUAL)
                (P.symbol Tokens.PLUS_PLUS)
                (P.symbol Tokens.PLUS)
                (P.symbol Tokens.MINUS)
                (P.symbol Tokens.STAR)
                (P.symbol Tokens.SLASH)))
            (P.symbol Tokens.RIGHT_PAREN)))
    ) lexer;


parseConstantUnit lexer =
    (
        (P.map (\_ -> AST.constantUnit)) o
        (P.and (Array.mk2
            (P.symbol Tokens.LEFT_PAREN)
            (P.symbol Tokens.RIGHT_PAREN)))
    ) lexer;



parseString source sourceName =
    let {
        input =
            Lexer.fromString source sourceName;

        parser =
            (P.map (at 0)) o
            (P.and (Array.mk2 parseMODULE (P.symbol Tokens.EOF)));

        parseResult =
            parser input
    } in
        Result.map Tuple.first parseResult;


parseExpressionString input =
    (
        (\parseResult ->
            Result.map (\_ -> Tuple.first _) parseResult
        ) o (
            (P.map (\e -> (at 0 e))) o
            (P.and (Array.mk2 parseEXPR1 (P.symbol Tokens.EOF)))
        ) o (
            Lexer.fromString input
        )
     ) "stream";


at i a =
    Maybe.withDefault () (Array.at i a);