var Lexer = require("../src/Lexer");
var Chai = require("../bower_components/chai/chai");

var expect = Chai.expect;

describe('Lexer', function () {
    describe('with input "Hello 123"', function () {
        var context = Lexer.fromString('Hello 123');

        describe('after initialisation', function () {
            it('should match to an IDENTIFIER', function () {
                expect(context.token.id).to.equal(Lexer.TokenEnum.IDENTIFIER);

            });
            it('should have the coordinates (1, 1)', function () {
                expect(context.token.x).to.equal(1);
                expect(context.token.y).to.equal(1);
            });
            it('should have the text "Hello"', function () {
                expect(context.token.text).to.equal('Hello');
            });
        });

        describe('next token', function () {
            var nextContext = context.next();

            it('should match to a CONSTANT_INTEGER', function () {
                expect(nextContext.token.id).to.equal(Lexer.TokenEnum.CONSTANT_INTEGER);
            });
            it('should have the coordinates (7, 1)', function () {
                expect(nextContext.token.x).to.equal(7);
                expect(nextContext.token.y).to.equal(1);
            });
            it('should have the text "123"', function () {
                expect(nextContext.token.text).to.equal("123");
            });
        });

        describe('next next token', function () {
            var nextNextContext = context.next().next();

            it('should report end-of-file', function () {
                expect(nextNextContext.token.id).to.equal(Lexer.TokenEnum.EOF);
            });
            it('should have the coordinates (10, 1)', function () {
                expect(nextNextContext.token.x).to.equal(10);
                expect(nextNextContext.token.y).to.equal(1);
            });
            it('should have the text ""', function () {
                expect(nextNextContext.token.text).to.equal("");
            });
        });

        describe('next next next token', function () {
            var nextNextContext = context.next().next().next();

            it('should still report end-of-file', function () {
                expect(nextNextContext.token.id).to.equal(Lexer.TokenEnum.EOF);
            });
            it('should have the coordinates (10, 1)', function () {
                expect(nextNextContext.token.x).to.equal(10);
                expect(nextNextContext.token.y).to.equal(1);
            });
            it('should have the text ""', function () {
                expect(nextNextContext.token.text).to.equal("");
            });
        });
    });
});