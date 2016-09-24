"use strict";

const Tuple = require('./core/Tuple');

const TokenEnum = {
    EOF: 1,
    IDENTIFIER: 2,
    CONSTANT_INTEGER: 3,
    LPAREN: 4,
    RPAREN: 5,
    LAMBDA: 6,
    EQUAL: 7
};

const reservedCharacters = [
    Tuple.Tuple('\\'.charCodeAt(0), TokenEnum.LAMBDA),
    Tuple.Tuple('('.charCodeAt(0), TokenEnum.LPAREN),
    Tuple.Tuple(')'.charCodeAt(0), TokenEnum.RPAREN),
    Tuple.Tuple('='.charCodeAt(0), TokenEnum.EQUAL)
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


function makeContext(context, token) {
    return {
        input: context.input,
        next: context.next,
        token: token
    };
}

function createCursorFromContext(context) {
    return {
        index: context.token.index,
        indexX: context.token.indexX,
        indexY: context.token.indexY,

        indexXY: context.token.index,
        x: context.token.indexX,
        y: context.token.indexY,

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
        toToken: function (id) {
            return {
                id: id,
                x: this.x,
                y: this.y,
                index: this.index,
                indexX: this.indexX,
                indexY: this.indexY,
                text: this.content.substr(this.indexXY, this.index - this.indexXY)
            };
        }
    };
}


function next(context) {
    if (context.token.id == TokenEnum.EOF) {
        return context;
    } else {
        const cursor = createCursorFromContext(context);

        while (cursor.is(isWhitespace)) {
            cursor.advanceIndex();
        }

        if (cursor.isEndOfFile()) {
            return makeContext(context, cursor.toToken(TokenEnum.EOF));
        } else if (cursor.is(isReservedCharacter)) {
            cursor.markStartOfToken();
            const reservedCharacter = cursor.charCodeAtIndex();
            cursor.advanceIndex();
            return makeContext(context, cursor.toToken(findReservedCharacter(reservedCharacter).snd));
        } else if (cursor.is(isDigit)) {
            cursor.markStartOfToken();
            while (cursor.is(isDigit)) {
                cursor.advanceIndex();
            }
            return makeContext(context, cursor.toToken(TokenEnum.CONSTANT_INTEGER));
        } else {
            cursor.markStartOfToken();

            while (cursor.isNot(isWhitespace) && cursor.isNot(isReservedCharacter)) {
                cursor.advanceIndex();
            }

            return makeContext(context, cursor.toToken(TokenEnum.IDENTIFIER));
        }
    }
}


function initialContext(input) {
    return {
        input: {
            content: input,
            length: input.length
        },
        token: {
            index: 0,
            indexX: 1,
            indexY: 1,
            x: 1,
            y: 1
        },

        next: function () {
            return next(this);
        }
    }.next();
}

function fromString(input) {
    return initialContext(input);
}


module.exports = {
    fromString, TokenEnum
};