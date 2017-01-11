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
    BAR:11,
    BAR_BAR: 12,
    COLON: 13,
    EQUAL: 14,
    EQUAL_EQUAL: 15,
    GREATER: 16,
    GREATER_EQUAL: 17,
    LAMBDA: 18,
    LEFT_CURLY: 19,
    LESS: 20,
    LESS_EQUAL: 21,
    LEFT_PAREN: 22,
    MINUS: 23,
    MINUS_GREATER: 24,
    PERIOD: 25,
    PLUS: 26,
    PLUS_PLUS: 27,
    RIGHT_CURLY: 28,
    RIGHT_PAREN: 29,
    SEMICOLON: 30,
    SLASH: 31,
    STAR: 32,

    ALIAS: 33,
    AS: 34,
    ASSUMPTIONS: 35,
    CASE: 36,
    ELSE: 37,
    FALSE: 38,
    IF: 39,
    IN: 40,
    IMPORT: 41,
    LET: 42,
    O: 43,
    OF: 44,
    THEN: 45,
    TRUE: 46,
    TYPE: 47,
    WHERE: 48
};


const reservedIdentifiers = {
    'alias': TokenEnum.ALIAS,
    'as': TokenEnum.AS,
    'assumptions': TokenEnum.ASSUMPTIONS,
    'case': TokenEnum.CASE,
    'else': TokenEnum.ELSE,
    'false': TokenEnum.FALSE,
    'if': TokenEnum.IF,
    'in': TokenEnum.IN,
    'import': TokenEnum.IMPORT,
    'let': TokenEnum.LET,
    'o': TokenEnum.O,
    'of': TokenEnum.OF,
    'then': TokenEnum.THEN,
    'true': TokenEnum.TRUE,
    'type': TokenEnum.TYPE,
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
    Tuple.Tuple (/:/iy) (text => TokenEnum.COLON),
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
    Tuple.Tuple (/\|/iy) (text => TokenEnum.BAR),
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