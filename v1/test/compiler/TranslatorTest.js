"use strict";

const Lexer = require('../../src/compiler/Lexer');
const Translator = require('../../src/compiler/Translator');

const TestUtils = require('./TestUtils');


describe('Translator', () => {
    TestUtils.scenariosIn('./test/scenarios/translation');
});
