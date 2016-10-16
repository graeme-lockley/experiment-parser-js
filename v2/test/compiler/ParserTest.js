"use strict";

const Result = require('../../src/core/Result');
const Tuple = require('../../src/core/Tuple');
const Parser = require('../../src/compiler/Parser');
const Lexer = require('../../src/compiler/Lexer');
const AST = require('../../src/compiler/AST');

const TestUtils = require('./TestUtils');

const expect = require("chai").expect;

describe('Parser', function () {
    describe('given the input "123" to parseEXPR12', () => {
        const result = Parser.parseEXPR12(Lexer.fromString("123"));

        it("should parse without any errors", () =>
            expect(Result.isOk(result)).to.equal(true));
        it("should parse a CONSTANT_INTEGER with value 123", () => {
            expect(Tuple.first(Result.withDefault()(result))).to.be.an.instanceOf(AST.ConstantInteger);
            expect(Tuple.first(Result.withDefault()(result)).value).to.equal(123);
        });
        it("should have the next token of EOF", () =>
            expect(Result.withDefault()(result).snd.id).to.equal(Lexer.TokenEnum.EOF));
    });

    describe('given the input "abc 123" to parseEXPR12', () => {
        const result = Parser.parseEXPR12(Lexer.fromString("abc 123"));

        it("should parse without any errors", () =>
            expect(Result.isOk(result)).to.equal(true));
        it('should parse an IDENTIFIER with value "abc"', () => {
            expect(Tuple.first(Result.withDefault()(result))).to.be.an.instanceOf(AST.Identifier);
            expect(Tuple.first(Result.withDefault()(result)).name).to.equal('abc');
        });
        it("should have the next token of CONSTANT_INTEGER", () =>
            expect(Result.withDefault()(result).snd.id).to.equal(Lexer.TokenEnum.CONSTANT_INTEGER));
    });

    describe('given the input "( 123)" to parseEXPR12', () => {
        const result = Parser.parseEXPR12(Lexer.fromString('( 123)'));

        it("should parse without any errors", ()=>
            expect(Result.isOk(result)).to.equal(true));
        it("should parse a CONSTANT_INTEGER with value 123", () => {
            expect(Tuple.first(Result.withDefault()(result))).to.be.an.instanceOf(AST.ConstantInteger);
            expect(Tuple.first(Result.withDefault()(result)).value).to.equal(123);
        });
        it("should have the next token of EOF", () =>
            expect(Result.withDefault()(result).snd.id).to.equal(Lexer.TokenEnum.EOF));
    });

    describe('given the input "\\a \\b -> (a)" to parseEXPR12', () => {
        const result = Parser.parseEXPR12(Lexer.fromString('\\a \\b -> (a)'));

        it("should parse without any errors", () => expect(Result.isOk(result)).to.equal(true));
        it("should parse a LAMBDA with variables ['a', 'b'] and expression of IDENTIFIER with value 'a'", () => {
            expect(Tuple.first(Result.withDefault()(result))).to.be.an.instanceOf(AST.Lambda);
            expect(Tuple.first(Result.withDefault()(result)).variables.length).to.equal(2);
            expect(Tuple.first(Result.withDefault()(result)).variables[0]).to.equal('a');
            expect(Tuple.first(Result.withDefault()(result)).variables[1]).to.equal('b');
        });
        it("should have the next token of EOF", () =>
            expect(Result.withDefault()(result).snd.id).to.equal(Lexer.TokenEnum.EOF));
    });

    TestUtils.scenariosIn('./test/scenarios/parser');
});
