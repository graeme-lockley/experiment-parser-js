"use strict";

var Lexer = require("../src/Lexer");
var Chai = require("../bower_components/chai/chai");

var expect = Chai.expect;

describe('Lexer', function () {
    describe('with input "Hello 123"', () => {
        var context = Lexer.fromString('Hello 123');

        describe('after initialisation', () => {
            it('should match to an IDENTIFIER', () => expect(context.token.id).to.equal(Lexer.TokenEnum.IDENTIFIER));
            it('should have the coordinates (1, 1)', () => {
                expect(context.token.x).to.equal(1);
                expect(context.token.y).to.equal(1);
            });
            it('should have the text "Hello"', () => expect(context.token.text).to.equal('Hello'));
        });

        describe('next token', () => {
            var nextContext = context.next();

            it('should match to a CONSTANT_INTEGER', () => expect(nextContext.token.id).to.equal(Lexer.TokenEnum.CONSTANT_INTEGER));
            it('should have the coordinates (7, 1)', ()=> {
                expect(nextContext.token.x).to.equal(7);
                expect(nextContext.token.y).to.equal(1);
            });
            it('should have the text "123"', () => expect(nextContext.token.text).to.equal("123"));
        });

        describe('next next token', () => {
            var nextNextContext = context.next().next();

            it('should report end-of-file', () => expect(nextNextContext.token.id).to.equal(Lexer.TokenEnum.EOF));
            it('should have the coordinates (10, 1)', ()=> {
                expect(nextNextContext.token.x).to.equal(10);
                expect(nextNextContext.token.y).to.equal(1);
            });
            it('should have the text ""', () => expect(nextNextContext.token.text).to.equal(""));
        });

        describe('next next next token', () => {
            var nextNextContext = context.next().next().next();

            it('should still report end-of-file', () => expect(nextNextContext.token.id).to.equal(Lexer.TokenEnum.EOF));
            it('should have the coordinates (10, 1)', () => {
                expect(nextNextContext.token.x).to.equal(10);
                expect(nextNextContext.token.y).to.equal(1);
            });
            it('should have the text ""', () => expect(nextNextContext.token.text).to.equal(""));
        });
    });

    describe('with input "a\\ b) c("', function () {
        var context = Lexer.fromString('a\\ b) c(');

        it('first token should be IDENTIFIER', () =>
            expect(context.token.id).to.equal(Lexer.TokenEnum.IDENTIFIER));
        it('second token should be LAMBDA', () =>
            expect(context.next().token.id).to.equal(Lexer.TokenEnum.LAMBDA));
        it('third token should be IDENTIFIER', () =>
            expect(context.next().next().token.id).to.equal(Lexer.TokenEnum.IDENTIFIER));
        it('forth token should be RPAREN', () =>
            expect(context.next().next().next().token.id).to.equal(Lexer.TokenEnum.RPAREN));
        it('fifth token should be IDENTIFIER', () =>
            expect(context.next().next().next().next().token.id).to.equal(Lexer.TokenEnum.IDENTIFIER));
        it('sixth token should be LPAREN', () =>
            expect(context.next().next().next().next().next().token.id).to.equal(Lexer.TokenEnum.LPAREN));
        it('seventh token should be EOF', () =>
            expect(context.next().next().next().next().next().next().token.id).to.equal(Lexer.TokenEnum.EOF));
    });
});