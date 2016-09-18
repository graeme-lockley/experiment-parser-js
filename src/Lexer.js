"use strict";

var TokenEnum = {
    EOF: 1,
    IDENTIFIER: 2,
    CONSTANT_INTEGER: 3
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


function mkContext(context, token) {
    return {
        input: context.input,
        next: context.next,
        token: token
    };
}

function next(context) {
    if (context.token.id == TokenEnum.EOF) {
        return context;
    } else {
        var cursor = {
            index: context.token.index,
            indexX: context.token.indexX,
            indexY: context.token.indexY,

            indexXY: context.token.index,
            x: context.token.indexX,
            y: context.token.indexY,

            content: context.input.content,
            length: context.input.lineLength,

            charCodeAtIndex: function() {
                return this.content.charCodeAt(this.index);
            },

            is: function(predicate) {
                return this.isNotEndOfFile() && predicate(this.charCodeAtIndex());
            },
            isNot: function(predicate) {
                return this.isNotEndOfFile() && !predicate(this.charCodeAtIndex());
            },
            isEndOfFile: function() {
                return this.index >= this.length;
            },
            isNotEndOfFile: function() {
                return !this.isEndOfFile();
            },
            advanceIndex: function() {
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
            setXY: function() {
                this.indexXY = this.index;
                this.x = this.indexX;
                this.y = this.indexY;
            },
            toToken: function(id) {
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

        while (cursor.is(isWhitespace)) {
            cursor.advanceIndex();
        }

        if (cursor.isEndOfFile()) {
            return mkContext(context, cursor.toToken(TokenEnum.EOF));
        } else {
            if (cursor.is(isDigit)) {
                cursor.setXY();
                while(cursor.is(isDigit)) {
                    cursor.advanceIndex();
                }
                return mkContext(context, cursor.toToken(TokenEnum.CONSTANT_INTEGER));
            } else {
                cursor.setXY();

                while(cursor.isNot(isWhitespace)) {
                    cursor.advanceIndex();
                }

                return mkContext(context, cursor.toToken(TokenEnum.IDENTIFIER));
            }
        }
    }
}


function initialContext(input) {
    return {
        input: {
            content: input,
            lineLength: input.length
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

var fromString = function (input) {
    return initialContext(input);
};


module.exports = {
    fromString, TokenEnum
};