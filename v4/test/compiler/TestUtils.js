"use strict";

const FS = require('fs');
const {NodeVM} = require('vm2');

const Infer = require('../../src/compiler/types/Infer');
const Solver = require('../../src/compiler/types/Solver');
const Parser = require('../../src/compiler/Parser');
const Translator = require('../../src/compiler/Translator');
const Types = require('../../src/compiler/Types');

const Maybe = require('../../src/core/Maybe');
const Result = require('../../src/core/Result');
const Tuple = require('../../src/core/Tuple');
const ObjectHelper = require('../../src/core/ObjectHelper');


const expect = require("chai").expect;

function scenariosIn(directory) {
    forAllScenariosIn(directory, (name, input, expectations) =>
        describe(name, () => {
            let parseResponse;

            it ('should parse', () => {
                parseResponse = Parser.parseString(input)("stream");
            });

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
                    expect(!Result.isOk(parseResponse)).to.equal(true));

                it('with the expected error message ' + expectations['error'], () =>
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
                    expect(ObjectHelper.show(Result.withDefault()(parseResponse))).to.equal(expectations['ast']));
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
                let moduleTypeResult;
                it("should be type checked", () => {
                    moduleTypeResult = Types.inferModuleType(Result.withDefault()(parseResponse));
                    expect(Result.isOk(moduleTypeResult)).to.equal(true);
                });
                it("should have the corresponding type", () => {
                    const moduleType = Result.flatMap(ok => Types.show(ok))(error => error)(moduleTypeResult);
                    expect(moduleType).to.equal(expectations['type']);
                });
            }

            if ('typeError' in expectations) {
                if (!parseResponseIsTested) {
                    it('should parse without any errors', () => {
                        expect(Result.isOk(parseResponse)).to.equal(true);
                    });
                }
                let moduleTypeResult;
                it("should fail when attempting to type check", () => {
                    moduleTypeResult = Types.inferModuleType(Result.withDefault()(parseResponse));
                    expect(Result.isOk(moduleTypeResult)).to.equal(false);
                });
                it("should have the expected error message", () => {
                    const errorMessage = Result.errorWithDefault("unknown")(moduleTypeResult);
                    expect(errorMessage).to.equal(expectations['typeError']);
                });
            }

            if ('inferType' in expectations) {
                if (!parseResponseIsTested) {
                    it('should parse without any errors', () => {
                        expect(Result.isOk(parseResponse)).to.equal(true);
                    });
                }
                let inferResult;
                it("should infer type", () => {
                    inferResult = Infer.infer(Result.withDefault()(parseResponse))(Infer.initialState);
                    expect(Result.isOk(inferResult)).to.equal(true);
                });
                it("should have the expected response", () => {
                    const moduleTypeAsString = ObjectHelper.show(inferResult);
                    expect(moduleTypeAsString).to.equal(expectations['inferType']);
                });
            }

            if ('unify' in expectations) {
                if (!parseResponseIsTested) {
                    it('should parse without any errors', () => {
                        expect(Result.isOk(parseResponse)).to.equal(true);
                    });
                }

                it ('should unify', () => {
                    const inferResult = Infer.infer(Result.withDefault()(parseResponse))(Infer.initialState);
                    expect(ObjectHelper.show(Solver.unify(inferResult._ok._snd.constraints))).to.equal(expectations['unify']);
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

        assertions(f + ": " + name, input.join('\n'), expectations);
    });
}

module.exports = {
    scenariosIn
};