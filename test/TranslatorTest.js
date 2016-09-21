"use strict";

const Parser = require('../src/Parser');
const Translator = require('../src/Translator');

const expect = require('chai').expect;


describe('Translator', () => {
    describe('translating the parsed input of "' + '\\a \\b -> (add a b)' + '" in JavaScript', () => {
        const parseResponse = Parser.parseString('\\a \\b -> (add a b)');

        it('is parsed without any errors', () =>
            expect(parseResponse.isOk()).to.be.true);

        it('is translated into', () =>
            expect(Translator.astToJavascript(parseResponse.getOkOrElse())).to.equal('a => (b => add(a)(b))'));
    });
});
