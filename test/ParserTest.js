"use strict";

const FS = require('fs');

const Result = require('../src/core/Result');
const Parser = require("../src/Parser");
const Lexer = require("../src/Lexer");
const AST = require('../src/AST');

const expect = require("chai").expect;

describe('Parser', function () {
    describe('given the input "123" to parseTerm', () => {
        const result = Parser.parseTerm(Lexer.fromString("123"));

        it("should parse without any errors", () =>
            expect(result.isOk()).to.equal(true));
        it("should parse a CONSTANT_INTEGER with value 123", () => {
            expect(result.getOkOrElse().fst).to.be.an.instanceOf(AST.ConstantInteger);
            expect(result.getOkOrElse().fst.value).to.equal(123);
        });
        it("should have the next token of EOF", () =>
            expect(result.getOkOrElse().snd.id).to.equal(Lexer.TokenEnum.EOF));
    });

    describe('given the input "abc 123" to parseTerm', () => {
        const result = Parser.parseTerm(Lexer.fromString("abc 123"));

        it("should parse without any errors", () =>
            expect(result.isOk()).to.equal(true));
        it('should parse an IDENTIFIER with value "abc"', () => {
            expect(result.getOkOrElse().fst).to.be.an.instanceOf(AST.Identifier);
            expect(result.getOkOrElse().fst.name).to.equal('abc');
        });
        it("should have the next token of CONSTANT_INTEGER", () =>
            expect(result.getOkOrElse().snd.id).to.equal(Lexer.TokenEnum.CONSTANT_INTEGER));
    });

    describe('given the input "( 123)" to parseTerm', () => {
        const result = Parser.parseTerm(Lexer.fromString('( 123)'));

        it("should parse without any errors", ()=>
            expect(result.isOk(result)).to.equal(true));
        it("should parse a CONSTANT_INTEGER with value 123", () => {
            expect(result.getOkOrElse().fst).to.be.an.instanceOf(AST.ConstantInteger);
            expect(result.getOkOrElse().fst.value).to.equal(123);
        });
        it("should have the next token of EOF", () =>
            expect(result.getOkOrElse().snd.id).to.equal(Lexer.TokenEnum.EOF));
    });

    describe('given the input "\\a \\b -> (a)" to parseTerm', () => {
        const result = Parser.parseTerm(Lexer.fromString('\\a \\b -> (a)'));

        it("should parse without any errors", () => expect(result.isOk()).to.equal(true));
        it("should parse a LAMBDA with variables ['a', 'b'] and expression of IDENTIFIER with value 'a'", () => {
            expect(result.getOkOrElse().fst).to.be.an.instanceOf(AST.Lambda);
            expect(result.getOkOrElse().fst.variables.length).to.equal(2);
            expect(result.getOkOrElse().fst.variables[0]).to.equal('a');
            expect(result.getOkOrElse().fst.variables[1]).to.equal('b');
        });
        it("should have the next token of EOF", () =>
            expect(result.getOkOrElse().snd.id).to.equal(Lexer.TokenEnum.EOF));
    });

    forAllScenariosIn('./test/scenarios/parser', (name, input, expectation, output) =>
        describe(name, () => {
            const parseResponse = Parser.parseString(input);

            if (expectation == 'js') {
                it('should parse without any errors', () =>
                    expect(parseResponse.isOk()).to.be.true);

                it('produces the expected JavaScript', () => {
                    const translation = Translator.astToJavascript(parseResponse.getOkOrElse().fst);

                    expect(translation).to.equal(output);
                });
            } else if (expectation == 'error') {
                it('should fail ', () =>
                    expect(parseResponse.isError()).to.be.true);

                it('with the expected error message ' + output, () =>
                    expect(parseResponse.getErrorOrElse()).should.equal(output));
            } else if (expectation == 'ast') {
                it('should parse without any errors', () =>
                    expect(parseResponse.isOk()).to.be.true);
                it('produces the expected AST', () =>
                    expect(JSON.stringify(parseResponse.getOkOrElse(), null, 2)).to.equal(output));
            } else {
                it('expectation should be "js" or "error"', () =>
                    expect(expectation).to.be.oneOf(['error', 'js']));
            }
        })
    );
});


function forAllScenariosIn(location, assertions) {
    FS.readdirSync(location).forEach(f => {
        const contents = FS.readFileSync(location + '/' + f).toString().split('\n');

        let name = '';
        let input = [];
        let expectation = '';
        let output = [];

        let state = 0;

        for (let index = 0; index < contents.length; index += 1) {
            if (state == 0) {
                name = contents[index].substring(2).trim();
                state = 1;
            } else if (state == 1) {
                if (contents[index].startsWith('--')) {
                    expectation = contents[index].substring(2).trim();
                    state = 3;
                } else {
                    input.push(contents[index]);
                }
            } else {
                output.push(contents[index]);
            }
        }

        assertions(name, input.join('\n'), expectation, output.join('\n'));
    });
}
