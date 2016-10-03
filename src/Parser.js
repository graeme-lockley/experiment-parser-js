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
    ], e => AST.newModule(e[0], e[1], e[2]))(lexer);
}


function parseIMPORT(lexer) {
    return P.and([
        P.symbol(Lexer.TokenEnum.IMPORT),
        P.symbol(Lexer.TokenEnum.CONSTANT_URL),
        P.symbol(Lexer.TokenEnum.AS),
        P.symbol(Lexer.TokenEnum.IDENTIFIER),
        P.symbol(Lexer.TokenEnum.SEMICOLON)
    ], e => AST.newImport(AST.newConstantURL(e[1]), AST.newIdentifier(e[3])))(lexer);
}


function parseDECL(lexer) {
    return P.and([
        P.many1(parseIdentifier),
        P.symbol(Lexer.TokenEnum.EQUAL),
        parseEXPR1,
        P.symbol(Lexer.TokenEnum.SEMICOLON)
    ], elements =>
        elements[0].length == 1 ? AST.newDeclaration(elements[0][0].name, elements[2]) : AST.newDeclaration(elements[0][0].name, AST.newLambda(elements[0].slice(1).map(n => n.name), elements[2])))(lexer);
}


function parseConstantInteger(lexer) {
    return P.mapError(
        P.symbol(Lexer.TokenEnum.CONSTANT_INTEGER, compose(AST.newConstantInteger, parseInt))(lexer),
        "Expected a constant integer"
    );
}


function parseIdentifier(lexer) {
    return P.mapError(
        P.symbol(Lexer.TokenEnum.IDENTIFIER, AST.newIdentifier)(lexer),
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
        P.symbol(Lexer.TokenEnum.MINUSGREATER),
        parseEXPR1
    ], items => AST.newLambda(items[0], items[2]))(lexer);
}


function parseParenthesisExpression(lexer) {
    return P.and([
        P.symbol(Lexer.TokenEnum.LPAREN),
        parseEXPR1,
        P.symbol(Lexer.TokenEnum.RPAREN)
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
        ], e => AST.newIf(e[1], e[3], e[5])),
        P.many1(parseEXPR2, elements => elements.length == 1 ? elements[0] : AST.newApply(elements)),
        P.and([
            P.symbol(Lexer.TokenEnum.LCURLEY),
            P.sepBy1(parseEXPR1, P.symbol(Lexer.TokenEnum.SEMICOLON), e => AST.newExpressions(e)),
            P.symbol(Lexer.TokenEnum.RCURLEY)
        ], e => e[1])
    ])(lexer);
}


function parseEXPR2(lexer) {
    return P.sepBy1(parseEXPR11, P.symbol(Lexer.TokenEnum.BAR_BAR), e => e.length == 1 ? e[0] : new AST.BooleanOr(e))(lexer);
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