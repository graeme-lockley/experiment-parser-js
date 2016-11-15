"use strict";

const FS = require('fs');
const {NodeVM} = require('vm2');

const Parser = require('../../src/compiler/Parser');
const Translator = require('../../src/compiler/Translator');
const Types = require('../../src/compiler/Types');

const Maybe = require('../../src/core/Maybe');
const Result = require('../../src/core/Result');
const Tuple = require('../../src/core/Tuple');

const expect = require("chai").expect;

function scenariosIn(directory) {
    forAllScenariosIn(directory, (name, input, expectations) =>
        describe(name, () => {
            const parseResponse = Parser.parseString(input)("stream");
            let parseResponseIsTested = false;

            if ('js' in expectations) {
                    parseResponseIsTested = true;
                it('should parse without any errors', () => {
                    expect(Result.isOk(parseResponse)).to.equal(true);
                });

                it('produces the expected JavaScript', () => {
                    const translation = Translator.astToJavascript(Result.withDefault()(parseResponse))(0);

                    expect(translation).to.equal(expectations['js']);
                });
            }

            if ('error' in expectations) {
                it('should fail ', () =>
                    expect(parseResponse.isError()).to.be.true);

                it('with the expected error message ' + output, () =>
                    expect(Result.errorWithDefault()(parseResponse)).to.equal(expectations['error']));
            }

            if ('ast' in expectations) {
                if (!parseResponseIsTested) {
                        parseResponseIsTested = true;
                    it('should parse without any errors', () => {
                        expect(Result.isOk(parseResponse)).to.equal(true);
                    });
                }
                it('produces the expected AST', () =>
                    expect(JSON.stringify(Result.withDefault()(parseResponse), null, 2)).to.equal(expectations['ast']));
            }

            if ('run' in expectations) {
                if (!parseResponseIsTested) {
                    it('should parse without any errors', () => {
                        expect(Result.isOk(parseResponse)).to.equal(true);
                    });
                }

                it('should return the expected result', () => {
                    const programme = Translator.astToJavascript(Result.withDefault()(parseResponse))(0);
                    const assertion = Translator.astToJavascript(Result.withDefault()(Parser.parseExpressionString(expectations['run'])))(0);

                    const vm = new NodeVM({
                        console: 'inherit',
                        sandbox: {},
                        require: {
                            external: true
                        },
                        wrapper: 'none',
                    });
                    const result = vm.run(programme + '\n\n' + 'return ' + assertion + ';', process.cwd() + '/test/lib');

                    expect(result).to.equal(true);
                });
            }

            if ('type' in expectations) {
                if (!parseResponseIsTested) {
                    it('should parse without any errors', () => {
                        expect(Result.isOk(parseResponse)).to.equal(true);
                    });
                }
                const typedAST = Types.typeCheckAST(Result.withDefault()(parseResponse));
                it("should be type checked", () => {
                    expect(Result.isOk(typedAST)).to.equal(true);
                });
                it("should have the corresponding type", () => {
                    const tuple = Result.withDefault()(typedAST);
                    expect(JSON.stringify(Tuple.second(tuple))).to.equal(expectations['type']);
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