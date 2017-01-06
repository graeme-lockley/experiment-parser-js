"use strict";

const Tuple = require('../../src/core/Tuple');
const Lexer = require('../../src/compiler/Lexer');
const expect = require('chai').expect;

describe('Lexer', () => {
    describe('with input "hello 123"', () => {
        const context = Lexer.fromString('hello 123')("stream");

        describe('after initialisation', () => {
            it('should match to an IDENTIFIER', () => expect(Lexer.id(context)).to.equal(Lexer.TokenEnum.IDENTIFIER));
            it('should have the coordinates (1, 1)', () => {
                expect(Lexer.x(context)).to.equal(1);
                expect(Lexer.y(context)).to.equal(1);
            });
            it('should have the text "Hello"', () => expect(Lexer.text(context)).to.equal('hello'));
        });

        describe('next token', () => {
            const nextContext = Lexer.next(context);

            it('should match to a CONSTANT_INTEGER', () => expect(Lexer.id(nextContext)).to.equal(Lexer.TokenEnum.CONSTANT_INTEGER));
            it('should have the coordinates (7, 1)', ()=> {
                expect(Lexer.x(nextContext)).to.equal(7);
                expect(Lexer.y(nextContext)).to.equal(1);
            });
            it('should have the text "123"', () => expect(Lexer.text(nextContext)).to.equal("123"));
        });

        describe('next next token', () => {
            const nextNextContext = Lexer.next(Lexer.next(context));

            it('should report end-of-file', () => expect(Lexer.id(nextNextContext)).to.equal(Lexer.TokenEnum.EOF));
            it('should have the coordinates (10, 1)', ()=> {
                expect(Lexer.x(nextNextContext)).to.equal(10);
                expect(Lexer.y(nextNextContext)).to.equal(1);
            });
            it('should have the text ""', () => expect(Lexer.text(nextNextContext)).to.equal(""));
        });

        describe('next next next token', () => {
            const nextNextContext = Lexer.next(Lexer.next(Lexer.next(context)));

            it('should still report end-of-file', () => expect(Lexer.id(nextNextContext)).to.equal(Lexer.TokenEnum.EOF));
            it('should have the coordinates (10, 1)', () => {
                expect(Lexer.x(nextNextContext)).to.equal(10);
                expect(Lexer.y(nextNextContext)).to.equal(1);
            });
            it('should have the text ""', () => expect(Lexer.text(nextNextContext)).to.equal(""));
        });
    });

    describe('with input "a\\ b) c("', () => {
        const context = Lexer.fromString('a\\ b) c(')("stream");

        it('first token should be IDENTIFIER', () =>
            expect(Lexer.id(context)).to.equal(Lexer.TokenEnum.IDENTIFIER));
        it('second token should be LAMBDA', () =>
            expect(Lexer.id(Lexer.next(context))).to.equal(Lexer.TokenEnum.LAMBDA));
        it('third token should be IDENTIFIER', () =>
            expect(Lexer.id(Lexer.next(Lexer.next(context)))).to.equal(Lexer.TokenEnum.IDENTIFIER));
        it('forth token should be RIGHT_PAREN', () =>
            expect(Lexer.id(Lexer.next(Lexer.next(Lexer.next(context))))).to.equal(Lexer.TokenEnum.RIGHT_PAREN));
        it('fifth token should be IDENTIFIER', () =>
            expect(Lexer.id(Lexer.next(Lexer.next(Lexer.next(Lexer.next(context)))))).to.equal(Lexer.TokenEnum.IDENTIFIER));
        it('sixth token should be LEFT_PAREN', () =>
            expect(Lexer.id(Lexer.next(Lexer.next(Lexer.next(Lexer.next(Lexer.next(context))))))).to.equal(Lexer.TokenEnum.LEFT_PAREN));
        it('seventh token should be EOF', () =>
            expect(Lexer.id(Lexer.next(Lexer.next(Lexer.next(Lexer.next(Lexer.next(Lexer.next(context)))))))).to.equal(Lexer.TokenEnum.EOF));
    });

    describe('with selected input should return the correct tokens', () => {
        const items = [
            Tuple.Tuple('\\ ( ) { }')([Lexer.TokenEnum.LAMBDA, Lexer.TokenEnum.LEFT_PAREN, Lexer.TokenEnum.RIGHT_PAREN, Lexer.TokenEnum.LEFT_CURLY, Lexer.TokenEnum.RIGHT_CURLY, Lexer.TokenEnum.EOF]),
            Tuple.Tuple('== = ; ++ +')([Lexer.TokenEnum.EQUAL_EQUAL, Lexer.TokenEnum.EQUAL, Lexer.TokenEnum.SEMICOLON, Lexer.TokenEnum.PLUS_PLUS, Lexer.TokenEnum.PLUS, Lexer.TokenEnum.EOF]),
            Tuple.Tuple('-> - <= < >=')([Lexer.TokenEnum.MINUS_GREATER, Lexer.TokenEnum.MINUS, Lexer.TokenEnum.LESS_EQUAL, Lexer.TokenEnum.LESS, Lexer.TokenEnum.GREATER_EQUAL, Lexer.TokenEnum.EOF]),
            Tuple.Tuple('> * / ! as')([Lexer.TokenEnum.GREATER, Lexer.TokenEnum.STAR, Lexer.TokenEnum.SLASH, Lexer.TokenEnum.BANG, Lexer.TokenEnum.AS, Lexer.TokenEnum.EOF]),
            Tuple.Tuple('else false if import o')([Lexer.TokenEnum.ELSE, Lexer.TokenEnum.FALSE, Lexer.TokenEnum.IF, Lexer.TokenEnum.IMPORT, Lexer.TokenEnum.O, Lexer.TokenEnum.EOF]),
            Tuple.Tuple('then true hello\' h123_\'\' _123')([Lexer.TokenEnum.THEN, Lexer.TokenEnum.TRUE, Lexer.TokenEnum.IDENTIFIER, Lexer.TokenEnum.IDENTIFIER, Lexer.TokenEnum.IDENTIFIER, Lexer.TokenEnum.EOF])
        ];

        items.forEach(tuple => {
            it(Tuple.first(tuple), () => {
                let context = Lexer.fromString(Tuple.first(tuple))("stream");

                Tuple.second(tuple).forEach(token => {
                    expect(Lexer.id(context)).to.equal(token);
                    context = Lexer.next(context);
                })
            });
        });
    });

    describe('with input "\'a\'"', () => {
        const context = Lexer.fromString('\'a\'')("stream");

        it('should return CONSTANT_CHAR', () => expect(Lexer.id(context)).to.equal(Lexer.TokenEnum.CONSTANT_CHAR));
        it('should return text of "\'a\'"', () => expect(Lexer.text(context)).to.equal('\'a\''));
        it('should return EOF for next', () => expect(Lexer.id(Lexer.next(context))).to.equal(Lexer.TokenEnum.EOF));
    });

    describe('with input "\'\\\'\'"', () => {
        const context = Lexer.fromString('\'\\\'\'')("stream");

        it('should return CONSTANT_CHAR', () => expect(Lexer.id(context)).to.equal(Lexer.TokenEnum.CONSTANT_CHAR));
        it('should return text of "\'\\\'\'"', () => expect(Lexer.text(context)).to.equal('\'\\\'\''));
        it('should return EOF for next', () => expect(Lexer.id(Lexer.next(context))).to.equal(Lexer.TokenEnum.EOF));
    });

    describe('with input "\"hello \\"world\\"\""', () => {
        const context = Lexer.fromString('"hello \\" world"')("stream");

        it('should return CONSTANT_STRING', () => expect(Lexer.id(context)).to.equal(Lexer.TokenEnum.CONSTANT_STRING));
        it('should return text of "\\"hello \\" world\\""', () => expect(Lexer.text(context)).to.equal('"hello \\" world"'));
        it('should return EOF for next', () => expect(Lexer.id(Lexer.next(context))).to.equal(Lexer.TokenEnum.EOF));
    });

    describe('with input "file:../src/hello\\ world as"', () => {
        const context = Lexer.fromString('file:../src/hello\\ world as')("stream");

        it('should return CONSTANT_URL', () => expect(Lexer.id(context)).to.equal(Lexer.TokenEnum.CONSTANT_URL));
        it('should return text of "file:../src/hello\\ world"', () => expect(Lexer.text(context)).to.equal('file:../src/hello\\ world'));
        it('should return AS for next', () => expect(Lexer.id(Lexer.next(context))).to.equal(Lexer.TokenEnum.AS));
    });

    describe('with input "someID\n1 { a = b }" against the named source "bob.sl"', () => {
        const context = Lexer.fromString("someID\n1 { a = b }")('bob.sl');
        const contents = scanSource(context);

        it('should return 8 tokens', () => expect(contents.length).to.equal(8));
        it('should return the source name', () => expect(Lexer.sourceName(context)).to.equal('bob.sl'));
        it('should return 2 for line number of left curly', () => expect(Lexer.y(contents[2])).to.equal(2));
        it('should return " a = b " for the content between { and }', () => expect(Lexer.streamText(contents[2].indexXY + 1)(contents[6].indexXY - 1)(context)))
    });
});


function scanSource(source) {
    const result = [];
    let token = source;
    while (true) {
        result.push(token);
        if (Lexer.id(token) == Lexer.TokenEnum.EOF) {
            return result;
        } else {
            token = Lexer.next(token);
        }
    }
}