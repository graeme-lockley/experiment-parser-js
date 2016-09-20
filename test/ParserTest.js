"use strict";

var Result = require('../src/core/Result');
var Tuple = require('../src/core/Tuple');
var Parser = require("../src/Parser");
var Lexer = require("../src/Lexer");
var AST = require('../src/AST');
var Chai = require("../bower_components/chai/chai");

var expect = Chai.expect;

describe('Parser', function () {
    describe('given the input "123" to parseTerm', function () {
        var result = Parser.parseTerm(Lexer.fromString("123"));

        it("should parse without any errors", function () {
            expect(result.isOk()).to.equal(true);
        });
        it("should parse a CONSTANT_INTEGER with value 123", function () {
            expect(result.getOkOrElse().fst.type).to.equal(AST.ASTEnum.CONSTANT_INTEGER);
            expect(result.getOkOrElse().fst.value).to.equal(123);
        });
        it("should have the next token of EOF", function () {
            expect(result.getOkOrElse().snd.token.id).to.equal(Lexer.TokenEnum.EOF);
        });
    });

    describe('given the input "abc 123" to parseTerm', function () {
        var result = Parser.parseTerm(Lexer.fromString("abc 123"));

        it("should parse without any errors", function () {
            expect(result.isOk()).to.equal(true);
        });
        it('should parse an IDENTIFIER with value "abc"', function () {
            expect(result.getOkOrElse().fst.type).to.equal(AST.ASTEnum.IDENTIFIER);
            expect(result.getOkOrElse().fst.name).to.equal('abc');
        });
        it("should have the next token of CONSTANT_INTEGER", function () {
            expect(result.getOkOrElse().snd.token.id).to.equal(Lexer.TokenEnum.CONSTANT_INTEGER);
        });
    });

    describe('given the input "( 123)" to parseTerm', function () {
        var result = Parser.parseTerm(Lexer.fromString('( 123)'));

        it("should parse without any errors", function () {
            expect(result.isOk(result)).to.equal(true);
        });
        it("should parse a CONSTANT_INTEGER with value 123", function () {
            expect(result.getOkOrElse().fst.type).to.equal(AST.ASTEnum.CONSTANT_INTEGER);
            expect(result.getOkOrElse().fst.value).to.equal(123);
        });
        it("should have the next token of EOF", function () {
            expect(result.getOkOrElse().snd.token.id).to.equal(Lexer.TokenEnum.EOF);
        });
    });

    describe('given the input "\\a \\b -> (a)" to parseTerm', function () {
        var result = Parser.parseTerm(Lexer.fromString('\\a \\b -> (a)'));

        it("should parse without any errors", function () {
            expect(result.isOk()).to.equal(true);
        });
        it("should parse a LAMBDA with variables ['a', 'b'] and expression of IDENTIFIER with value 'a'", function () {
            expect(result.getOkOrElse().fst.type).to.equal(AST.ASTEnum.LAMBDA);
            expect(result.getOkOrElse().fst.variables.length).to.equal(2);
            expect(result.getOkOrElse().fst.variables[0]).to.equal('a');
            expect(result.getOkOrElse().fst.variables[1]).to.equal('b');
        });
        it("should have the next token of EOF", function () {
            expect(result.getOkOrElse().snd.token.id).to.equal(Lexer.TokenEnum.EOF);
        });
    });
});
