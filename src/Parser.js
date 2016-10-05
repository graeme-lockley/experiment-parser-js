"use strict";

const Result = require('./core/Result');
const Lexer = require('./Lexer');
const Tuple = require('./core/Tuple');
const AST = require('./AST');

const P = require('./core/ParserCombinators');


function compose(f1, f2) {
    return x => f1(f2(x));
}


function parseMODULE(lexer) {
    return P.and([
        P.many(parseIMPORT),
        P.many(parseDECL),
        P.option(parseEXPR1)
    ], e => new AST.Module(e[0], e[1], e[2]))(lexer);
}


function parseIMPORT(lexer) {
    return P.and([
        P.symbol(Lexer.TokenEnum.IMPORT),
        P.symbol(Lexer.TokenEnum.CONSTANT_URL),
        P.symbol(Lexer.TokenEnum.AS),
        P.symbol(Lexer.TokenEnum.IDENTIFIER),
        P.symbol(Lexer.TokenEnum.SEMICOLON)
    ], e => new AST.Import(new AST.ConstantURL(e[1]), new AST.Identifier(e[3])))(lexer);
}


function parseDECL(lexer) {
    return P.and([
        P.many1(parseIdentifier),
        P.symbol(Lexer.TokenEnum.EQUAL),
        parseEXPR1,
        P.symbol(Lexer.TokenEnum.SEMICOLON)
    ], elements =>
        elements[0].length == 1 ? new AST.Declaration(elements[0][0].name, elements[2]) : new AST.Declaration(elements[0][0].name, new AST.Lambda(elements[0].slice(1).map(n => n.name), elements[2])))(lexer);
}


function parseConstantInteger(lexer) {
    return P.mapError(
        P.symbol(Lexer.TokenEnum.CONSTANT_INTEGER, compose(c => new AST.ConstantInteger(c), parseInt))(lexer),
        "Expected a constant integer"
    );
}


function parseIdentifier(lexer) {
    return P.mapError(
        P.symbol(Lexer.TokenEnum.IDENTIFIER, i => new AST.Identifier(i))(lexer),
        "Expected an identifier"
    );
}


function parseLambda(lexer) {
    return P.and([
        P.many1(
            P.and([
                P.symbol(Lexer.TokenEnum.LAMBDA),
                P.symbol(Lexer.TokenEnum.IDENTIFIER)
            ], elements => elements[1])),
        P.symbol(Lexer.TokenEnum.MINUS_GREATER),
        parseEXPR1
    ], items => new AST.Lambda(items[0], items[2]))(lexer);
}


function parseParenthesisExpression(lexer) {
    return P.and([
        P.symbol(Lexer.TokenEnum.LEFT_PAREN),
        parseEXPR1,
        P.symbol(Lexer.TokenEnum.RIGHT_PAREN)
    ], elements => elements[1])(lexer);
}


function parseEXPR11(lexer) {
    return P.or([
        parseConstantInteger,
        parseIdentifier,
        parseLambda,
        parseParenthesisExpression
    ])(lexer);
}


function parseEXPR1(lexer) {
    return P.or([
        P.and([
            P.symbol(Lexer.TokenEnum.IF),
            parseEXPR1,
            P.symbol(Lexer.TokenEnum.THEN),
            parseEXPR1,
            P.symbol(Lexer.TokenEnum.ELSE),
            parseEXPR1
        ], e => new AST.If(e[1], e[3], e[5])),
        P.many1(parseEXPR2, elements => elements.length == 1 ? elements[0] : new AST.Apply(elements)),
        P.and([
            P.symbol(Lexer.TokenEnum.LEFT_CURLY),
            P.sepBy1(parseEXPR1, P.symbol(Lexer.TokenEnum.SEMICOLON), e => new AST.Expressions(e)),
            P.symbol(Lexer.TokenEnum.RIGHT_CURLY)
        ], e => e[1])
    ])(lexer);
}


function parseEXPR2(lexer) {
    return P.sepBy1(parseEXPR3, P.symbol(Lexer.TokenEnum.BAR_BAR), e => e.length == 1 ? e[0] : new AST.BooleanOr(e))(lexer);
}


function parseEXPR3(lexer) {
    return P.sepBy1(parseEXPR4, P.symbol(Lexer.TokenEnum.AMPERSAND_AMPERSAND), e => e.length == 1 ? e[0] : new AST.BooleanAnd(e))(lexer);
}


function parseEXPR4(lexer) {
    return P.chainl1(parseEXPR5, parseEqualOp)(lexer);
}


function parseEqualOp(lexer) {
    return P.or([
        P.symbol(Lexer.TokenEnum.EQUAL_EQUAL, () => (l, r) => new AST.Equal(l, r)),
        P.symbol(Lexer.TokenEnum.BANG_EQUAL, () => (l, r) => new AST.NotEqual(l, r))
    ])(lexer);
}


function parseEXPR5(lexer) {
    return P.chainl1(parseEXPR6, parseComparisonOp)(lexer);
}


function parseComparisonOp(lexer) {
    return P.or([
        P.symbol(Lexer.TokenEnum.LESS, () => (l, r) => new AST.LessThan(l, r)),
        P.symbol(Lexer.TokenEnum.LESS_EQUAL, () => (l, r) => new AST.LessThanEqual(l, r)),
        P.symbol(Lexer.TokenEnum.GREATER, () => (l, r) => new AST.GreaterThan(l, r)),
        P.symbol(Lexer.TokenEnum.GREATER_EQUAL, () => (l, r) => new AST.GreaterThanEqual(l, r)),
    ])(lexer);
}


function parseEXPR6(lexer) {
    return P.chainl1(parseEXPR7, P.symbol(Lexer.TokenEnum.PLUS_PLUS, () => (l, r) => new AST.StringConcat(l, r)))(lexer);
}


function parseEXPR7(lexer) {
    return P.chainl1(parseEXPR8, parseAdditiveOp)(lexer);
}


function parseAdditiveOp(lexer) {
    return P.or([
        P.symbol(Lexer.TokenEnum.PLUS, () => (l, r) => new AST.Addition(l, r)),
        P.symbol(Lexer.TokenEnum.MINUS, () => (l, r) => new AST.Subtraction(l, r))
    ])(lexer);
}


function parseEXPR8(lexer) {
    return P.chainl1(parseEXPR9, parseMultiplicativeOp)(lexer);
}


function parseMultiplicativeOp(lexer) {
    return P.or([
        P.symbol(Lexer.TokenEnum.STAR, () => (l, r) => new AST.Multiplication(l, r)),
        P.symbol(Lexer.TokenEnum.SLASH, () => (l, r) => new AST.Division(l, r))
    ])(lexer);
}


function parseEXPR9(lexer) {
    return P.or([
        P.and([
            parseUnaryOp,
            parseEXPR9
        ], e => e[0](e[1])),
        parseEXPR10
    ])(lexer);
}


function parseUnaryOp(lexer) {
    return P.or([
        P.symbol(Lexer.TokenEnum.BANG, () => (op) => new AST.BooleanNot(op)),
        P.symbol(Lexer.TokenEnum.PLUS, () => (op) => new AST.UnaryPlus(op)),
        P.symbol(Lexer.TokenEnum.MINUS, () => (op) => new AST.UnaryNegate(op))
    ])(lexer);
}


function parseEXPR10(lexer) {
    return P.chainl1(parseEXPR11, P.symbol(Lexer.TokenEnum.O, () => (l, r) => new AST.Composition(l, r)))(lexer);
}


function parseString(input) {
    const parseResult =
        P.and([parseMODULE, P.symbol(Lexer.TokenEnum.EOF)], (elements => elements[0]))(Lexer.fromString(input));

    return parseResult.map(
        ok => Result.Ok(ok.fst),
        error => parseResult
    );
}


module.exports = {
    parseString, parseEXPR11
};