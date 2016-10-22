"use strict";

const Result = require('../core/Result');
const Lexer = require('./Lexer');
const Tuple = require('../core/Tuple');
const AST = require('./AST');

const P = require('./ParserCombinators');


function compose(f1, f2) {
    return x => f1(f2(x));
}


function parseDECLMap(elements) {
    const assumptions = elements[3].withDefault([]);
    return elements[0].length == 1 ? AST.declaration(elements[0][0].name)(elements[2])(assumptions) : AST.declaration(elements[0][0].name)(AST.lambda(elements[0].slice(1).map(n => n.name))(elements[2]))(assumptions)
}


function parseDECLAssumptionMap(lexer) {
    return es => es[2].map(a => {
        const startIndexXY = a[0].indexXY;
        const endIndexXY = a[1].indexXY;
        const text = (lexer.streamText(startIndexXY)(endIndexXY)).trim();
        return AST.assumption(lexer.sourceName)(a[0].y)(text)(a[2]);
    });
}


function parseEXPR1(lexer) {
    return P.or([
        compose(
            P.map(e => AST.ifte(e[1])(e[3])(e[5])),
            P.and([
                P.symbol(Lexer.TokenEnum.IF),
                parseEXPR1,
                P.symbol(Lexer.TokenEnum.THEN),
                parseEXPR1,
                P.symbol(Lexer.TokenEnum.ELSE),
                parseEXPR1
            ])),
        compose(
            P.map(elements => elements.length == 1 ? elements[0] : AST.apply(elements)),
            P.many1(parseEXPR2)),
        compose(
            P.map(e => e[1]),
            P.and([
                P.symbol(Lexer.TokenEnum.LEFT_CURLY),
                compose(
                    P.map(e => AST.expressions(e)),
                    P.sepBy1(parseEXPR1)(P.symbol(Lexer.TokenEnum.SEMICOLON))),
                P.symbol(Lexer.TokenEnum.RIGHT_CURLY)
            ]))
    ])(lexer);
}


function parseEXPR2(lexer) {
    return compose(
        P.map(e => e.length == 1 ? e[0] : AST.booleanOr(e)),
        P.sepBy1(parseEXPR3)(P.symbol(Lexer.TokenEnum.BAR_BAR)))(lexer);
}


function parseEXPR3(lexer) {
    return compose(
        P.map(e => e.length == 1 ? e[0] : AST.booleanAnd(e)),
        P.sepBy1(parseEXPR4)(P.symbol(Lexer.TokenEnum.AMPERSAND_AMPERSAND)))(lexer);
}


function parseEXPR4(lexer) {
    return P.chainl1(parseEXPR5)(parseEqualOp)(lexer);
}


function parseEqualOp(lexer) {
    return P.or([
        compose(P.map(() => l => r => AST.equal(l)(r)), P.symbol(Lexer.TokenEnum.EQUAL_EQUAL)),
        compose(P.map(() => l => r => AST.notEqual(l)(r)), P.symbol(Lexer.TokenEnum.BANG_EQUAL))
    ])(lexer);
}


function parseEXPR5(lexer) {
    return P.chainl1(parseEXPR6)(parseComparisonOp)(lexer);
}


function parseComparisonOp(lexer) {
    return P.or([
        compose(P.map(() => l => r => AST.lessThan(l)(r)), P.symbol(Lexer.TokenEnum.LESS)),
        compose(P.map(() => l => r => AST.lessThanEqual(l)(r)), P.symbol(Lexer.TokenEnum.LESS_EQUAL)),
        compose(P.map(() => l => r => AST.greaterThan(l)(r)), P.symbol(Lexer.TokenEnum.GREATER)),
        compose(P.map(() => l => r => AST.greaterThanEqual(l)(r)), P.symbol(Lexer.TokenEnum.GREATER_EQUAL))
    ])(lexer);
}


function parseEXPR6(lexer) {
    return P.chainl1(
        parseEXPR7)(compose(P.map(() => l => r => AST.stringConcat(l)(r)), P.symbol(Lexer.TokenEnum.PLUS_PLUS)))(lexer);
}


function parseEXPR7(lexer) {
    return P.chainl1(parseEXPR8)(parseAdditiveOp)(lexer);
}


function parseAdditiveOp(lexer) {
    return P.or([
        compose(P.map(() => l => r => AST.addition(l)(r)), P.symbol(Lexer.TokenEnum.PLUS)),
        compose(P.map(() => l => r => AST.subtraction(l)(r)), P.symbol(Lexer.TokenEnum.MINUS))
    ])(lexer);
}


function parseEXPR8(lexer) {
    return P.chainl1(parseEXPR9)(parseMultiplicativeOp)(lexer);
}


function parseMultiplicativeOp(lexer) {
    return P.or([
        compose(P.map(() => l => r => AST.multiplication(l)(r)), P.symbol(Lexer.TokenEnum.STAR)),
        compose(P.map(() => l => r => AST.division(l)(r)), P.symbol(Lexer.TokenEnum.SLASH))
    ])(lexer);
}


function parseEXPR9(lexer) {
    return P.or([
        compose(
            P.map(e => e[0](e[1])),
            P.and([
                parseUnaryOp,
                parseEXPR9
            ])),
        parseEXPR10
    ])(lexer);
}


function parseUnaryOp(lexer) {
    return P.or([
        compose(P.map(() => (op) => AST.booleanNot(op)), P.symbol(Lexer.TokenEnum.BANG)),
        compose(P.map(() => (op) => AST.unaryPlus(op)), P.symbol(Lexer.TokenEnum.PLUS)),
        compose(P.map(() => (op) => AST.unaryNegate(op)), P.symbol(Lexer.TokenEnum.MINUS))
    ])(lexer);
}


function parseEXPR10(lexer) {
    return P.chainl1(parseEXPR11)(compose(P.map(() => l => r => AST.composition(l)(r)), P.symbol(Lexer.TokenEnum.O)))(lexer);
}


function parseEXPR11(lexer) {
    return compose(
        P.map(elements => elements.length == 1 ? elements[0] : AST.apply(elements)),
        P.many1(parseEXPR12))(lexer);
}


function parseEXPR12(lexer) {
    return P.or([
        parseConstantInteger,
        parseConstantCharacter,
        parseConstantString,
        compose(P.map(() => AST.constantBoolean(true)), P.symbol(Lexer.TokenEnum.TRUE)),
        compose(P.map(() => AST.constantBoolean(false)), P.symbol(Lexer.TokenEnum.FALSE)),
        parseIdentifier,
        parseLambda,
        parseParenthesisExpression,
        parsePrefixOperator,
        parseConstantUnit
    ])(lexer);
}


function parseConstantInteger(lexer) {
    return P.errorMessage("Expected a constant integer")(P.map(compose(c => AST.constantInteger(c), parseInt))(P.symbol(Lexer.TokenEnum.CONSTANT_INTEGER)(lexer)));
}


function convertCharacter(c) {
    if (c == '\\n') {
        return '\n';
    } else if (c.length == 2) {
        return c[1];
    } else {
        return c;
    }
}


function parseConstantCharacter(lexer) {
    return compose(P.map(x => AST.constantCharacter(convertCharacter(x.substring(1, x.length - 1)))), P.symbol(Lexer.TokenEnum.CONSTANT_CHAR))(lexer);
}


function convertString(s) {
    let result = s;
    let index = 0;
    while (true) {
        if (index >= result.length) {
            return result;
        } else if (result[index] == '\\') {
            result = result.slice(0, index) + convertCharacter(result.slice(index, index + 2)) + result.slice(index + 2);
        }

        index += 1;
    }
}


function parseConstantString(lexer) {
    return compose(P.map(x => AST.constantString(convertString(x.substring(1, x.length - 1)))), P.symbol(Lexer.TokenEnum.CONSTANT_STRING))(lexer);
}


function parseIdentifier(lexer) {
    return compose(
        P.map(e => e[1].isJust() ? AST.qualifiedIdentifier(e[0])(e[1].withDefault()[1]) : AST.identifier(e[0])),
        P.and([
            P.symbol(Lexer.TokenEnum.IDENTIFIER),
            P.option(
                P.and([
                    P.symbol(Lexer.TokenEnum.PERIOD),
                    P.symbol(Lexer.TokenEnum.IDENTIFIER)
                ]))
        ]))(lexer);
}


function parseLambda(lexer) {
    return compose(
        P.map(items => AST.lambda(items[0])(items[2])),
        P.and([
            P.many1(
                compose(
                    P.map(elements => elements[1]),
                    P.and([
                        P.symbol(Lexer.TokenEnum.LAMBDA),
                        P.symbol(Lexer.TokenEnum.IDENTIFIER)
                    ]))),
            P.symbol(Lexer.TokenEnum.MINUS_GREATER),
            parseEXPR1
        ]))(lexer);
}


function parseParenthesisExpression(lexer) {
    return compose(
        P.map(elements => elements[1]),
        P.and([
            P.symbol(Lexer.TokenEnum.LEFT_PAREN),
            parseEXPR1,
            P.symbol(Lexer.TokenEnum.RIGHT_PAREN)
        ]))(lexer);
}


function parsePrefixOperator(lexer) {
    return compose(
        P.map(e => AST.infixOperator(e[1])),
        P.and([
            P.symbol(Lexer.TokenEnum.LEFT_PAREN),
            P.or([
                P.symbol(Lexer.TokenEnum.BAR_BAR),
                P.symbol(Lexer.TokenEnum.AMPERSAND_AMPERSAND),
                P.symbol(Lexer.TokenEnum.EQUAL_EQUAL),
                P.symbol(Lexer.TokenEnum.BANG_EQUAL),
                P.symbol(Lexer.TokenEnum.LESS),
                P.symbol(Lexer.TokenEnum.LESS_EQUAL),
                P.symbol(Lexer.TokenEnum.GREATER),
                P.symbol(Lexer.TokenEnum.GREATER_EQUAL),
                P.symbol(Lexer.TokenEnum.PLUS_PLUS),
                P.symbol(Lexer.TokenEnum.PLUS),
                P.symbol(Lexer.TokenEnum.MINUS),
                P.symbol(Lexer.TokenEnum.STAR),
                P.symbol(Lexer.TokenEnum.SLASH)
            ]),
            P.symbol(Lexer.TokenEnum.RIGHT_PAREN)
        ]))(lexer);
}


function parseConstantUnit(lexer) {
    return compose(
        P.map(e => AST.constantUnit),
        P.and([
            P.symbol(Lexer.TokenEnum.LEFT_PAREN),
            P.symbol(Lexer.TokenEnum.RIGHT_PAREN)
        ]))(lexer);
}


function parseExpressionString(input) {
    const parseResult = compose(
        P.map(elements => elements[0]),
        P.and([parseEXPR1, P.symbol(Lexer.TokenEnum.EOF)]))(Lexer.fromString(input)("stream"));

    return Result.map(_ => Tuple.first(_))(parseResult);
}


module.exports = {
    parseDECLMap,
    parseDECLAssumptionMap,
    convertString,
    parseConstantUnit,
    parseExpressionString
};