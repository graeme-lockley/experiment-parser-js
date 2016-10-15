"use strict";

const Result = require('./Result');
const Tuple = require('./Tuple');
const Maybe = require('./Maybe');


/**
 * parser 'a :: Lexer -> Result(Tuple('a, Lexer))
 */


const identity = (x => x);


function mapError(result, errorMessage) {
    return Result.formatError(_ => errorMessage)(result);
}


function symbol(tokenID, mapFunction = identity) {
    return lexer => (lexer.id == tokenID)
        ? Result.Ok(Tuple.Tuple(mapFunction(lexer.text), lexer.next()))
        : Result.Error("Expected the symbol " + tokenID);
}


function or(parsers) {
    return lexer => {
        for (let index = 0; index < parsers.length; index += 1) {
            const parserIndexResult = parsers[index](lexer);
            if (parserIndexResult.isOk()) {
                return parserIndexResult;
            }
        }
        return Result.Error("None of the OR terms could be matched");
    };
}


function and(parsers, mapFunction = identity) {
    return lexer => {
        if (parsers.length == 0) {
            return Result.Error("And parsing function requires at least one parser")
        } else {
            const results = [];
            let currentLexer = lexer;
            for (let index = 0; index < parsers.length; index += 1) {
                const intermediateResult = parsers[index](currentLexer);
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


function option(parser, mapFunction = identity) {
    return lexer => {
        const result = parser(lexer);

        return result.isOk()
            ? Result.Ok(Tuple.Tuple(Maybe.Just(mapFunction(result.getOkOrElse().fst)), result.getOkOrElse().snd))
            : Result.Ok(Tuple.Tuple(Maybe.Nothing, lexer));
    }
}


function many(parser, mapFunction = identity) {
    return lexer => {
        const result = [];
        let currentLexer = lexer;

        while (true) {
            const currentResult = parser(currentLexer);

            if (currentResult.isOk()) {
                result.push(currentResult.getOkOrElse().fst);
                currentLexer = currentResult.getOkOrElse().snd;
            } else {
                return Result.Ok(Tuple.Tuple(mapFunction(result), currentLexer));
            }
        }
    }
}


function many1(parser, mapFunction = identity) {
    return lexer => {
        const firstResult = parser(lexer);

        if (firstResult.isOk()) {
            const result = [firstResult.getOkOrElse().fst];
            let currentLexer = firstResult.getOkOrElse().snd;

            while (true) {
                const currentResult = parser(currentLexer);

                if (currentResult.isOk()) {
                    result.push(currentResult.getOkOrElse().fst);
                    currentLexer = currentResult.getOkOrElse().snd;
                } else {
                    return Result.Ok(Tuple.Tuple(mapFunction(result), currentLexer));
                }
            }
        } else {
            return firstResult.map(
                ok => Result.Ok(mapFunction(ok.fst), ok.snd),
                error => firstResult
            );
        }
    }
}


function sepBy1(parser, separatorParser, mapFunction = identity) {
    const nextParser = and([separatorParser, parser], elements => elements[1]);

    return lexer => {
        const firstResult = parser(lexer);

        if (firstResult.isOk()) {
            const result = [firstResult.getOkOrElse().fst];
            let currentLexer = firstResult.getOkOrElse().snd;

            while (true) {
                const currentResult = nextParser(currentLexer);

                if (currentResult.isOk()) {
                    result.push(currentResult.getOkOrElse().fst);
                    currentLexer = currentResult.getOkOrElse().snd;
                } else {
                    return Result.Ok(Tuple.Tuple(mapFunction(result), currentLexer));
                }
            }
        } else {
            return firstResult.map(
                ok => Result.Ok(mapFunction(ok.fst), ok.snd),
                error => firstResult
            );
        }
    }
}


function chainl1(parser, separatorParser, mapFunction = identity) {
    const nextParser = and([separatorParser, parser]);

    return lexer => {
        const firstResult = parser(lexer);

        if (firstResult.isOk()) {
            let result = firstResult.getOkOrElse().fst;
            let currentLexer = firstResult.getOkOrElse().snd;

            while (true) {
                const currentResult = nextParser(currentLexer);

                if (currentResult.isOk()) {
                    const nextParseResult = currentResult.getOkOrElse().fst;

                    result = nextParseResult[0](result, nextParseResult[1]);
                    currentLexer = currentResult.getOkOrElse().snd;
                } else {
                    return Result.Ok(Tuple.Tuple(mapFunction(result), currentLexer));
                }
            }
        } else {
            return firstResult.map(
                ok => Result.Ok(mapFunction(ok.fst), ok.snd),
                error => firstResult
            );
        }
    }
}


module.exports = {
    and,
    chainl1,
    many,
    many1,
    mapError,
    option,
    or,
    sepBy1,
    symbol
};