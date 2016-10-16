"use strict";

const Result = require('../../src/core/Result');
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
            expect(Result.withDefault()(result).fst).to.be.an.instanceOf(AST.ConstantInteger);
            expect(Result.withDefault()(result).fst.value).to.equal(123);
        });
        it("should have the next token of EOF", () =>
            expect(Result.withDefault()(result).snd.id).to.equal(Lexer.TokenEnum.EOF));
    });

    describe('given the input "abc 123" to parseEXPR12', () => {
        const result = Parser.parseEXPR12(Lexer.fromString("abc 123"));

        it("should parse without any errors", () =>
            expect(Result.isOk(result)).to.equal(true));
        it('should parse an IDENTIFIER with value "abc"', () => {
            expect(Result.withDefault()(result).fst).to.be.an.instanceOf(AST.Identifier);
            expect(Result.withDefault()(result).fst.name).to.equal('abc');
        });
        it("should have the next token of CONSTANT_INTEGER", () =>
            expect(Result.withDefault()(result).snd.id).to.equal(Lexer.TokenEnum.CONSTANT_INTEGER));
    });

    describe('given the input "( 123)" to parseEXPR12', () => {
        const result = Parser.parseEXPR12(Lexer.fromString('( 123)'));

        it("should parse without any errors", ()=>
            expect(Result.isOk(result)).to.equal(true));
        it("should parse a CONSTANT_INTEGER with value 123", () => {
            expect(Result.withDefault()(result).fst).to.be.an.instanceOf(AST.ConstantInteger);
            expect(Result.withDefault()(result).fst.value).to.equal(123);
        });
        it("should have the next token of EOF", () =>
            expect(Result.withDefault()(result).snd.id).to.equal(Lexer.TokenEnum.EOF));
    });

    describe('given the input "\\a \\b -> (a)" to parseEXPR12', () => {
        const result = Parser.parseEXPR12(Lexer.fromString('\\a \\b -> (a)'));

        it("should parse without any errors", () => expect(Result.isOk(result)).to.equal(true));
        it("should parse a LAMBDA with variables ['a', 'b'] and expression of IDENTIFIER with value 'a'", () => {
            expect(Result.withDefault()(result).fst).to.be.an.instanceOf(AST.Lambda);
            expect(Result.withDefault()(result).fst.variables.length).to.equal(2);
            expect(Result.withDefault()(result).fst.variables[0]).to.equal('a');
            expect(Result.withDefault()(result).fst.variables[1]).to.equal('b');
        });
        it("should have the next token of EOF", () =>
            expect(Result.withDefault()(result).snd.id).to.equal(Lexer.TokenEnum.EOF));
    });

    TestUtils.scenariosIn('./test/scenarios/parser');
});
