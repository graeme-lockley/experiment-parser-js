"use strict";

const Array = require('../core/Array');
const Maybe = require('../core/Maybe');
const Record = require('../core/Record');
const RegularExpression = require('../core/RegularExpression');
const String = require('../core/String');
const Tuple = require('../core/Tuple');


const TokenEnum = {
    UNKNOWN: 0,
    EOF: 1,

    IDENTIFIER: 2,

    CONSTANT_INTEGER: 3,
    CONSTANT_STRING: 4,
    CONSTANT_CHAR: 5,
    CONSTANT_URL: 6,

    AMPERSAND_AMPERSAND: 7,
    BANG: 8,
    BANG_EQUAL: 9,
    BAR_BAR: 10,
    EQUAL: 11,
    EQUAL_EQUAL: 12,
    GREATER: 13,
    GREATER_EQUAL: 14,
    LAMBDA: 15,
    LEFT_CURLY: 16,
    LESS: 17,
    LESS_EQUAL: 18,
    LEFT_PAREN: 19,
    MINUS: 20,
    MINUS_GREATER: 21,
    PERIOD: 22,
    PLUS: 23,
    PLUS_PLUS: 24,
    RIGHT_CURLY: 25,
    RIGHT_PAREN: 26,
    SEMICOLON: 27,
    SLASH: 28,
    STAR: 29,

    AS: 30,
    ASSUMPTIONS: 31,
    ELSE: 32,
    FALSE: 33,
    IF: 34,
    IMPORT: 35,
    O: 36,
    THEN: 37,
    TRUE: 38
};


const reservedIdentifiers = {
    'as': TokenEnum.AS,
    'assumptions': TokenEnum.ASSUMPTIONS,
    'else': TokenEnum.ELSE,
    'false': TokenEnum.FALSE,
    'if': TokenEnum.IF,
    'import': TokenEnum.IMPORT,
    'o': TokenEnum.O,
    'then': TokenEnum.THEN,
    'true': TokenEnum.TRUE
};


const tokenPatterns = [
    Tuple.Tuple (/[0-9]+/iy) (text => TokenEnum.CONSTANT_INTEGER),
    Tuple.Tuple (/file:(\\.|[^\s])+/iy) (text => TokenEnum.CONSTANT_URL),
    Tuple.Tuple (/[A-Za-z_][A-Za-z0-9_']*/iy) (text => {
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



function newLexerRecord(input) {
    return id => x => y => index => indexX => indexY => indexXY => text => Record.mk9
    ("input")(input)
    ("_id")(id)
    ("_x")(x)
    ("_y")(y)
    ("index")(index)
    ("indexX")(indexX)
    ("indexY")(indexY)
    ("_indexXY")(indexXY)
    ("_text")(text);
}


function next(lexer) {
    if (lexer._id == TokenEnum.EOF) {
        return lexer;
    } else {
        const newLexer = Maybe.withDefault (lexer) (Maybe.map(whitespace => advanceLexer (lexer) (TokenEnum.UNKNOWN) (whitespace)) (RegularExpression.matchFromIndex(whiteSpaceRegEx)(lexer.index)(lexer.input.content)));

        if (isEndOfFile(newLexer)) {
            return advanceLexer(lexer)(TokenEnum.EOF)("");
        } else {
            return Maybe.withDefault () (Array.findMap (pattern => {
                    const patternRegEx = Tuple.first (pattern);
                    const searchResult = RegularExpression.matchFromIndex (patternRegEx) (newLexer.index) (newLexer.input.content);

                    return Maybe.map(text => advanceLexer (newLexer) (Tuple.second (pattern)(text)) (text)) (searchResult);
                }) (tokenPatterns));
        }
    }
}


function isEndOfFile(lexer) {
    return lexer.index >= lexer.input.length;
}


function advanceLexer(lexer) {
    return id => text => {
        const _x = lexer.indexX;
        const _y = lexer.indexY;
        const _indexXY = lexer.index;

        const cursor = String.foldl
                            (cursor => c => (c == 10) ? Record.set3("indexX")(1)("indexY")(cursor.indexY + 1)("index")(cursor.index + 1)(cursor) : Record.set2("indexX")(cursor.indexX + 1)("index")(cursor.index + 1)(cursor))
                            (Record.mk3("indexX")(_x)("indexY")(_y)("index")(_indexXY))
                            (text);

        return newLexerRecord(lexer.input)(id)(_x)(_y)(cursor.index)(cursor.indexX)(cursor.indexY)(_indexXY)(text);
    };
}


module.exports = {
    next,
    TokenEnum,
    reservedIdentifiers,
    whiteSpaceRegEx
};