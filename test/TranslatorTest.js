"use strict";

const Parser = require('../src/Parser');
const Translator = require('../src/Translator');

const expect = require('chai').expect;


describe('Translator', () => {
    const input = '\\a \\b -> (a)';

    describe('translating the parsed input of "' + input + '" in JavaScript', () => {
        const parseResponse = Parser.parseString(input);

        it('is parsed without any errors', () =>
            expect(parseResponse.isOk()).to.be.true);

        it('is translated into', () =>
            expect(Translator.astToJavascript(parseResponse.getOkOrElse())).to.equal('a => (b => a)'));
    });
});
