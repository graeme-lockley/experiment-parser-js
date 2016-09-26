"use strict";

const Tuple = require('./core/Tuple');

const TokenEnum = {
    EOF: 1,
    IDENTIFIER: 2,
    CONSTANT_INTEGER: 3,
    LPAREN: 4,
    RPAREN: 5,
    LAMBDA: 6,
    EQUAL: 7,
    SEMICOLON: 8
};

const reservedCharacters = [
    Tuple.Tuple('\\'.charCodeAt(0), TokenEnum.LAMBDA),
    Tuple.Tuple('('.charCodeAt(0), TokenEnum.LPAREN),
    Tuple.Tuple(')'.charCodeAt(0), TokenEnum.RPAREN),
    Tuple.Tuple('='.charCodeAt(0), TokenEnum.EQUAL),
    Tuple.Tuple(';'.charCodeAt(0), TokenEnum.SEMICOLON)
];


function isWhitespace(c) {
    return c <= 32;
}

function isEndOfLine(c) {
    return c == 13;
}

function isDigit(c) {
    return c >= 48 && c <= 57;
}

function findReservedCharacter(c) {
    return reservedCharacters.find(tuple => tuple.fst == c);
}

function isReservedCharacter(c) {
    return findReservedCharacter(c);
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
            } else if (cursor.is(isReservedCharacter)) {
                cursor.markStartOfToken();
                const reservedCharacter = cursor.charCodeAtIndex();
                cursor.advanceIndex();
                return this.newContext(findReservedCharacter(reservedCharacter).snd, cursor);
            } else if (cursor.is(isDigit)) {
                cursor.markStartOfToken();
                while (cursor.is(isDigit)) {
                    cursor.advanceIndex();
                }
                return this.newContext(TokenEnum.CONSTANT_INTEGER, cursor);
            } else {
                cursor.markStartOfToken();

                while (cursor.isNot(isWhitespace) && cursor.isNot(isReservedCharacter)) {
                    cursor.advanceIndex();
                }

                return this.newContext(TokenEnum.IDENTIFIER, cursor);
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