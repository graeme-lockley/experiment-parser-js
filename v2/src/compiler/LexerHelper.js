"use strict";

const Record = require('../core/Record');
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


const symbols = [
    Tuple.Tuple('\\')(TokenEnum.LAMBDA),
    Tuple.Tuple('.')(TokenEnum.PERIOD),
    Tuple.Tuple('(')(TokenEnum.LEFT_PAREN),
    Tuple.Tuple(')')(TokenEnum.RIGHT_PAREN),
    Tuple.Tuple('{')(TokenEnum.LEFT_CURLY),
    Tuple.Tuple('}')(TokenEnum.RIGHT_CURLY),
    Tuple.Tuple('==')(TokenEnum.EQUAL_EQUAL),
    Tuple.Tuple('=')(TokenEnum.EQUAL),
    Tuple.Tuple(';')(TokenEnum.SEMICOLON),
    Tuple.Tuple('++')(TokenEnum.PLUS_PLUS),
    Tuple.Tuple('+')(TokenEnum.PLUS),
    Tuple.Tuple('->')(TokenEnum.MINUS_GREATER),
    Tuple.Tuple('-')(TokenEnum.MINUS),
    Tuple.Tuple('<=')(TokenEnum.LESS_EQUAL),
    Tuple.Tuple('<')(TokenEnum.LESS),
    Tuple.Tuple('>=')(TokenEnum.GREATER_EQUAL),
    Tuple.Tuple('>')(TokenEnum.GREATER),
    Tuple.Tuple('*')(TokenEnum.STAR),
    Tuple.Tuple('/')(TokenEnum.SLASH),
    Tuple.Tuple('!=')(TokenEnum.BANG_EQUAL),
    Tuple.Tuple('!')(TokenEnum.BANG),
    Tuple.Tuple('||')(TokenEnum.BAR_BAR),
    Tuple.Tuple('&&')(TokenEnum.AMPERSAND_AMPERSAND)
];


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

function isWhitespace(c) {
    return c <= 32;
}

function isEndOfLine(c) {
    return c == 10;
}

function isDigit(c) {
    return c >= 48 && c <= 57;
}

function isIdentifierStart(c) {
    return c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0) ||
        c >= 'A'.charCodeAt(0) && c <= 'Z'.charCodeAt(0) ||
        c == '_'.charCodeAt(0);
}

function isIdentifierRest(c) {
    return c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0) ||
        c >= 'A'.charCodeAt(0) && c <= 'Z'.charCodeAt(0) ||
        c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0) ||
        c == '_'.charCodeAt(0) || c == '\''.charCodeAt(0);
}

function createACursor(context) {
    return {
        index: context.index,
        indexX: context.indexX,
        indexY: context.indexY,

        _indexXY: context.index,
        x: context.indexX,
        y: context.indexY,

        content: context.input.content,
        length: context.input.length,

        charCodeAtIndex: function () {
            return this.content.charCodeAt(this.index);
        },

        is: function (predicate) {
            return this.isNotEndOfFile() && predicate(this.charCodeAtIndex());
        },
        isNot: function (predicate) {
            return this.isNotEndOfFile() && !predicate(this.charCodeAtIndex());
        },
        isChar: function (c) {
            return this.isNotEndOfFile() && this.charCodeAtIndex() == c.charCodeAt(0);
        },
        isNotChar: function (c) {
            return this.isNotEndOfFile() && this.charCodeAtIndex() != c.charCodeAt(0);
        },
        isEndOfFile: function () {
            return this.index >= this.length;
        },
        isNotEndOfFile: function () {
            return !this.isEndOfFile();
        },
        advanceIndex: function () {
            if (this.isNotEndOfFile()) {
                if (this.is(isEndOfLine)) {
                    this.indexX = 1;
                    this.indexY += 1;
                } else {
                    this.indexX += 1;
                }
                this.index += 1;
            }
        },
        markStartOfToken: function () {
            this._indexXY = this.index;
            this.x = this.indexX;
            this.y = this.indexY;
        },
        text: function () {
            return this.content.substr(this._indexXY, this.index - this._indexXY);
        },
        clone: function () {
            var temp = this.constructor();
            for (var key in this) {
                if (this.hasOwnProperty(key)) {
                    temp[key] = this[key];
                }
            }

            return temp;
        }
    };
}


class Context {
    constructor(input, id, x, y, index, indexX, indexY, indexXY, text) {
        this.input = input;
        this._id = id;
        this._x = x;
        this._y = y;
        this.index = index;
        this.indexX = indexX;
        this.indexY = indexY;
        this._indexXY = indexXY;
        this._text = text;
    }

    createCursor() {
        return createACursor(this);
    }

    next() {
        if (this._id == TokenEnum.EOF) {
            return this;
        } else {
            const cursor = this.createCursor();

            while (cursor.is(isWhitespace)) {
                cursor.advanceIndex();
            }

            if (cursor.isEndOfFile()) {
                return this.newContext(TokenEnum.EOF, cursor);
            } else if (cursor.is(isDigit)) {
                cursor.markStartOfToken();
                while (cursor.is(isDigit)) {
                    cursor.advanceIndex();
                }
                return this.newContext(TokenEnum.CONSTANT_INTEGER, cursor);
            } else if (cursor.is(isIdentifierStart)) {
                cursor.markStartOfToken();

                while (cursor.is(isIdentifierRest)) {
                    cursor.advanceIndex();
                }

                if (cursor.text() == "file" && cursor.isChar(':')) {
                    cursor.advanceIndex();
                    while (cursor.isNot(isWhitespace)) {
                        if (cursor.isChar('\\')) {
                            cursor.advanceIndex();
                        }
                        cursor.advanceIndex();
                    }
                    return this.newContext(TokenEnum.CONSTANT_URL, cursor);
                } else {
                    const reserved = reservedIdentifiers[cursor.text()];

                    return reserved
                        ? this.newContext(reserved, cursor)
                        : this.newContext(TokenEnum.IDENTIFIER, cursor);
                }
            } else if (cursor.isChar("'")) {
                cursor.markStartOfToken();
                cursor.advanceIndex();
                if (cursor.isChar('\\')) {
                    cursor.advanceIndex();
                    cursor.advanceIndex();
                    if (cursor.isChar("'")) {
                        cursor.advanceIndex();
                        return this.newContext(TokenEnum.CONSTANT_CHAR, cursor);
                    } else {
                        return this.newContext(TokenEnum.UNKNOWN, cursor);
                    }
                } else {
                    cursor.advanceIndex();
                    if (cursor.isChar("'")) {
                        cursor.advanceIndex();
                        return this.newContext(TokenEnum.CONSTANT_CHAR, cursor);
                    } else {
                        return this.newContext(TokenEnum.UNKNOWN, cursor);
                    }
                }
            } else if (cursor.isChar('"')) {
                cursor.markStartOfToken();
                cursor.advanceIndex();
                while (cursor.isNotChar('"')) {
                    if (cursor.isChar('\\')) {
                        cursor.advanceIndex();
                    }
                    cursor.advanceIndex();
                }
                if (cursor.isEndOfFile()) {
                    return this.newContext(TokenEnum.UNKNOWN, cursor);
                } else {
                    cursor.advanceIndex();
                    return this.newContext(TokenEnum.CONSTANT_STRING, cursor);
                }
            } else {
                for (let index = 0; index < symbols.length; index += 1) {
                    const symbol = symbols[index];

                    if (Tuple.first(symbol).charCodeAt(0) == cursor.charCodeAtIndex()) {
                        if (Tuple.first(symbol).length == 1) {
                            cursor.markStartOfToken();
                            cursor.advanceIndex();

                            return this.newContext(Tuple.second(symbol), cursor);
                        } else {
                            const tmpCursor = cursor.clone();
                            let matched = true;

                            tmpCursor.markStartOfToken();
                            tmpCursor.advanceIndex();
                            for (let tmpCursorIndex = 1; tmpCursorIndex < Tuple.first(symbol).length; tmpCursorIndex += 1) {
                                matched = matched && Tuple.first(symbol).charCodeAt(tmpCursorIndex) == tmpCursor.charCodeAtIndex();
                                tmpCursor.advanceIndex();
                            }

                            if (matched) {
                                return this.newContext(Tuple.second(symbol), tmpCursor);
                            }
                        }
                    }
                }

                cursor.markStartOfToken();
                cursor.advanceIndex();

                return this.newContext(TokenEnum.UNKNOWN, cursor);
            }
        }
    }

    newContext(id, cursor) {
        return new Context(this.input, id, cursor.x, cursor.y, cursor.index, cursor.indexX, cursor.indexY, cursor._indexXY, cursor.text());
    }
}

function initialContext(input) {
    return sourceName => {
        const lexerInput = {
            content: input,
            length: input.length,
            sourceName: sourceName
        };
        return new Context(lexerInput, 0, 1, 1, 0, 1, 1, '').next();
    }
}

module.exports = {
    initialContext,
    TokenEnum
};