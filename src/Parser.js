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

function symbol(lexer, tokenID, mapFunction) {
    if (lexer.token.id == tokenID) {
        return Result.Ok(Tuple.Tuple(mapFunction(lexer.token.text), lexer.next()));
    } else {
        return Result.Error("Expected the symbol " + tokenID);
    }
}

function parseOr(lexer, parsers) {
    for (var index = 0; index < parsers.length; index += 1) {
        var parserIndexResult = parsers[index](lexer);
        if (parserIndexResult.isOk()) {
            return parserIndexResult;
        }
    }
    return Result.Error("None of the OR terms could be matched");
}

function parseConstantInteger(lexer) {
    return mapError(
        symbol(lexer, Lexer.TokenEnum.CONSTANT_INTEGER, compose(AST.CONSTANT_INTEGER, parseInt)),
        "Expected a constant integer"
    );
}

function parseIdentifier(lexer) {
    return mapError(
        symbol(lexer, Lexer.TokenEnum.IDENTIFIER, AST.IDENTIFIER),
        "Expected an identifier"
    );
}

function parseExpr(lexer) {
    return parseTerm(lexer);
}

function parseTerm(lexer) {
    return parseOr(lexer, [parseConstantInteger, parseIdentifier]);
}

var parseString = function (input) {
    var context = Lexer.fromString(input);

    return parseExpr(context);
};


module.exports = {
    parseString: parseString,
    parseTerm: parseTerm
};