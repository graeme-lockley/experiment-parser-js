"use strict";

const FS = require('fs');
const Parser = require('../src/Parser');
const Translator = require('../src/Translator');
const expect = require("chai").expect;

function scenariosIn(directory) {
    forAllScenariosIn(directory, (name, input, expectation, output) =>
        describe(name, () => {
            const parseResponse = Parser.parseString(input);

            if (expectation == 'js') {
                it('should parse without any errors', () =>
                    expect(parseResponse.isOk()).to.be.true);

                it('produces the expected JavaScript', () => {
                    const translation = Translator.astToJavascript(parseResponse.getOkOrElse());

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
}


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

module.exports = {
    scenariosIn
};