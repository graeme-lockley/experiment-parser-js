"use strict";

const FS = require('fs');
const VM = require('vm');

const Parser = require('../src/Parser');
const Translator = require('../src/Translator');
const expect = require("chai").expect;

function scenariosIn(directory) {
    forAllScenariosIn(directory, (name, input, expectations) =>
        describe(name, () => {
            const parseResponse = Parser.parseString(input);
            let parseResponseIsTested = false;

            if ('js' in expectations) {
                    parseResponseIsTested = true;
                it('should parse without any errors', () => {
                    expect(parseResponse.isOk()).to.equal(true);
                });

                it('produces the expected JavaScript', () => {
                    const translation = Translator.astToJavascript(parseResponse.getOkOrElse());

                    expect(translation).to.equal(expectations['js']);
                });
            }

            if ('error' in expectations) {
                it('should fail ', () =>
                    expect(parseResponse.isError()).to.be.true);

                it('with the expected error message ' + output, () =>
                    expect(parseResponse.getErrorOrElse()).to.equal(expectations['error']));
            }

            if ('ast' in expectations) {
                if (!parseResponseIsTested) {
                        parseResponseIsTested = true;
                    it('should parse without any errors', () => {
                        expect(parseResponse.isOk()).to.equal(true);
                    });
                }
                it('produces the expected AST', () =>
                    expect(JSON.stringify(parseResponse.getOkOrElse(), null, 2)).to.equal(expectations['ast']));
            }

            if ('run' in expectations) {
                if (!parseResponseIsTested) {
                    it('should parse without any errors', () => {
                        expect(parseResponse.isOk()).to.equal(true);
                    });
                }

                it('should return the expected result', () => {
                    const programme = Translator.astToJavascript(parseResponse.getOkOrElse());
                    const assertion = Translator.astToJavascript(Parser.parseExpressionString(expectations['run']).getOkOrElse());

                    const context = VM.createContext();
                    VM.runInContext(programme, context);
                    const result = VM.runInContext(assertion, context);

                    expect(result).to.equal(true);
                });
            }
        })
    );
}


function forAllScenariosIn(location, assertions) {
    FS.readdirSync(location).forEach(f => {
        const contents = FS.readFileSync(location + '/' + f).toString().split('\n');

        let name = '';
        let input = [];
        let currentExpectation;
        let expectations = {};
        let output = [];

        let state = 0;

        for (let index = 0; index < contents.length; index += 1) {
            if (state == 0) {
                name = contents[index].substring(2).trim();
                state = 1;
            } else if (state == 1) {
                if (contents[index].startsWith('--')) {
                    currentExpectation = contents[index].substring(2).trim();
                    output = [];
                    state = 3;
                } else {
                    input.push(contents[index]);
                }
            } else {
                if (contents[index].startsWith('--')) {
                    expectations[currentExpectation] = output.join('\n');
                    currentExpectation = contents[index].substring(2).trim();
                    output = [];
                } else {
                    output.push(contents[index]);
                }
            }
        }

        expectations[currentExpectation] = output.join('\n');

        assertions(name, input.join('\n'), expectations);
    });
}

module.exports = {
    scenariosIn
};