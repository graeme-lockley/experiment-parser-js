"use strict";

var Result = require('../src/core/Result');
var Tuple = require('../src/core/Tuple');
var Parser = require("../src/Parser");
var Lexer = require("../src/Lexer");
var AST = require('../src/AST');
var Chai = require("../bower_components/chai/chai");

var expect = Chai.expect;

describe('Parser', function () {
    // describe('given the input "((\\a \\b -> (add a b)) 10 200)"', function () {
    //     var result = Parser.parseString('((\\a \\b -> (add a b)) 10 200)');
    //
    //     it("should parse without any errors", function () {
    //         expect(result.isOk()).to.equal(true);
    //     });
    //
    //     it('the returned ADT, when pretty printed, should equal "BLAH"', function () {
    //
    //     });
    // });

    describe('given the input "123" to parseTerm', function () {
        var result = Parser.parseTerm(Lexer.fromString("123"));

        it("should parse without any errors", function () {
            expect(Result.isOk(result)).to.equal(true);
        });
        it("should parse a CONSTANT_INTEGER with value 123", function () {
            expect(Tuple.fst(Result.getOkOrElse(result)).type).to.equal(AST.ASTEnum.CONSTANT_INTEGER);
            expect(Tuple.fst(Result.getOkOrElse(result)).value).to.equal(123);
        });
        it("should have the next token of EOF", function () {
            expect(Tuple.snd(Result.getOkOrElse(result)).token.id).to.equal(Lexer.TokenEnum.EOF);
        });
    });

    describe('given the input "abc 123" to parseTerm', function () {
        var result = Parser.parseTerm(Lexer.fromString("abc 123"));

        it("should parse without any errors", function () {
            expect(Result.isOk(result)).to.equal(true);
        });
        it('should parse an IDENTIFIER with value "abc"', function () {
            expect(Tuple.fst(Result.getOkOrElse(result)).type).to.equal(AST.ASTEnum.IDENTIFIER);
            expect(Tuple.fst(Result.getOkOrElse(result)).value).to.equal('abc');
        });
        it("should have the next token of CONSTANT_INTEGER", function () {
            expect(Tuple.snd(Result.getOkOrElse(result)).token.id).to.equal(Lexer.TokenEnum.CONSTANT_INTEGER);
        });
    });

    describe('given the input "( 123)" to parseTerm', function () {
        var result = Parser.parseTerm(Lexer.fromString('( 123)'));

        it("should parse without any errors", function () {
            expect(Result.isOk(result)).to.equal(true);
        });
        it("should parse a CONSTANT_INTEGER with value 123", function () {
            expect(Tuple.fst(Result.getOkOrElse(result)).type).to.equal(AST.ASTEnum.CONSTANT_INTEGER);
            expect(Tuple.fst(Result.getOkOrElse(result)).value).to.equal(123);
        });
        it("should have the next token of EOF", function () {
            expect(Tuple.snd(Result.getOkOrElse(result)).token.id).to.equal(Lexer.TokenEnum.EOF);
        });
    });

    describe('given the input "\\a \\b -> (a)" to parseTerm', function () {
        var result = Parser.parseTerm(Lexer.fromString('\\a \\b -> (a)'));

        it("should parse without any errors", function () {
            expect(Result.isOk(result)).to.equal(true);
        });
        it("should parse a LAMBDA with variables ['a', 'b'] and expression of IDENTIFIER with value 'a'", function () {
            expect(Tuple.fst(Result.getOkOrElse(result)).type).to.equal(AST.ASTEnum.LAMBDA);
            expect(Tuple.fst(Result.getOkOrElse(result)).variables.length).to.equal(2);
            expect(Tuple.fst(Result.getOkOrElse(result)).variables[0]).to.equal('a');
            expect(Tuple.fst(Result.getOkOrElse(result)).variables[1]).to.equal('b');
        });
        it("should have the next token of EOF", function () {
            expect(Tuple.snd(Result.getOkOrElse(result)).token.id).to.equal(Lexer.TokenEnum.EOF);
        });
    });
});
