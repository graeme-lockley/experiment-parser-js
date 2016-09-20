"use strict";

var Result = require('./core/Result');
var Lexer = require('./Lexer');
var Tuple = require('./core/Tuple');
var AST = require('./AST');


/**
 * EXPR :== TERM { TERM }
 * TERM :== CONSTANT_INTEGER
 *        | IDENTIFIER
 *        | '\\' IDENTIFIER { '\\' IDENTIFIER } '->' EXPR
 *        | '(' EXPR ')'
 */

/**
 * parser 'a :: Lexer -> Result(Tuple('a, Lexer))
 */

function identity(x) {
    return x;
}

function compose(f1, f2) {
    return x => f1(f2(x));
}

function mapError(result, errorMessage) {
    return result.map(
        ok => result,
        error => Result.Error(errorMessage));
}

function symbol(tokenID, mapFunction = identity) {
    return lexer => (lexer.token.id == tokenID)
        ? Result.Ok(Tuple.Tuple(mapFunction(lexer.token.text), lexer.next()))
        : Result.Error("Expected the symbol " + tokenID);
}

function parseOr(parsers) {
    return lexer => {
        for (var index = 0; index < parsers.length; index += 1) {
            var parserIndexResult = parsers[index](lexer);
            if (parserIndexResult.isOk()) {
                return parserIndexResult;
            }
        }
        return Result.Error("None of the OR terms could be matched");
    };
}

function parseAnd(parsers, mapFunction) {
    return lexer => {
        if (parsers.length == 0) {
            return Result.Error("And parsing function requires at least one parser")
        } else {
            var results = [];
            var currentLexer = lexer;
            for (var index = 0; index < parsers.length; index += 1) {
                var intermediateResult = parsers[index](currentLexer);
                if (intermediateResult.isOk()) {
                    results.push(intermediateResult.getOkOrElse().fst);
                    currentLexer = intermediateResult.getOkOrElse().snd;
                } else {
                    return intermediateResult;
                }
            }

            return Result.Ok(Tuple.Tuple(mapFunction(results), currentLexer));
        }
    }
}

function many1(parser) {
    return lexer => {
        var firstResult = parser(lexer);

        if (firstResult.isOk()) {
            var result = [firstResult.getOkOrElse().fst];
            var currentLexer = firstResult.getOkOrElse().snd;

            while (true) {
                var currentResult = parser(currentLexer);

                if (currentResult.isOk()) {
                    result.push(currentResult.getOkOrElse().fst);
                    currentLexer = currentResult.getOkOrElse().snd;
                } else {
                    return Result.Ok(Tuple.Tuple(result, currentLexer));
                }
            }
        } else {
            return firstResult;
        }
    }
}

function parseConstantInteger(lexer) {
    return mapError(
        symbol(Lexer.TokenEnum.CONSTANT_INTEGER, compose(AST.CONSTANT_INTEGER, parseInt))(lexer),
        "Expected a constant integer"
    );
}

function parseIdentifier(lexer) {
    return mapError(
        symbol(Lexer.TokenEnum.IDENTIFIER, AST.IDENTIFIER)(lexer),
        "Expected an identifier"
    );
}

function parseConstantIdentifier(name) {
    return lexer => {
        var result = symbol(Lexer.TokenEnum.IDENTIFIER, AST.IDENTIFIER)(lexer);

        return result.map(
            ok => result,
            error => Result.Error("Expected " + name));
    };
}

function parseLambda(lexer) {
    return parseAnd([
        many1(
            parseAnd([symbol(Lexer.TokenEnum.LAMBDA), symbol(Lexer.TokenEnum.IDENTIFIER)], elements => elements[1])),
        parseConstantIdentifier("->"),
        parseExpr
    ], items => AST.LAMBDA(items[0], items[2]))(lexer);
}

function parseParenthesisExpression(lexer) {
    return parseAnd([
        symbol(Lexer.TokenEnum.LPAREN),
        parseExpr,
        symbol(Lexer.TokenEnum.RPAREN)], elements => elements[1])(lexer);
}

function parseExpr(lexer) {
    return parseTerm(lexer);
}

function parseTerm(lexer) {
    return parseOr([parseConstantInteger, parseIdentifier, parseLambda, parseParenthesisExpression])(lexer);
}

function parseString(input) {
    return parseExpr(Lexer.fromString(input));
}


module.exports = {
    parseString, parseTerm
};