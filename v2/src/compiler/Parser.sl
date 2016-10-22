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


markLocation =
    Helper.markLocation;


parseDECL =
    Helper.parseDECL;


parseEXPR1 =
    Helper.parseEXPR1;


parseEXPR2 =
    Helper.parseEXPR2;


parseEXPR3 =
    Helper.parseEXPR3;


parseEXPR4 =
    Helper.parseEXPR4;


parseEqualOp =
    Helper.parseEqualOp;


parseEXPR5 =
    Helper.parseEXPR5;


parseComparisonOp =
    Helper.parseComparisonOp;


parseEXPR6 =
    Helper.parseEXPR6;


parseEXPR7 =
    Helper.parseEXPR7;


parseAdditiveOp =
    Helper.parseAdditiveOp;


parseEXPR8 =
    Helper.parseEXPR8;


parseMultiplicativeOp =
    Helper.parseMultiplicativeOp;


parseEXPR9 =
    Helper.parseEXPR9;


parseUnaryOp =
    Helper.parseUnaryOp;


parseEXPR10 =
    Helper.parseEXPR10;


parseEXPR11 =
    Helper.parseEXPR11;


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