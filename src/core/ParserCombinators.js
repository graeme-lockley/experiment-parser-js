"use strict";

var Result = require('./Result');
var Tuple = require('./Tuple');


/**
 * parser 'a :: Lexer -> Result(Tuple('a, Lexer))
 */


function mapError(result, errorMessage) {
    return result.map(
        ok => result,
        error => Result.Error(errorMessage));
}


function symbol(tokenID, mapFunction = (x => x)) {
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


module.exports = {
    many1,
    mapError,
    parseAnd,
    parseOr,
    symbol
};