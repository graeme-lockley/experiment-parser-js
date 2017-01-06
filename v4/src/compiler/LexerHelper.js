"use strict";

const Maybe = require('../core/Maybe');
const RegularExpression = require('../core/RegularExpression');
const Tuple = require('../core/Tuple');


const TokenEnum = {
    UNKNOWN: 0,
    EOF: 1,

    IDENTIFIER: 2,
    UPPER_IDENTIFIER: 3,

    CONSTANT_INTEGER: 4,
    CONSTANT_STRING: 5,
    CONSTANT_CHAR: 6,
    CONSTANT_URL: 7,

    AMPERSAND_AMPERSAND: 8,
    BANG: 9,
    BANG_EQUAL: 10,
    BAR_BAR: 11,
    EQUAL: 12,
    EQUAL_EQUAL: 13,
    GREATER: 14,
    GREATER_EQUAL: 15,
    LAMBDA: 16,
    LEFT_CURLY: 17,
    LESS: 18,
    LESS_EQUAL: 19,
    LEFT_PAREN: 20,
    MINUS: 21,
    MINUS_GREATER: 22,
    PERIOD: 23,
    PLUS: 24,
    PLUS_PLUS: 25,
    RIGHT_CURLY: 26,
    RIGHT_PAREN: 27,
    SEMICOLON: 28,
    SLASH: 29,
    STAR: 30,

    AS: 31,
    ASSUMPTIONS: 32,
    ELSE: 33,
    FALSE: 34,
    IF: 35,
    IN: 36,
    IMPORT: 37,
    LET: 38,
    O: 39,
    THEN: 40,
    TRUE: 41,
    WHERE: 42
};


const reservedIdentifiers = {
    'as': TokenEnum.AS,
    'assumptions': TokenEnum.ASSUMPTIONS,
    'else': TokenEnum.ELSE,
    'false': TokenEnum.FALSE,
    'if': TokenEnum.IF,
    'in': TokenEnum.IN,
    'import': TokenEnum.IMPORT,
    'let': TokenEnum.LET,
    'o': TokenEnum.O,
    'then': TokenEnum.THEN,
    'true': TokenEnum.TRUE,
    'where': TokenEnum.WHERE
};


const tokenPatterns = [
    Tuple.Tuple (/[0-9]+/iy) (text => TokenEnum.CONSTANT_INTEGER),
    Tuple.Tuple (/file:(\\.|[^\s])+/iy) (text => TokenEnum.CONSTANT_URL),
    Tuple.Tuple (/[A-Z][A-Za-z0-9_']*/y) (text => TokenEnum.UPPER_IDENTIFIER),
    Tuple.Tuple (/[a-z_][A-Za-z0-9_']*/y) (text => {
        const reserved = reservedIdentifiers[text];

        return reserved
            ? reserved
            : TokenEnum.IDENTIFIER;
    }),
    Tuple.Tuple (/'(\\.|.)'/iy) (text => TokenEnum.CONSTANT_CHAR),
    Tuple.Tuple (/"(\\.|[^"\\])*"/iy) (text => TokenEnum.CONSTANT_STRING),
    Tuple.Tuple (/\\/iy) (text => TokenEnum.LAMBDA),
    Tuple.Tuple (/\./iy) (text => TokenEnum.PERIOD),
    Tuple.Tuple (/\(/iy) (text => TokenEnum.LEFT_PAREN),
    Tuple.Tuple (/\)/iy) (text => TokenEnum.RIGHT_PAREN),
    Tuple.Tuple (/\{/iy) (text => TokenEnum.LEFT_CURLY),
    Tuple.Tuple (/\}/iy) (text => TokenEnum.RIGHT_CURLY),
    Tuple.Tuple (/==/iy) (text => TokenEnum.EQUAL_EQUAL),
    Tuple.Tuple (/=/iy) (text => TokenEnum.EQUAL),
    Tuple.Tuple (/;/iy) (text => TokenEnum.SEMICOLON),
    Tuple.Tuple (/\+\+/iy) (text => TokenEnum.PLUS_PLUS),
    Tuple.Tuple (/\+/iy) (text => TokenEnum.PLUS),
    Tuple.Tuple (/->/iy) (text => TokenEnum.MINUS_GREATER),
    Tuple.Tuple (/-/iy) (text => TokenEnum.MINUS),
    Tuple.Tuple (/<=/iy) (text => TokenEnum.LESS_EQUAL),
    Tuple.Tuple (/</iy) (text => TokenEnum.LESS),
    Tuple.Tuple (/>=/iy) (text => TokenEnum.GREATER_EQUAL),
    Tuple.Tuple (/>/iy) (text => TokenEnum.GREATER),
    Tuple.Tuple (/\*/iy) (text => TokenEnum.STAR),
    Tuple.Tuple (/\//iy) (text => TokenEnum.SLASH),
    Tuple.Tuple (/!=/iy) (text => TokenEnum.BANG_EQUAL),
    Tuple.Tuple (/!/iy) (text => TokenEnum.BANG),
    Tuple.Tuple (/\|\|/iy) (text => TokenEnum.BAR_BAR),
    Tuple.Tuple (/&&/iy) (text => TokenEnum.AMPERSAND_AMPERSAND),
    Tuple.Tuple (/./iy) (text => TokenEnum.UNKNOWN)
];


const whiteSpaceRegEx = compileRegExp("\\s*");


function compileRegExp(regExp) {
    return Maybe.withDefault () (RegularExpression.compileWithOptions(regExp)("iy"))
}


module.exports = {
    TokenEnum,
    tokenPatterns,
    reservedIdentifiers,
    whiteSpaceRegEx
};