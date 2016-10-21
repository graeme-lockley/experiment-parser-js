"use strict";

const Result = require('../core/Result');
const Tuple = require('../core/Tuple');
const Maybe = require('../core/Maybe');


/**
 * parser 'a :: Lexer -> Result(Tuple('a, Lexer) String)
 */


function and(parsers) {
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

            return Result.Ok(Tuple.Tuple(results)(currentLexer));
        }
    }
}


function sepBy1(parser, separatorParser) {
    const nextParser = compose(map(elements => elements[1]), and([separatorParser, parser]));

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
                    return Result.Ok(Tuple.Tuple(result)(currentLexer));
                }
            }
        } else {
            return Result.map(_ => Tuple.Tuple(Tuple.first(_))(Tuple.second(_)))(firstResult);
        }
    }
}


function chainl1(parser, separatorParser) {
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
                    return Result.Ok(Tuple.Tuple(result)(currentLexer));
                }
            }
        } else {
            return Result.map(ok => Tuple.Tuple(Tuple.first(ok))(Tuple.second(ok)))(firstResult);
        }
    }
}


function map(f) {
    return result => Result.map(t => Tuple.mapFirst(f)(t))(result);
}


function errorMessage(errorMessage) {
    return Result.formatError(_ => errorMessage);
}

function compose(f1, f2) {
    return x => f1(f2(x));
}


module.exports = {
    and,
    chainl1,
    map,
    errorMessage,
    sepBy1
};