"use strict";

const Tuple = require('../src/core/Tuple');
const Lexer = require('../src/Lexer');
const expect = require('chai').expect;

describe('Lexer', function () {
    describe('with input "Hello 123"', () => {
        const context = Lexer.fromString('Hello 123');

        describe('after initialisation', () => {
            it('should match to an IDENTIFIER', () => expect(context.id).to.equal(Lexer.TokenEnum.IDENTIFIER));
            it('should have the coordinates (1, 1)', () => {
                expect(context.x).to.equal(1);
                expect(context.y).to.equal(1);
            });
            it('should have the text "Hello"', () => expect(context.text).to.equal('Hello'));
        });

        describe('next token', () => {
            const nextContext = context.next();

            it('should match to a CONSTANT_INTEGER', () => expect(nextContext.id).to.equal(Lexer.TokenEnum.CONSTANT_INTEGER));
            it('should have the coordinates (7, 1)', ()=> {
                expect(nextContext.x).to.equal(7);
                expect(nextContext.y).to.equal(1);
            });
            it('should have the text "123"', () => expect(nextContext.text).to.equal("123"));
        });

        describe('next next token', () => {
            const nextNextContext = context.next().next();

            it('should report end-of-file', () => expect(nextNextContext.id).to.equal(Lexer.TokenEnum.EOF));
            it('should have the coordinates (10, 1)', ()=> {
                expect(nextNextContext.x).to.equal(10);
                expect(nextNextContext.y).to.equal(1);
            });
            it('should have the text ""', () => expect(nextNextContext.text).to.equal(""));
        });

        describe('next next next token', () => {
            const nextNextContext = context.next().next().next();

            it('should still report end-of-file', () => expect(nextNextContext.id).to.equal(Lexer.TokenEnum.EOF));
            it('should have the coordinates (10, 1)', () => {
                expect(nextNextContext.x).to.equal(10);
                expect(nextNextContext.y).to.equal(1);
            });
            it('should have the text ""', () => expect(nextNextContext.text).to.equal(""));
        });
    });

    describe('with input "a\\ b) c("', () => {
        const context = Lexer.fromString('a\\ b) c(');

        it('first token should be IDENTIFIER', () =>
            expect(context.id).to.equal(Lexer.TokenEnum.IDENTIFIER));
        it('second token should be LAMBDA', () =>
            expect(context.next().id).to.equal(Lexer.TokenEnum.LAMBDA));
        it('third token should be IDENTIFIER', () =>
            expect(context.next().next().id).to.equal(Lexer.TokenEnum.IDENTIFIER));
        it('forth token should be RIGHT_PAREN', () =>
            expect(context.next().next().next().id).to.equal(Lexer.TokenEnum.RIGHT_PAREN));
        it('fifth token should be IDENTIFIER', () =>
            expect(context.next().next().next().next().id).to.equal(Lexer.TokenEnum.IDENTIFIER));
        it('sixth token should be LEFT_PAREN', () =>
            expect(context.next().next().next().next().next().id).to.equal(Lexer.TokenEnum.LEFT_PAREN));
        it('seventh token should be EOF', () =>
            expect(context.next().next().next().next().next().next().id).to.equal(Lexer.TokenEnum.EOF));
    });

    describe('with selected input should return the correct tokens', () => {
        const items = [
            Tuple.Tuple('\\ ( ) { }', [Lexer.TokenEnum.LAMBDA, Lexer.TokenEnum.LEFT_PAREN, Lexer.TokenEnum.RIGHT_PAREN, Lexer.TokenEnum.LEFT_CURLY, Lexer.TokenEnum.RIGHT_CURLY, Lexer.TokenEnum.EOF]),
            Tuple.Tuple('== = ; ++ +', [Lexer.TokenEnum.EQUAL_EQUAL, Lexer.TokenEnum.EQUAL, Lexer.TokenEnum.SEMICOLON, Lexer.TokenEnum.PLUS_PLUS, Lexer.TokenEnum.PLUS, Lexer.TokenEnum.EOF]),
            Tuple.Tuple('-> - <= < >=', [Lexer.TokenEnum.MINUS_GREATER, Lexer.TokenEnum.MINUS, Lexer.TokenEnum.LESS_EQUAL, Lexer.TokenEnum.LESS, Lexer.TokenEnum.GREATER_EQUAL, Lexer.TokenEnum.EOF]),
            Tuple.Tuple('> * / ! as', [Lexer.TokenEnum.GREATER, Lexer.TokenEnum.STAR, Lexer.TokenEnum.SLASH, Lexer.TokenEnum.BANG, Lexer.TokenEnum.AS, Lexer.TokenEnum.EOF]),
            Tuple.Tuple('else false if import o', [Lexer.TokenEnum.ELSE, Lexer.TokenEnum.FALSE, Lexer.TokenEnum.IF, Lexer.TokenEnum.IMPORT, Lexer.TokenEnum.O, Lexer.TokenEnum.EOF]),
            Tuple.Tuple('then true hello\' h123_\'\' _123', [Lexer.TokenEnum.THEN, Lexer.TokenEnum.TRUE, Lexer.TokenEnum.IDENTIFIER, Lexer.TokenEnum.IDENTIFIER, Lexer.TokenEnum.IDENTIFIER, Lexer.TokenEnum.EOF])
        ];

        items.forEach(tuple => {
            it(tuple.fst, () => {
                let context = Lexer.fromString(tuple.fst);

                tuple.snd.forEach(token => {
                    expect(context.id).to.equal(token);
                    context = context.next();
                })
            });
        });
    });

    describe('with input "\'a\'"', () => {
        const context = Lexer.fromString('\'a\'');

        it('should return CONSTANT_CHAR', () => expect(context.id).to.equal(Lexer.TokenEnum.CONSTANT_CHAR));
        it('should return text of "\'a\'"', () => expect(context.text).to.equal('\'a\''));
        it('should return EOF for next', () => expect(context.next().id).to.equal(Lexer.TokenEnum.EOF));
    });

    describe('with input "\'\\\'\'"', () => {
        const context = Lexer.fromString('\'\\\'\'');

        it('should return CONSTANT_CHAR', () => expect(context.id).to.equal(Lexer.TokenEnum.CONSTANT_CHAR));
        it('should return text of "\'\\\'\'"', () => expect(context.text).to.equal('\'\\\'\''));
        it('should return EOF for next', () => expect(context.next().id).to.equal(Lexer.TokenEnum.EOF));
    });

    describe('with input "\"hello \\"world\\"\""', () => {
        const context = Lexer.fromString('"hello \\" world"');

        it('should return CONSTANT_STRING', () => expect(context.id).to.equal(Lexer.TokenEnum.CONSTANT_STRING));
        it('should return text of "\\"hello \\" world\\""', () => expect(context.text).to.equal('"hello \\" world"'));
        it('should return EOF for next', () => expect(context.next().id).to.equal(Lexer.TokenEnum.EOF));
    });

    describe('with input "file:../src/hello\\ world as"', () => {
        const context = Lexer.fromString('file:../src/hello\\ world as');

        it('should return CONSTANT_URL', () => expect(context.id).to.equal(Lexer.TokenEnum.CONSTANT_URL));
        it('should return text of "file:../src/hello\\ world"', () => expect(context.text).to.equal('file:../src/hello\\ world'));
        it('should return AS for next', () => expect(context.next().id).to.equal(Lexer.TokenEnum.AS));
    });
});