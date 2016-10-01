"use strict";

const Tuple = require('./core/Tuple');

const TokenEnum = {
    UNKNOWN: 0,
    EOF: 1,

    IDENTIFIER: 2,

    CONSTANT_INTEGER: 3,
    CONSTANT_STRING: 4,
    CONSTANT_CHAR: 5,
    CONSTANT_URL: 6,

    BANG: 7,
    EQUAL: 8,
    EQUALEQUAL: 9,
    GREATER: 10,
    GREATEREQUAL: 11,
    LAMBDA: 12,
    LCURLEY: 13,
    LESS: 14,
    LESSEQUAL: 15,
    LPAREN: 16,
    MINUS: 17,
    MINUSGREATER: 18,
    PLUS: 19,
    PLUSPLUS: 20,
    RCURLEY: 21,
    RPAREN: 22,
    SEMICOLON: 23,
    SLASH: 24,
    STAR: 25,

    AS: 26,
    ELSE: 27,
    FALSE: 28,
    IF: 29,
    IMPORT: 30,
    O: 31,
    THEN: 32,
    TRUE: 33
};

const symbols = [
    Tuple.Tuple('\\', TokenEnum.LAMBDA),
    Tuple.Tuple('(', TokenEnum.LPAREN),
    Tuple.Tuple(')', TokenEnum.RPAREN),
    Tuple.Tuple('{', TokenEnum.LCURLEY),
    Tuple.Tuple('}', TokenEnum.RCURLEY),
    Tuple.Tuple('==', TokenEnum.EQUALEQUAL),
    Tuple.Tuple('=', TokenEnum.EQUAL),
    Tuple.Tuple(';', TokenEnum.SEMICOLON),
    Tuple.Tuple('++', TokenEnum.PLUSPLUS),
    Tuple.Tuple('+', TokenEnum.PLUS),
    Tuple.Tuple('->', TokenEnum.MINUSGREATER),
    Tuple.Tuple('-', TokenEnum.MINUS),
    Tuple.Tuple('<=', TokenEnum.LESSEQUAL),
    Tuple.Tuple('<', TokenEnum.LESS),
    Tuple.Tuple('>=', TokenEnum.GREATEREQUAL),
    Tuple.Tuple('>', TokenEnum.GREATER),
    Tuple.Tuple('*', TokenEnum.STAR),
    Tuple.Tuple('/', TokenEnum.SLASH),
    Tuple.Tuple('!', TokenEnum.BANG)
];

const reservedIdentifiers = {
    'as': TokenEnum.AS,
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
    return c == 13;
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

class Context {
    constructor(input, id, x, y, index, indexX, indexY, text) {
        this.input = input;
        this._id = id;
        this._x = x;
        this._y = y;
        this.index = index;
        this.indexX = indexX;
        this.indexY = indexY;
        this._text = text;
    }

    createCursor() {
        return {
            index: this.index,
            indexX: this.indexX,
            indexY: this.indexY,

            indexXY: this.index,
            x: this.indexX,
            y: this.indexY,

            content: this.input.content,
            length: this.input.length,

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
                this.indexXY = this.index;
                this.x = this.indexX;
                this.y = this.indexY;
            },
            text: function () {
                return this.content.substr(this.indexXY, this.index - this.indexXY);
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

    next() {
        if (this.id == TokenEnum.EOF) {
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

                    if (symbol.fst.charCodeAt(0) == cursor.charCodeAtIndex()) {
                        if (symbol.fst.length == 1) {
                            cursor.markStartOfToken();
                            cursor.advanceIndex();

                            return this.newContext(symbol.snd, cursor);
                        } else {
                            const tmpCursor = cursor.clone();
                            let matched = true;

                            tmpCursor.markStartOfToken();
                            tmpCursor.advanceIndex();
                            for (let tmpCursorIndex = 1; tmpCursorIndex < symbol.fst.length; tmpCursorIndex += 1) {
                                matched = matched && symbol.fst.charCodeAt(tmpCursorIndex) == tmpCursor.charCodeAtIndex();
                                tmpCursor.advanceIndex();
                            }

                            if (matched) {
                                return this.newContext(symbol.snd, tmpCursor);
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

    get id() {
        return this._id;
    }

    get text() {
        return this._text;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    newContext(id, cursor) {
        return new Context(this.input, id, cursor.x, cursor.y, cursor.index, cursor.indexX, cursor.indexY, cursor.text());
    }
}

function initialContext(input) {
    const lexerInput = {
        content: input,
        length: input.length
    };
    return new Context(lexerInput, 0, 1, 1, 0, 1, 1, '').next();
}

function fromString(input) {
    return initialContext(input);
}


module.exports = {
    fromString, TokenEnum
};