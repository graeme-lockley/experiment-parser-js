"use strict";

const Lexer = require('../../src/compiler/Lexer');
const Translator = require('../../src/compiler/Translator');

const TestUtils = require('./TestUtils');

const expect = require('chai').expect;


describe('Translator', () => {
    describe("A string with special characters", () => {
        const s = "hello\nworld\ntoday";

        it("should be correctly marked up", () => {
            const markedUp = Translator.encodeString(s);
            expect(markedUp).to.equal("hello\\nworld\\ntoday");
        });
    });

    TestUtils.scenariosIn('./test/scenarios/translation');
});
