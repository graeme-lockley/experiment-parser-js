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
        ? Result.Ok(Tuple.Tuple(mapFunction(lexer.text))(lexer.next()))
        : Result.Error("Expected the symbol " + tokenID);
}


function or(parsers) {
    return lexer => {
        for (let index = 0; index < parsers.length; index += 1) {
            const parserIndexResult = parsers[index](lexer);
            if (Result.isOk(parserIndexResult)) {
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
                if (Result.isOk(intermediateResult)) {
                    results.push(Tuple.first(Result.withDefault()(intermediateResult)));
                    currentLexer = Tuple.second(Result.withDefault()(intermediateResult));
                } else {
                    return intermediateResult;
                }
            }

            return Result.Ok(Tuple.Tuple(mapFunction(results))(currentLexer));
        }
    }
}


function option(parser, mapFunction = identity) {
    return lexer => {
        const result = parser(lexer);

        return Result.isOk(result)
            ? Result.Ok(Tuple.Tuple(Maybe.Just(mapFunction(Tuple.first(Result.withDefault()(result)))))(Tuple.second(Result.withDefault()(result))))
            : Result.Ok(Tuple.Tuple(Maybe.Nothing)(lexer));
    }
}


function many(parser, mapFunction = identity) {
    return lexer => {
        const result = [];
        let currentLexer = lexer;

        while (true) {
            const currentResult = parser(currentLexer);

            if (Result.isOk(currentResult)) {
                result.push(Tuple.first(Result.withDefault()(currentResult)));
                currentLexer = Tuple.second(Result.withDefault()(currentResult));
            } else {
                return Result.Ok(Tuple.Tuple(mapFunction(result))(currentLexer));
            }
        }
    }
}


function many1(parser, mapFunction = identity) {
    return lexer => {
        const firstResult = parser(lexer);

        if (Result.isOk(firstResult)) {
            const result = [Tuple.first(Result.withDefault()(firstResult))];
            let currentLexer = Tuple.second(Result.withDefault()(firstResult));

            while (true) {
                const currentResult = parser(currentLexer);

                if (Result.isOk(currentResult)) {
                    result.push(Tuple.first(Result.withDefault()(currentResult)));
                    currentLexer = Tuple.second(Result.withDefault()(currentResult));
                } else {
                    return Result.Ok(Tuple.Tuple(mapFunction(result))(currentLexer));
                }
            }
        } else {
            return Result.map(_ => Tuple.Tuple(mapFunction(Tuple.first(_)))(Tuple.second(_)))(firstResult);
        }
    }
}


function sepBy1(parser, separatorParser, mapFunction = identity) {
    const nextParser = and([separatorParser, parser], elements => elements[1]);

    return lexer => {
        const firstResult = parser(lexer);

        if (Result.isOk(firstResult)) {
            const result = [Tuple.first(Result.withDefault()(firstResult))];
            let currentLexer = Tuple.second(Result.withDefault()(firstResult));

            while (true) {
                const currentResult = nextParser(currentLexer);

                if (Result.isOk(currentResult)) {
                    result.push(Tuple.first(Result.withDefault()(currentResult)));
                    currentLexer = Tuple.second(Result.withDefault()(currentResult));
                } else {
                    return Result.Ok(Tuple.Tuple(mapFunction(result))(currentLexer));
                }
            }
        } else {
            return Result.map(_ => Tuple.Tuple(mapFunction(Tuple.first(_)))(Tuple.second(_)))(firstResult);
        }
    }
}


function chainl1(parser, separatorParser, mapFunction = identity) {
    const nextParser = and([separatorParser, parser]);

    return lexer => {
        const firstResult = parser(lexer);

        if (Result.isOk(firstResult)) {
            let result = Tuple.first(Result.withDefault()(firstResult));
            let currentLexer = Tuple.second(Result.withDefault()(firstResult));

            while (true) {
                const currentResult = nextParser(currentLexer);

                if (Result.isOk(currentResult)) {
                    const nextParseResult = Tuple.first(Result.withDefault()(currentResult));

                    result = nextParseResult[0](result, nextParseResult[1]);
                    currentLexer = Tuple.second(Result.withDefault()(currentResult));
                } else {
                    return Result.Ok(Tuple.Tuple(mapFunction(result))(currentLexer));
                }
            }
        } else {
            return Result.map(ok => Tuple.Tuple(mapFunction(Tuple.first(ok)))(Tuple.second(ok)))(firstResult);
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