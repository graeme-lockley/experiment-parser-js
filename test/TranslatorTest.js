"use strict";

const Lexer = require('../src/Lexer');
const Parser = require('../src/Parser');
const Translator = require('../src/Translator');

const TestUtils = require('./TestUtils');

const expect = require('chai').expect;


describe('Translator', () => {
    describe('given the declaration "pi = 3;"', () => {
        const parseResponse = Parser.parseString('pi = 3;');

        it('should parse without any errors', () =>
            expect(parseResponse.isOk()).to.be.true);

        it('is translated into correct JavaScript', () => {
            const translation = Translator.astToJavascript(parseResponse.getOkOrElse());

            expect(translation).to.equal('const pi = 3;');
        });
    });

    describe('given the declaration "add a b = plus a b;"', () => {
        const parseResponse = Parser.parseString('add a b = plus a b;');

        it('should parse without any errors', () =>
            expect(parseResponse.isOk()).to.be.true);

        it('is translated into correct JavaScript', () => {
            const translation = Translator.astToJavascript(parseResponse.getOkOrElse());

            expect(translation).to.equal('function add(a) {\n  return b => plus(a)(b);\n}');
        });
    });

    TestUtils.scenariosIn('./test/scenarios/translation');
});
