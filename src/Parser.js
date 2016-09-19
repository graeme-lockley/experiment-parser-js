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
    return function (x) {
        return f1(f2(x));
    }
}

function mapError(result, errorMessage) {
    if (Result.isError(result)) {
        return Result.Error(errorMessage);
    } else {
        return result;
    }
}

function symbol(tokenID, mapFunction) {
    return function (lexer) {
        if (lexer.token.id == tokenID) {
            return Result.Ok(Tuple.Tuple(mapFunction(lexer.token.text), lexer.next()));
        } else {
            return Result.Error("Expected the symbol " + tokenID);
        }
    };
}

function parseOr(parsers) {
    return function (lexer) {
        for (var index = 0; index < parsers.length; index += 1) {
            var parserIndexResult = parsers[index](lexer);
            if (Result.isOk(parserIndexResult)) {
                return parserIndexResult;
            }
        }
        return Result.Error("None of the OR terms could be matched");
    };
}

function parseAnd(parsers, mapFunction) {
    return function (lexer) {
        if (parsers.length == 0) {
            return Result.Error("And parsing function requires at least one parser")
        } else {
            var results = [];
            var currentLexer = lexer;
            for (var index = 0; index < parsers.length; index += 1) {
                var intermediateResult = parsers[index](currentLexer);
                if (Result.isOk(intermediateResult)) {
                    results.push(Tuple.fst(Result.getOkOrElse(intermediateResult)));
                    currentLexer = Tuple.snd(Result.getOkOrElse(intermediateResult));
                } else {
                    return intermediateResult;
                }
            }

            return Result.Ok(Tuple.Tuple(mapFunction(results), currentLexer));
        }
    }
}

function nthArrayElement(n) {
    return function (elements) {
        return elements[n];
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

function parseParenthesisExpression(lexer) {
    return parseAnd([
        symbol(Lexer.TokenEnum.LPAREN, identity),
        parseExpr,
        symbol(Lexer.TokenEnum.RPAREN, identity)], nthArrayElement(1))(lexer);
}

function parseExpr(lexer) {
    return parseTerm(lexer);
}

function parseTerm(lexer) {
    return parseOr([parseConstantInteger, parseIdentifier, parseParenthesisExpression])(lexer);
}

var parseString = function (input) {
    var context = Lexer.fromString(input);

    return parseExpr(context);
};


module.exports = {
    parseString: parseString,
    parseTerm: parseTerm
};