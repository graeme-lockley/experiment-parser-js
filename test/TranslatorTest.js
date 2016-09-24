"use strict";

const Lexer = require('../src/Lexer');
const Parser = require('../src/Parser');
const Translator = require('../src/Translator');

const expect = require('chai').expect;


describe('Translator', () => {
    describe('translating the parsed input of "' + '\\a \\b -> (add a b)' + '" in JavaScript', () => {
        const parseResponse = Parser.parseString('\\a \\b -> (add a b)');

        it('is parsed without any errors', () =>
            expect(parseResponse.isOk()).to.be.true);

        it('is translated into', () => {
            const translation = Translator.astToJavascript(parseResponse.getOkOrElse());

            expect(translation).to.equal('a => (b => add(a)(b))')
        });
    });

    describe('given the declaration "pi = 3"', () => {
        const parseResponse = Parser.parseDECLS(Lexer.fromString('pi = 3'));

        it('should parse without any errors', () =>
            expect(parseResponse.isOk()).to.be.true);

        it('is translated into correct JavaScript', () => {
            const translation = Translator.astToJavascript(parseResponse.getOkOrElse().fst);

            expect(translation).to.equal('const pi = 3;');
        });
    });

    // describe('given the declaration "add a b = (plus a b)"', () => {
    //     const parseResponse = Parser.parseDECLS(Lexer.fromString('add a b = (plus a b)'));
    //
    //     it('should parse without any errors', () =>
    //         expect(parseResponse.isOk()).to.be.true);
    //
    //     it('is translated into correct JavaScript', () => {
    //         const translation = Translator.astToJavascript(parseResponse.getOkOrElse().fst);
    //
    //         expect(translation).to.equal('function add(a) {\n  return b => plus(a)(b);\n}\n');
    //     });
    // });
});
