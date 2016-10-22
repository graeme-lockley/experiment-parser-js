import file:./ParserHelper as Helper;

import file:./AST as AST;
import file:./Lexer as Lexer;
import file:./ParserCombinators as P;

import file:../core/Array as Array;
import file:../core/Maybe as Maybe;
import file:../core/Result as Result;
import file:../core/Tuple as Tuple;


Tokens =
    Lexer.TokenEnum;


parseMODULE lexer =
    (
        (P.map (\e -> AST.moduleDeclaration (lexer.sourceName) (at 0 e) (at 1 e)(at 2 e))) o
        (P.and (Array.mk3
            (P.many parseIMPORT)
            (P.many parseDECL)
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
    (\startToken \result ->
        Result.map (\t -> Tuple.Tuple (Array.mk3 startToken (Tuple.second t) (Tuple.first t)) (Tuple.second t)) result
    ) lexer (parser lexer);


parseDECL lexer =
    (
        (P.map Helper.parseDECLMap) o
        (P.and (Array.mk5
            (P.many1 parseIdentifier)
            (P.symbol Tokens.EQUAL)
            parseEXPR1
            (P.option (
                (P.map (Helper.parseDECLAssumptionMap lexer)) o
                (P.and (Array.mk4
                    (P.symbol Tokens.ASSUMPTIONS)
                    (P.symbol Tokens.LEFT_CURLY)
                    (P.sepBy1 (markLocation parseEXPR1) (P.symbol Tokens.SEMICOLON))
                    (P.symbol Tokens.RIGHT_CURLY)))))
            (P.symbol Tokens.SEMICOLON)))
    ) lexer;


parseEXPR1 =
    P.or (Array.mk3
        (
            (P.map (\e -> AST.ifte (at 1 e) (at 3 e) (at 5 e))) o
            (P.and (Array.mk6
                (P.symbol Tokens.IF)
                parseEXPR1
                (P.symbol Tokens.THEN)
                parseEXPR1
                (P.symbol Tokens.ELSE)
                parseEXPR1)))
        (
            (P.map (\e -> if (Array.length e) == 1 then (at 0 e) else (AST.apply e))) o
            (P.many1 parseEXPR2))
        (
            (P.map (\e -> (at 1 e))) o
            (P.and (Array.mk3
                (P.symbol Tokens.LEFT_CURLY)
                (
                    (P.map (\e -> AST.expressions e)) o
                    (P.sepBy1 parseEXPR1 (P.symbol Tokens.SEMICOLON)))
                (P.symbol Tokens.RIGHT_CURLY)
            ))));


parseEXPR2 =
    (P.map (\e -> if (Array.length e) == 1 then (at 0 e) else (AST.booleanOr e))) o
    (P.sepBy1 parseEXPR3 (P.symbol Tokens.BAR_BAR));


parseEXPR3 =
    (P.map (\e -> if (Array.length e) == 1 then (at 0 e) else (AST.booleanAnd e))) o
    (P.sepBy1 parseEXPR4 (P.symbol Tokens.AMPERSAND_AMPERSAND));


parseEXPR4 =
    P.chainl1 parseEXPR5 parseEqualOp;


parseEqualOp lexer =
    P.or (Array.mk2
        ((P.map (\_ -> AST.equal)) o (P.symbol Tokens.EQUAL_EQUAL))
        ((P.map (\_ -> AST.notEqual)) o (P.symbol Tokens.BANG_EQUAL))) lexer;


parseEXPR5 lexer =
    P.chainl1 parseEXPR6 parseComparisonOp lexer;


parseComparisonOp lexer =
    P.or (Array.mk4
        ((P.map (\_ -> AST.lessThan)) o (P.symbol Tokens.LESS))
        ((P.map (\_ -> AST.lessThanEqual)) o (P.symbol Tokens.LESS_EQUAL))
        ((P.map (\_ -> AST.greaterThan)) o (P.symbol Tokens.GREATER))
        ((P.map (\_ -> AST.greaterThanEqual)) o (P.symbol Tokens.GREATER_EQUAL))) lexer;


parseEXPR6 lexer =
    P.chainl1 parseEXPR7 ((P.map (\_ -> AST.stringConcat)) o (P.symbol Tokens.PLUS_PLUS)) lexer;


parseEXPR7 =
    P.chainl1 parseEXPR8 parseAdditiveOp;


parseAdditiveOp lexer =
    P.or (Array.mk2
        ((P.map (\_ -> AST.addition)) o (P.symbol Tokens.PLUS))
        ((P.map (\_ -> AST.subtraction)) o (P.symbol Tokens.MINUS))) lexer;


parseEXPR8 lexer =
    P.chainl1 parseEXPR9 parseMultiplicativeOp lexer;


parseMultiplicativeOp =
    P.or (Array.mk2
        ((P.map (\_ -> AST.multiplication)) o (P.symbol Tokens.STAR))
        ((P.map (\_ -> AST.division)) o (P.symbol Tokens.SLASH)));


parseEXPR9 =
    P.or (Array.mk2
        ((P.map (\e -> (at 0 e)(at 1 e))) o (P.and (Array.mk2 parseUnaryOp parseEXPR9)))
        parseEXPR10);


parseUnaryOp =
    P.or (Array.mk3
        ((P.map (\_ -> AST.booleanNot)) o (P.symbol Tokens.BANG))
        ((P.map (\_ -> AST.unaryPlus)) o (P.symbol Tokens.PLUS))
        ((P.map (\_ -> AST.unaryNegate)) o (P.symbol Tokens.MINUS)));


parseEXPR10 lexer =
    P.chainl1 parseEXPR11 ((P.map (\_ -> AST.composition)) o (P.symbol Tokens.O)) lexer;


parseEXPR11 =
        (P.map (\e -> if (Array.length e) == 1 then at 0 e else AST.apply e)) o
        (P.many1 parseEXPR12);


parseEXPR12 =
    Helper.parseEXPR12;


parseConstantInteger =
    Helper.parseConstantInteger;


convertCharacter =
    Helper.convertCharacter;


parseConstantCharacter =
    Helper.parseConstantCharacter;


parseConstantString =
    Helper.parseConstantString;


parseIdentifier =
    Helper.parseIdentifier;


parseLambda =
    Helper.parseLambda;


parseParenthesisExpression =
    Helper.parseParenthesisExpression;


parsePrefixOperator =
    Helper.parsePrefixOperator;


parseConstantUnit =
    Helper.parseConstantUnit;


parseString input sourceName =
    (\input ->
        (\parser ->
            (\parseResult ->
                Result.map (\value -> Tuple.first value) parseResult
            ) (parser input)
        ) ((P.map (\elements -> at 0 elements)) o (P.and (Array.mk2 parseMODULE (P.symbol Tokens.EOF))))
    ) (Lexer.fromString input sourceName);


parseExpressionString =
    Helper.parseExpressionString;


at i a =
    Maybe.withDefault () (Array.at i a);