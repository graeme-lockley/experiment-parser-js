"use strict";

const Result = require('../../src/core/Result');
const Tuple = require('../../src/core/Tuple');
const Parser = require('../../src/compiler/Parser');
const Lexer = require('../../src/compiler/Lexer');
const AST = require('../../src/compiler/AST');

const TestUtils = require('./TestUtils');

const expect = require("chai").expect;

describe('Parser', function () {
    describe('given the input "123" to parseEXPR13', () => {
        const result = Parser.parseEXPR13(Lexer.fromString("123")("stream"));

        it("should parse without any errors", () =>
            expect(Result.isOk(result)).to.equal(true));
        it("should parse a CONSTANT_INTEGER with value 123", () => {
            expect(Tuple.first(Result.withDefault()(result)).type).to.equal("CONSTANT_INTEGER");
            expect(Tuple.first(Result.withDefault()(result)).value).to.equal(123);
        });
        it("should have the next token of EOF", () =>
            expect(Lexer.id(Tuple.second(Result.withDefault()(result)))).to.equal(Lexer.TokenEnum.EOF));
    });

    describe('given the input "abc 123" to parseEXPR13', () => {
        const result = Parser.parseEXPR13(Lexer.fromString("abc 123")("stream"));

        it("should parse without any errors", () =>
            expect(Result.isOk(result)).to.equal(true));
        it('should parse an IDENTIFIER with value "abc"', () => {
            expect(Tuple.first(Result.withDefault()(result)).type).to.equal("IDENTIFIER");
            expect(Tuple.first(Result.withDefault()(result)).name).to.equal('abc');
        });
        it("should have the next token of CONSTANT_INTEGER", () =>
            expect(Lexer.id(Tuple.second(Result.withDefault()(result)))).to.equal(Lexer.TokenEnum.CONSTANT_INTEGER));
    });

    describe('given the input "( 123)" to parseEXPR13', () => {
        const result = Parser.parseEXPR13(Lexer.fromString('( 123)')("stream"));

        it("should parse without any errors", ()=>
            expect(Result.isOk(result)).to.equal(true));
        it("should parse a CONSTANT_INTEGER with value 123", () => {
            expect(Tuple.first(Result.withDefault()(result)).type).to.equal("CONSTANT_INTEGER");
            expect(Tuple.first(Result.withDefault()(result)).value).to.equal(123);
        });
        it("should have the next token of EOF", () =>
            expect(Lexer.id(Tuple.second(Result.withDefault()(result)))).to.equal(Lexer.TokenEnum.EOF));
    });

    describe('given the input "\\a \\b -> (a)" to parseEXPR13', () => {
        const result = Parser.parseEXPR13(Lexer.fromString('\\a \\b -> (a)')("stream"));

        it("should parse without any errors", () => expect(Result.isOk(result)).to.equal(true));
        it("should parse a LAMBDA with variables ['a', 'b'] and expression of IDENTIFIER with value 'a'", () => {
            expect(Tuple.first(Result.withDefault()(result)).type).to.equal("LAMBDA");
            expect(Tuple.first(Result.withDefault()(result)).variable).to.equal('a');
            expect(Tuple.first(Result.withDefault()(result)).expression.variable).to.equal('b');
        });
        it("should have the next token of EOF", () =>
            expect(Lexer.id(Tuple.second(Result.withDefault()(result)))).to.equal(Lexer.TokenEnum.EOF));
    });

    TestUtils.scenariosIn('./test/scenarios/parser');
});
