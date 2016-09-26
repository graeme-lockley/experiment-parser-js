"use strict";

const Lexer = require("../src/Lexer");
const expect = require("chai").expect;

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

    describe('with input "a\\ b) c("', function () {
        const context = Lexer.fromString('a\\ b) c(');

        it('first token should be IDENTIFIER', () =>
            expect(context.id).to.equal(Lexer.TokenEnum.IDENTIFIER));
        it('second token should be LAMBDA', () =>
            expect(context.next().id).to.equal(Lexer.TokenEnum.LAMBDA));
        it('third token should be IDENTIFIER', () =>
            expect(context.next().next().id).to.equal(Lexer.TokenEnum.IDENTIFIER));
        it('forth token should be RPAREN', () =>
            expect(context.next().next().next().id).to.equal(Lexer.TokenEnum.RPAREN));
        it('fifth token should be IDENTIFIER', () =>
            expect(context.next().next().next().next().id).to.equal(Lexer.TokenEnum.IDENTIFIER));
        it('sixth token should be LPAREN', () =>
            expect(context.next().next().next().next().next().id).to.equal(Lexer.TokenEnum.LPAREN));
        it('seventh token should be EOF', () =>
            expect(context.next().next().next().next().next().next().id).to.equal(Lexer.TokenEnum.EOF));
    });
});